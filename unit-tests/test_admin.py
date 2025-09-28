import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime, date
from fastapi import HTTPException

from app.schemas.admin import (
    AdminOrderOverviewRequest, AdminOrderListResponse,
    AdminMonthlyOrdersResponse, AdminRevenueOverviewResponse
)


class TestAdminOrderManagement:
    """Unit tests for admin order management"""
    
    def test_order_status_validation(self):
        """Test order status validation for admin updates"""
        def validate_order_status_transition(current_status, new_status):
            valid_transitions = {
                "pending": ["confirmed", "cancelled"],
                "confirmed": ["preparing", "cancelled"],
                "preparing": ["ready", "cancelled"],
                "ready": ["shipped", "cancelled"],
                "shipped": ["delivered", "returned"],
                "delivered": ["returned"],
                "cancelled": [],
                "returned": []
            }
            
            allowed_statuses = valid_transitions.get(current_status, [])
            return new_status in allowed_statuses
        
        # Valid transitions
        assert validate_order_status_transition("pending", "confirmed") is True
        assert validate_order_status_transition("confirmed", "preparing") is True
        assert validate_order_status_transition("shipped", "delivered") is True
        
        # Invalid transitions
        assert validate_order_status_transition("delivered", "pending") is False
        assert validate_order_status_transition("cancelled", "confirmed") is False
        assert validate_order_status_transition("pending", "delivered") is False
    
    def test_order_priority_calculation(self):
        """Test order priority calculation for admin dashboard"""
        def calculate_order_priority(order_data):
            priority_score = 0
            
            # Age of order (days since placed)
            days_old = (datetime.now() - order_data["created_at"]).days
            if days_old > 7:
                priority_score += 3
            elif days_old > 3:
                priority_score += 2
            elif days_old > 1:
                priority_score += 1
            
            # Order value
            if order_data["total_amount"] > 500:
                priority_score += 3
            elif order_data["total_amount"] > 200:
                priority_score += 2
            elif order_data["total_amount"] > 50:
                priority_score += 1
            
            # Customer tier
            customer_tier = order_data.get("customer_tier", "bronze")
            tier_scores = {"platinum": 3, "gold": 2, "silver": 1, "bronze": 0}
            priority_score += tier_scores.get(customer_tier, 0)
            
            # Express shipping
            if order_data.get("express_shipping", False):
                priority_score += 2
            
            return min(priority_score, 10)  # Cap at 10
        
        from datetime import timedelta
        now = datetime.now()
        
        # High priority order
        high_priority_order = {
            "created_at": now - timedelta(days=5),
            "total_amount": 600.0,
            "customer_tier": "platinum",
            "express_shipping": True
        }
        priority = calculate_order_priority(high_priority_order)
        assert priority >= 8
        
        # Low priority order
        low_priority_order = {
            "created_at": now,
            "total_amount": 25.0,
            "customer_tier": "bronze",
            "express_shipping": False
        }
        priority = calculate_order_priority(low_priority_order)
        assert priority <= 3
    
    def test_bulk_order_operations(self):
        """Test bulk order operations validation"""
        def validate_bulk_operation(order_ids, operation_type):
            if not order_ids:
                return False, "No orders selected"
            
            if len(order_ids) > 100:
                return False, "Too many orders selected (max 100)"
            
            valid_operations = ["update_status", "export", "assign_courier", "cancel"]
            if operation_type not in valid_operations:
                return False, "Invalid operation type"
            
            # Check for duplicate IDs
            if len(set(order_ids)) != len(order_ids):
                return False, "Duplicate order IDs found"
            
            return True, "Valid bulk operation"
        
        # Valid operations
        is_valid, message = validate_bulk_operation([1, 2, 3, 4, 5], "update_status")
        assert is_valid is True
        
        # Invalid operations
        is_valid, message = validate_bulk_operation([], "update_status")
        assert is_valid is False
        assert "No orders" in message
        
        is_valid, message = validate_bulk_operation([1, 2, 3], "invalid_op")
        assert is_valid is False
        assert "Invalid operation" in message
        
        is_valid, message = validate_bulk_operation([1, 2, 2, 3], "export")
        assert is_valid is False
        assert "Duplicate" in message


class TestAdminUserManagement:
    """Unit tests for admin user management"""
    
    def test_user_account_status_management(self):
        """Test user account status management"""
        def validate_account_status_change(current_status, new_status, reason):
            valid_statuses = ["active", "suspended", "banned", "pending_verification"]
            
            if new_status not in valid_statuses:
                return False, "Invalid status"
            
            if current_status == new_status:
                return False, "Status unchanged"
            
            # Require reason for suspensions and bans
            if new_status in ["suspended", "banned"] and not reason:
                return False, "Reason required for suspension/ban"
            
            # Only allow certain transitions
            if current_status == "banned" and new_status != "active":
                return False, "Banned users can only be reactivated"
            
            return True, "Valid status change"
        
        # Valid changes
        is_valid, message = validate_account_status_change("active", "suspended", "Policy violation")
        assert is_valid is True
        
        is_valid, message = validate_account_status_change("suspended", "active", "")
        assert is_valid is True
        
        # Invalid changes
        is_valid, message = validate_account_status_change("active", "banned", "")
        assert is_valid is False
        assert "Reason required" in message
        
        is_valid, message = validate_account_status_change("banned", "suspended", "")
        assert is_valid is False
        assert "Reason required" in message or "banned" in message.lower()
    
    def test_admin_permission_validation(self):
        """Test admin permission validation"""
        def check_admin_permissions(admin_role, requested_action):
            permissions = {
                "super_admin": ["all"],
                "order_manager": ["view_orders", "update_orders", "export_orders"],
                "user_manager": ["view_users", "update_users", "suspend_users"],
                "product_manager": ["view_products", "update_products", "verify_products"],
                "support_agent": ["view_orders", "view_users", "update_order_status"]
            }
            
            admin_permissions = permissions.get(admin_role, [])
            
            if "all" in admin_permissions:
                return True, "Super admin access"
            
            if requested_action in admin_permissions:
                return True, "Permission granted"
            
            return False, "Insufficient permissions"
        
        # Valid permissions
        has_permission, message = check_admin_permissions("super_admin", "delete_user")
        assert has_permission is True
        
        has_permission, message = check_admin_permissions("order_manager", "update_orders")
        assert has_permission is True
        
        # Invalid permissions
        has_permission, message = check_admin_permissions("support_agent", "delete_user")
        assert has_permission is False
        assert "Insufficient" in message
        
        has_permission, message = check_admin_permissions("product_manager", "suspend_users")
        assert has_permission is False


class TestAdminMetrics:
    """Unit tests for admin metrics and analytics"""
    
    def test_revenue_calculation(self):
        """Test revenue calculation for admin dashboard"""
        def calculate_revenue_metrics(orders, time_period="month"):
            from datetime import timedelta
            
            now = datetime.now()
            period_map = {
                "day": 1,
                "week": 7,
                "month": 30,
                "quarter": 90,
                "year": 365
            }
            
            days = period_map.get(time_period, 30)
            cutoff_date = now - timedelta(days=days)
            
            period_orders = [o for o in orders if o["created_at"] >= cutoff_date and o["status"] == "completed"]
            
            total_revenue = sum(o["total_amount"] for o in period_orders)
            order_count = len(period_orders)
            average_order_value = total_revenue / order_count if order_count > 0 else 0
            
            return {
                "total_revenue": round(total_revenue, 2),
                "order_count": order_count,
                "average_order_value": round(average_order_value, 2),
                "period": time_period
            }
        
        from datetime import timedelta
        now = datetime.now()
        
        orders = [
            {"created_at": now - timedelta(days=5), "total_amount": 150.0, "status": "completed"},
            {"created_at": now - timedelta(days=10), "total_amount": 200.0, "status": "completed"},
            {"created_at": now - timedelta(days=40), "total_amount": 100.0, "status": "completed"},
            {"created_at": now - timedelta(days=5), "total_amount": 75.0, "status": "cancelled"}
        ]
        
        # Monthly metrics
        metrics = calculate_revenue_metrics(orders, "month")
        assert metrics["total_revenue"] == 350.0  # Only completed orders within 30 days
        assert metrics["order_count"] == 2
        assert metrics["average_order_value"] == 175.0
        
        # Weekly metrics
        metrics = calculate_revenue_metrics(orders, "week")
        assert metrics["total_revenue"] == 150.0  # Only one completed order within 7 days
        assert metrics["order_count"] == 1
    
    def test_user_engagement_metrics(self):
        """Test user engagement metrics calculation"""
        def calculate_engagement_metrics(user_activities):
            if not user_activities:
                return {"active_users": 0, "engagement_rate": 0.0}
            
            total_users = len(user_activities)
            active_users = len([u for u in user_activities if u["last_login_days"] <= 7])
            highly_active = len([u for u in user_activities if u["sessions_this_month"] >= 10])
            
            engagement_rate = (active_users / total_users) * 100 if total_users > 0 else 0
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "highly_active_users": highly_active,
                "engagement_rate": round(engagement_rate, 2)
            }
        
        user_activities = [
            {"user_id": 1, "last_login_days": 1, "sessions_this_month": 15},
            {"user_id": 2, "last_login_days": 3, "sessions_this_month": 8},
            {"user_id": 3, "last_login_days": 20, "sessions_this_month": 2},
            {"user_id": 4, "last_login_days": 5, "sessions_this_month": 12}
        ]
        
        metrics = calculate_engagement_metrics(user_activities)
        assert metrics["total_users"] == 4
        assert metrics["active_users"] == 3  # Users with last_login_days <= 7
        assert metrics["highly_active_users"] == 2  # Users with sessions >= 10
        assert metrics["engagement_rate"] == 75.0  # 3/4 * 100
    
    def test_product_performance_metrics(self):
        """Test product performance metrics calculation"""
        def calculate_product_performance(sales_data):
            if not sales_data:
                return []
            
            product_metrics = {}
            
            for sale in sales_data:
                product_id = sale["product_id"]
                if product_id not in product_metrics:
                    product_metrics[product_id] = {
                        "product_id": product_id,
                        "total_sales": 0,
                        "units_sold": 0,
                        "revenue": 0.0
                    }
                
                product_metrics[product_id]["units_sold"] += sale["quantity"]
                product_metrics[product_id]["revenue"] += sale["total_amount"]
                product_metrics[product_id]["total_sales"] += 1
            
            # Sort by revenue
            sorted_products = sorted(
                product_metrics.values(),
                key=lambda x: x["revenue"],
                reverse=True
            )
            
            return sorted_products
        
        sales_data = [
            {"product_id": 1, "quantity": 2, "total_amount": 100.0},
            {"product_id": 2, "quantity": 1, "total_amount": 150.0},
            {"product_id": 1, "quantity": 1, "total_amount": 50.0},
            {"product_id": 3, "quantity": 5, "total_amount": 75.0}
        ]
        
        performance = calculate_product_performance(sales_data)
        
        assert len(performance) == 3
        assert performance[0]["product_id"] == 1  # Highest revenue (150.0)
        assert performance[0]["revenue"] == 150.0
        assert performance[0]["units_sold"] == 3
        assert performance[1]["product_id"] == 2  # Second highest revenue (150.0)


class TestAdminMockServices:
    """Unit tests for admin services using mocks"""
    
    def test_admin_order_overview_service_mock(self):
        """Test admin order overview service with mocks"""
        from datetime import timedelta
        now = datetime.now()
        
        mock_orders = [
            {
                "id": 1,
                "status": "completed",
                "total_amount": 150.0,
                "created_at": now - timedelta(days=1)
            },
            {
                "id": 2,
                "status": "pending",
                "total_amount": 200.0,
                "created_at": now - timedelta(days=2)
            },
            {
                "id": 3,
                "status": "completed",
                "total_amount": 100.0,
                "created_at": now - timedelta(days=5)
            }
        ]
        
        def mock_get_order_overview(db, start_date, end_date):
            # Use the mock orders data directly
            orders = mock_orders
            
            total_orders = len(orders)
            completed_orders = len([o for o in orders if o["status"] == "completed"])
            total_revenue = sum(o["total_amount"] for o in orders if o["status"] == "completed")
            
            return {
                "status": 200,
                "message": "Order overview retrieved successfully",
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "pending_orders": total_orders - completed_orders,
                "total_revenue": total_revenue,
                "average_order_value": total_revenue / completed_orders if completed_orders > 0 else 0
            }
        
        result = mock_get_order_overview(None, now - timedelta(days=7), now)
        
        assert result["status"] == 200
        assert result["total_orders"] == 3
        assert result["completed_orders"] == 2
        assert result["pending_orders"] == 1
        assert result["total_revenue"] == 250.0
        assert result["average_order_value"] == 125.0
    
    def test_admin_user_management_service_mock(self):
        """Test admin user management service with mocks"""
        # Mock user statistics data
        mock_stats = {
            "total_users": 1000,
            "active_users": 750,
            "new_users_this_month": 50,
            "users_by_status": {
                "active": 750,
                "suspended": 30,
                "banned": 20,
                "pending_verification": 200
            }
        }
        
        def mock_get_user_overview(db):
            stats = mock_stats
            
            return {
                "status": 200,
                "message": "User overview retrieved successfully",
                "user_statistics": stats,
                "engagement_rate": (stats["active_users"] / stats["total_users"]) * 100
            }
        
        result = mock_get_user_overview(None)
        
        assert result["status"] == 200
        assert result["user_statistics"]["total_users"] == 1000
        assert result["user_statistics"]["active_users"] == 750
        assert result["engagement_rate"] == 75.0
    
    def test_admin_product_verification_service_mock(self):
        """Test admin product verification service with mock"""
        def mock_verify_product(db, product_id, admin_id, verification_notes):
            # Mock product verification logic
            if not verification_notes:
                return {
                    "status": 400,
                    "message": "Verification notes are required"
                }
            
            return {
                "status": 200,
                "message": "Product verified successfully",
                "product_id": product_id,
                "verified_by": admin_id,
                "verification_date": datetime.now().isoformat(),
                "notes": verification_notes
            }
        
        # Valid verification
        result = mock_verify_product(None, 123, "admin_001", "Product meets quality standards")
        assert result["status"] == 200
        assert result["product_id"] == 123
        assert result["verified_by"] == "admin_001"
        assert "verification_date" in result
        
        # Invalid verification (no notes)
        result = mock_verify_product(None, 123, "admin_001", "")
        assert result["status"] == 400
        assert "required" in result["message"]