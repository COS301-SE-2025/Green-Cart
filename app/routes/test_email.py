from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.email_service import email_service
import logging

router = APIRouter(prefix="/test", tags=["Testing"])
logger = logging.getLogger(__name__)

class TestEmailRequest(BaseModel):
    email: str
    name: str = "Test User"

@router.post("/email")
async def test_email(request: TestEmailRequest):
    """Test endpoint to verify email functionality"""
    try:
        logger.info(f"Testing email to {request.email}")
        
        # Create sample order data for testing
        test_order_data = {
            'order_id': 'TEST-001',
            'order_date': '2024-09-24 12:00',
            'delivery_date': '2024-10-01',
            'status': 'Preparing Order',
            'items': [
                {
                    'name': 'Eco-Friendly Water Bottle',
                    'quantity': 1,
                    'price': 199.99,
                    'sustainability_rating': 85,
                    'image_url': 'https://greencart-cos301.s3.amazonaws.com/product-images/sample.jpg'
                },
                {
                    'name': 'Organic Cotton T-Shirt',
                    'quantity': 2,
                    'price': 299.50,
                    'sustainability_rating': 92,
                    'image_url': 'https://greencart-cos301.s3.amazonaws.com/product-images/sample2.jpg'
                }
            ],
            'total_amount': 798.99,
            'average_sustainability': 88.5,
            'co2_saved': '4.4',
            'water_saved': '18',
            'waste_reduced': '71'
        }
        
        # Send test email
        email_sent = await email_service.send_order_confirmation(
            customer_email=request.email,
            customer_name=request.name,
            order_data=test_order_data
        )
        
        if email_sent:
            return {
                "status": 200,
                "message": f"Test email sent successfully to {request.email}",
                "email_service_initialized": email_service.ses_client is not None,
                "from_email": email_service.from_email,
                "region": email_service.region
            }
        else:
            return {
                "status": 500,
                "message": "Failed to send test email",
                "email_service_initialized": email_service.ses_client is not None,
                "from_email": email_service.from_email,
                "region": email_service.region
            }
            
    except Exception as e:
        logger.error(f"Test email error: {e}")
        raise HTTPException(status_code=500, detail=f"Test email failed: {str(e)}")

@router.get("/email-quick")
async def test_email_quick():
    """Quick email test to sknaidoo1405@gmail.com"""
    try:
        logger.info("Quick email test to sknaidoo1405@gmail.com")
        
        # Create sample order data for testing
        test_order_data = {
            'order_id': 'QUICK-TEST-001',
            'order_date': '2024-09-24 12:00',
            'delivery_date': '2024-10-01',
            'status': 'Preparing Order',
            'items': [
                {
                    'name': 'Eco-Friendly Water Bottle',
                    'quantity': 1,
                    'price': 199.99,
                    'sustainability_rating': 85,
                    'image_url': None
                },
                {
                    'name': 'Organic Cotton T-Shirt',
                    'quantity': 2,
                    'price': 299.50,
                    'sustainability_rating': 92,
                    'image_url': None
                }
            ],
            'total_amount': 798.99,
            'average_sustainability': 88.5,
            'co2_saved': '4.4',
            'water_saved': '18',
            'waste_reduced': '71'
        }
        
        # Send test email
        email_sent = await email_service.send_order_confirmation(
            customer_email="sknaidoo1405@gmail.com",
            customer_name="Shayden Naidoo",
            order_data=test_order_data
        )
        
        return {
            "status": 200 if email_sent else 500,
            "message": f"Quick test email {'sent successfully' if email_sent else 'failed'} to sknaidoo1405@gmail.com",
            "email_service_initialized": email_service.ses_client is not None,
            "from_email": email_service.from_email,
            "region": email_service.region
        }
            
    except Exception as e:
        logger.error(f"Quick test email error: {e}")
        import traceback
        logger.error(f"Quick test email traceback: {traceback.format_exc()}")
        return {
            "status": 500,
            "message": f"Quick test email failed: {str(e)}",
            "error_details": str(e)
        }
        
        # Send test email
        email_sent = await email_service.send_order_confirmation(
            customer_email=request.email,
            customer_name=request.name,
            order_data=test_order_data
        )
        
        if email_sent:
            return {
                "status": 200,
                "message": f"Test email sent successfully to {request.email}",
                "email_service_initialized": email_service.ses_client is not None,
                "from_email": email_service.from_email,
                "region": email_service.region
            }
        else:
            return {
                "status": 500,
                "message": "Failed to send test email",
                "email_service_initialized": email_service.ses_client is not None,
                "from_email": email_service.from_email,
                "region": email_service.region
            }
            
    except Exception as e:
        logger.error(f"Test email error: {e}")
        raise HTTPException(status_code=500, detail=f"Test email failed: {str(e)}")

@router.get("/email-config")
async def get_email_config():
    """Get email service configuration for debugging"""
    return {
        "from_email": email_service.from_email,
        "from_name": email_service.from_name,
        "region": email_service.region,
        "ses_client_initialized": email_service.ses_client is not None,
        "aws_access_key_set": bool(email_service.ses_client._client_config.access_key if email_service.ses_client else False)
    }
