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
        logger.info(f"Email service initialized: {email_service.ses_client is not None}")
        logger.info(f"From email: {email_service.from_email}")
        logger.info(f"Region: {email_service.region}")
        
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
        logger.info("About to call email_service.send_order_confirmation")
        email_sent = await email_service.send_order_confirmation(
            customer_email="sknaidoo1405@gmail.com",
            customer_name="Shayden Naidoo",
            order_data=test_order_data
        )
        logger.info(f"Email sent result: {email_sent}")
        
        return {
            "status": 200 if email_sent else 500,
            "message": f"Quick test email {'sent successfully' if email_sent else 'failed'} to sknaidoo1405@gmail.com",
            "email_service_initialized": email_service.ses_client is not None,
            "from_email": email_service.from_email,
            "region": email_service.region,
            "email_sent": email_sent
        }
            
    except Exception as e:
        logger.error(f"Quick test email error: {e}")
        import traceback
        logger.error(f"Quick test email traceback: {traceback.format_exc()}")
        return {
            "status": 500,
            "message": f"Quick test email failed to sknaidoo1405@gmail.com: {str(e)}",
            "email_service_initialized": email_service.ses_client is not None,
            "from_email": email_service.from_email,
            "region": email_service.region,
            "error": str(e)
        }

@router.get("/email-config")
async def get_email_config():
    """Get email service configuration for debugging"""
    config = {
        "from_email": email_service.from_email,
        "from_name": email_service.from_name,
        "region": email_service.region,
        "ses_client_initialized": email_service.ses_client is not None,
    }
    
    # Check verified identities if SES client is available
    if email_service.ses_client:
        try:
            # Get verified email addresses and domains
            verified_response = email_service.ses_client.list_verified_email_addresses()
            verified_domains_response = email_service.ses_client.list_identities()
            
            config["verified_emails"] = verified_response.get('VerifiedEmailAddresses', [])
            config["verified_identities"] = verified_domains_response.get('Identities', [])
            config["sandbox_mode"] = True  # Assume sandbox unless we can determine otherwise
            
            # Check sending quota to determine if in sandbox
            try:
                quota_response = email_service.ses_client.get_send_quota()
                config["send_quota"] = quota_response
                config["sandbox_mode"] = quota_response.get('Max24HourSend', 0) <= 200
            except Exception as e:
                config["quota_error"] = str(e)
                
        except Exception as e:
            config["ses_error"] = str(e)
    
    return config

@router.post("/verify-email")
async def request_email_verification(request: TestEmailRequest):
    """Request verification for an email address"""
    try:
        if not email_service.ses_client:
            raise HTTPException(status_code=500, detail="SES client not initialized")
        
        # Request verification for email address
        response = email_service.ses_client.verify_email_identity(EmailAddress=request.email)
        
        return {
            "status": 200,
            "message": f"Verification email sent to {request.email}. Please check your inbox and click the verification link.",
            "aws_response": response
        }
        
    except Exception as e:
        logger.error(f"Error requesting email verification: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to request verification: {str(e)}")

@router.get("/ses-status")
async def get_ses_status():
    """Get comprehensive SES status and verification info"""
    try:
        if not email_service.ses_client:
            return {
                "status": "error",
                "message": "SES client not initialized",
                "ses_client_initialized": False
            }
        
        status_info = {
            "ses_client_initialized": True,
            "from_email": email_service.from_email,
            "region": email_service.region
        }
        
        # Get verified identities
        try:
            identities_response = email_service.ses_client.list_identities()
            status_info["verified_identities"] = identities_response.get('Identities', [])
        except Exception as e:
            status_info["identities_error"] = str(e)
        
        # Get sending quota
        try:
            quota_response = email_service.ses_client.get_send_quota()
            status_info["send_quota"] = quota_response
            status_info["sandbox_mode"] = quota_response.get('Max24HourSend', 0) <= 200
        except Exception as e:
            status_info["quota_error"] = str(e)
            
        # Get sending statistics
        try:
            stats_response = email_service.ses_client.get_send_statistics()
            status_info["send_statistics"] = stats_response.get('SendDataPoints', [])
        except Exception as e:
            status_info["stats_error"] = str(e)
        
        # Check if test email is verified
        test_email = "sknaidoo1405@gmail.com"
        status_info["test_email_verified"] = test_email in status_info.get("verified_identities", [])
        status_info["from_email_verified"] = email_service.from_email in status_info.get("verified_identities", [])
        status_info["domain_verified"] = any(identity.endswith("greencart-cos301.co.za") for identity in status_info.get("verified_identities", []))
        
        return status_info
        
    except Exception as e:
        logger.error(f"Error getting SES status: {e}")
        return {
            "status": "error",
            "message": str(e),
            "ses_client_initialized": email_service.ses_client is not None
        }
