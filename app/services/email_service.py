import os
import boto3
from botocore.exceptions import ClientError
from typing import Dict, List, Optional
from jinja2 import Template
import logging
from datetime import datetime, timedelta
import base64

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.ses_client = None
        self.from_email = os.getenv('SES_FROM_EMAIL', 'noreply@greencart-cos301.co.za')
        self.from_name = os.getenv('SES_FROM_NAME', 'Green Cart')
        self.region = os.getenv('AWS_SES_REGION', 'us-east-1')
        
        try:
            self.ses_client = boto3.client(
                'ses',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=self.region
            )
            logger.info("SES client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SES client: {e}")
    
    async def send_order_confirmation(
        self, 
        customer_email: str, 
        customer_name: str, 
        order_data: Dict
    ) -> bool:
        """Send comprehensive order confirmation email with product details and images"""
        try:
            subject = f"🌱 Green Cart Order Confirmation - #{order_data.get('order_id', 'N/A')}"
            
            # Enhanced HTML template with product images and detailed information
            html_template = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Green Cart Order Confirmation</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f0f8f0; 
                        line-height: 1.6;
                    }
                    .container { 
                        max-width: 700px; 
                        margin: 0 auto; 
                        background: white; 
                        border-radius: 15px; 
                        overflow: hidden; 
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
                    }
                    .header { 
                        background: linear-gradient(135deg, #2e7d32, #4caf50, #66bb6a); 
                        color: white; 
                        padding: 30px; 
                        text-align: center; 
                        position: relative;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
                        opacity: 0.3;
                    }
                    .header h1 { 
                        margin: 0; 
                        font-size: 28px; 
                        font-weight: 600;
                        position: relative;
                        z-index: 1;
                    }
                    .order-badge { 
                        background: rgba(255,255,255,0.2); 
                        color: white; 
                        padding: 8px 16px; 
                        border-radius: 20px; 
                        display: inline-block; 
                        margin: 15px 0; 
                        font-weight: 500;
                        position: relative;
                        z-index: 1;
                    }
                    .content { 
                        padding: 30px; 
                    }
                    .greeting {
                        font-size: 18px;
                        color: #2e7d32;
                        margin-bottom: 20px;
                        font-weight: 500;
                    }
                    .order-summary { 
                        background: #f8fdf8; 
                        padding: 25px; 
                        border-radius: 12px; 
                        margin: 25px 0; 
                        border-left: 5px solid #4caf50; 
                    }
                    .order-summary h3 {
                        margin: 0 0 20px 0;
                        color: #2e7d32;
                        font-size: 20px;
                    }
                    .order-details-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin-bottom: 25px;
                    }
                    .detail-item {
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #e8f5e8;
                    }
                    .detail-label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 5px;
                    }
                    .detail-value {
                        font-size: 16px;
                        color: #2e7d32;
                        font-weight: 600;
                    }
                    .products-section h3 {
                        color: #2e7d32;
                        margin: 30px 0 20px 0;
                        font-size: 20px;
                        border-bottom: 2px solid #e8f5e8;
                        padding-bottom: 10px;
                    }
                    .product-item { 
                        display: flex;
                        align-items: center;
                        padding: 20px;
                        margin-bottom: 15px;
                        background: #fdfdfd;
                        border: 1px solid #e8f5e8;
                        border-radius: 12px;
                        transition: box-shadow 0.3s ease;
                    }
                    .product-item:hover {
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    }
                    .product-image {
                        width: 80px;
                        height: 80px;
                        border-radius: 10px;
                        object-fit: cover;
                        margin-right: 20px;
                        border: 2px solid #e8f5e8;
                    }
                    .product-placeholder {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
                        border-radius: 10px;
                        margin-right: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #4caf50;
                        font-size: 24px;
                        border: 2px solid #e8f5e8;
                    }
                    .product-details {
                        flex: 1;
                    }
                    .product-name { 
                        font-weight: 600; 
                        color: #2e7d32; 
                        margin-bottom: 8px; 
                        font-size: 16px;
                    }
                    .product-info {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    .product-info div {
                        font-size: 14px;
                        color: #666;
                    }
                    .product-info .label {
                        font-weight: 500;
                        color: #2e7d32;
                    }
                    .sustainability-score {
                        background: linear-gradient(135deg, #4caf50, #66bb6a);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    .total-section { 
                        background: linear-gradient(135deg, #2e7d32, #4caf50); 
                        color: white; 
                        padding: 25px; 
                        text-align: center; 
                        margin: 30px 0; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
                    }
                    .total-amount {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    .eco-impact { 
                        background: linear-gradient(135deg, #e8f5e8, #f1f8e9); 
                        padding: 25px; 
                        border-radius: 12px; 
                        margin: 25px 0; 
                        border-left: 5px solid #4caf50; 
                    }
                    .eco-impact h4 {
                        color: #2e7d32;
                        margin: 0 0 15px 0;
                        font-size: 18px;
                    }
                    .eco-stats {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .eco-stat {
                        text-align: center;
                        background: white;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #e8f5e8;
                    }
                    .eco-stat-value {
                        font-size: 20px;
                        font-weight: 700;
                        color: #2e7d32;
                        display: block;
                    }
                    .eco-stat-label {
                        font-size: 12px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-top: 5px;
                    }
                    .delivery-info {
                        background: #f0f7ff;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        border-left: 5px solid #2196f3;
                    }
                    .delivery-info h4 {
                        color: #1565c0;
                        margin: 0 0 15px 0;
                    }
                    .tracking-section {
                        background: #fff8e1;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 25px 0;
                        text-align: center;
                        border-left: 5px solid #ff9800;
                    }
                    .track-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #ff9800, #ffb74d);
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        margin-top: 15px;
                        transition: transform 0.3s ease;
                    }
                    .track-button:hover {
                        transform: translateY(-2px);
                    }
                    .footer { 
                        text-align: center; 
                        padding: 30px; 
                        background: #f8fdf8; 
                        color: #666; 
                        border-top: 1px solid #e8f5e8;
                    }
                    .social-links {
                        margin: 20px 0;
                    }
                    .social-links a {
                        display: inline-block;
                        margin: 0 10px;
                        color: #4caf50;
                        text-decoration: none;
                    }
                    @media (max-width: 600px) {
                        .container { margin: 10px; border-radius: 10px; }
                        .content { padding: 20px; }
                        .product-item { flex-direction: column; text-align: center; }
                        .product-image, .product-placeholder { margin: 0 0 15px 0; }
                        .order-details-grid { grid-template-columns: 1fr; }
                        .product-info { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌱 Thank You for Your Order!</h1>
                        <div class="order-badge">Order #{{ order_data.get('order_id') }}</div>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hi {{ customer_name }},</div>
                        <p>Your eco-friendly order has been confirmed and is being prepared with care! Thank you for choosing sustainable products that make a positive impact on our planet.</p>
                        
                        <div class="order-summary">
                            <h3>📋 Order Summary</h3>
                            <div class="order-details-grid">
                                <div class="detail-item">
                                    <div class="detail-label">Order Date</div>
                                    <div class="detail-value">{{ order_data.get('order_date', 'N/A') }}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Estimated Delivery</div>
                                    <div class="detail-value">{{ order_data.get('delivery_date', 'TBD') }}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Order Status</div>
                                    <div class="detail-value">{{ order_data.get('status', 'Preparing Order') }}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Items Ordered</div>
                                    <div class="detail-value">{{ order_data.get('items', [])|length }} item(s)</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="products-section">
                            <h3>🛒 Your Sustainable Products</h3>
                            {% for item in order_data.get('items', []) %}
                            <div class="product-item">
                                {% if item.get('image_url') %}
                                    <img src="{{ item.image_url }}" alt="{{ item.name }}" class="product-image" />
                                {% else %}
                                    <div class="product-placeholder">🌱</div>
                                {% endif %}
                                <div class="product-details">
                                    <div class="product-name">{{ item.name }}</div>
                                    <div class="product-info">
                                        <div><span class="label">Quantity:</span> {{ item.quantity }}</div>
                                        <div><span class="label">Unit Price:</span> R{{ "%.2f"|format(item.price) }}</div>
                                        <div><span class="label">Subtotal:</span> R{{ "%.2f"|format(item.price * item.quantity) }}</div>
                                        {% if item.get('sustainability_rating') %}
                                        <div><span class="label">Sustainability:</span> <span class="sustainability-score">🌿 {{ item.sustainability_rating }}/100</span></div>
                                        {% endif %}
                                    </div>
                                </div>
                            </div>
                            {% endfor %}
                        </div>
                        
                        <div class="total-section">
                            <div class="total-amount">Total: R{{ "%.2f"|format(order_data.get('total_amount', 0)) }}</div>
                            {% if order_data.get('average_sustainability') %}
                            <div>Average Sustainability Score: 🌱 {{ "%.1f"|format(order_data.get('average_sustainability', 0)) }}/100</div>
                            {% endif %}
                        </div>
                        
                        <div class="eco-impact">
                            <h4>🌍 Your Environmental Impact</h4>
                            <p>By choosing these sustainable products, you're contributing to a healthier planet! Here's the positive impact of your purchase:</p>
                            <div class="eco-stats">
                                <div class="eco-stat">
                                    <span class="eco-stat-value">{{ order_data.get('co2_saved', '2.3') }} kg</span>
                                    <div class="eco-stat-label">CO₂ Saved</div>
                                </div>
                                <div class="eco-stat">
                                    <span class="eco-stat-value">{{ order_data.get('water_saved', '15') }} L</span>
                                    <div class="eco-stat-label">Water Saved</div>
                                </div>
                                <div class="eco-stat">
                                    <span class="eco-stat-value">{{ order_data.get('waste_reduced', '78') }}%</span>
                                    <div class="eco-stat-label">Waste Reduced</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="delivery-info">
                            <h4>🚚 Delivery Information</h4>
                            <p><strong>Estimated Delivery:</strong> {{ order_data.get('delivery_date', 'Within 5-7 business days') }}</p>
                            <p><strong>Shipping Method:</strong> Eco-friendly packaging with carbon-neutral delivery</p>
                            <p><strong>Delivery Address:</strong> Your registered address</p>
                        </div>
                        
                        <div class="tracking-section">
                            <h4>📦 Track Your Order</h4>
                            <p>Keep an eye on your order status and get real-time updates on delivery progress.</p>
                            <a href="https://greencart-cos301.co.za/orders" class="track-button">Track Your Order</a>
                        </div>
                        
                        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8f5e8;">
                            <strong>Need help?</strong> If you have any questions about your order, please don't hesitate to contact our customer support team at <a href="mailto:support@greencart-cos301.co.za" style="color: #4caf50;">support@greencart-cos301.co.za</a> or call us at +27 (0) 11 123 4567.
                        </p>
                        
                        <p>Thank you for choosing Green Cart and supporting sustainable commerce!</p>
                        
                        <p>Best regards,<br><strong>The Green Cart Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>🌱 Green Cart</strong><br>Making sustainable shopping accessible to everyone</p>
                        <div class="social-links">
                            <a href="https://greencart-cos301.co.za">Visit Website</a> |
                            <a href="mailto:info@greencart-cos301.co.za">Contact Us</a> |
                            <a href="https://greencart-cos301.co.za/help">Help Center</a>
                        </div>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">
                            This email was sent to {{ customer_email }}. If you no longer wish to receive these emails, 
                            you can update your preferences in your account settings.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version for email clients that don't support HTML
            text_template = """
            Hi {{ customer_name }},

            🌱 GREEN CART - ORDER CONFIRMATION

            Thank you for your eco-friendly order! Your order #{{ order_data.get('order_id') }} has been confirmed.

            ORDER DETAILS:
            - Order Date: {{ order_data.get('order_date', 'N/A') }}
            - Estimated Delivery: {{ order_data.get('delivery_date', 'TBD') }}
            - Status: {{ order_data.get('status', 'Preparing Order') }}

            YOUR PRODUCTS:
            {% for item in order_data.get('items', []) %}
            • {{ item.name }} (Qty: {{ item.quantity }}) - R{{ "%.2f"|format(item.price * item.quantity) }}
              Sustainability Score: {{ item.get('sustainability_rating', 'N/A') }}/100
            {% endfor %}

            TOTAL: R{{ "%.2f"|format(order_data.get('total_amount', 0)) }}
            {% if order_data.get('average_sustainability') %}
            Average Sustainability Score: {{ "%.1f"|format(order_data.get('average_sustainability', 0)) }}/100
            {% endif %}

            🌍 ENVIRONMENTAL IMPACT:
            By choosing sustainable products, you're helping save approximately:
            - CO₂ Saved: {{ order_data.get('co2_saved', '2.3') }} kg
            - Water Saved: {{ order_data.get('water_saved', '15') }} liters
            - Waste Reduced: {{ order_data.get('waste_reduced', '78') }}%

            🚚 DELIVERY:
            Your order will be delivered within 5-7 business days using eco-friendly packaging.

            📦 TRACK YOUR ORDER:
            Visit: https://greencart-cos301.co.za/orders

            Need help? Contact us at support@greencart-cos301.co.za or +27 (0) 11 123 4567

            Thank you for choosing Green Cart and supporting sustainable commerce!

            Best regards,
            The Green Cart Team
            
            Green Cart - Making sustainable shopping accessible
            https://greencart-cos301.co.za
            """
            
            # Render templates
            html_body = Template(html_template).render(
                customer_name=customer_name,
                customer_email=customer_email,
                order_data=order_data
            )
            
            text_body = Template(text_template).render(
                customer_name=customer_name,
                order_data=order_data
            )
            
            return await self._send_email(
                to_email=customer_email,
                subject=subject,
                html_body=html_body,
                text_body=text_body
            )
            
        except Exception as e:
            logger.error(f"Failed to send order confirmation email: {e}")
            return False
    
    async def send_order_status_update(
        self, 
        customer_email: str, 
        customer_name: str, 
        order_id: str,
        status: str,
        tracking_info: Optional[str] = None
    ) -> bool:
        """Send order status update email"""
        try:
            status_messages = {
                'Preparing Order': 'Your order is being prepared',
                'Ready for Delivery': 'Your order is ready for delivery',
                'In Transit': 'Your order is on its way!',
                'Delivered': 'Your order has been delivered',
                'Cancelled': 'Your order has been cancelled'
            }
            
            subject = f"🚚 Order Update - #{order_id} - {status_messages.get(status, status)}"
            
            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #4CAF50, #66bb6a); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0;">🌱 Order Status Update</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Hi {customer_name},</h2>
                    <p>Great news! Your Green Cart order <strong>#{order_id}</strong> status has been updated:</p>
                    
                    <div style="background: #f8fdf8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #4CAF50;">
                        <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Current Status: <span style="color: #4CAF50;">{status.upper()}</span></h3>
                        <p style="margin: 0;">{status_messages.get(status, 'Your order status has been updated.')}</p>
                    </div>
                    
                    {f'<div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ff9800;"><h4 style="margin: 0 0 10px 0; color: #e65100;">Tracking Information:</h4><p style="margin: 0; font-family: monospace; font-size: 16px; color: #bf360c;">{tracking_info}</p></div>' if tracking_info else ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://greencart-cos301.co.za/orders" style="display: inline-block; background: linear-gradient(135deg, #4CAF50, #66bb6a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600;">View Order Details</a>
                    </div>
                    
                    <p>Thank you for choosing sustainable products!</p>
                    <p>Best regards,<br><strong>The Green Cart Team</strong></p>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fdf8; color: #666; border-top: 1px solid #e8f5e8;">
                    <p>🌱 Green Cart - Making sustainable shopping accessible</p>
                </div>
            </div>
            """
            
            text_body = f"""
            Hi {customer_name},

            🌱 GREEN CART - ORDER STATUS UPDATE

            Your order #{order_id} status has been updated to: {status.upper()}
            
            {status_messages.get(status, 'Your order status has been updated.')}
            
            {f'Tracking Information: {tracking_info}' if tracking_info else ''}

            View your order details: https://greencart-cos301.co.za/orders

            Thank you for choosing sustainable products!

            Best regards,
            The Green Cart Team
            """
            
            return await self._send_email(
                to_email=customer_email,
                subject=subject,
                html_body=html_body,
                text_body=text_body
            )
            
        except Exception as e:
            logger.error(f"Failed to send status update email: {e}")
            return False
    
    async def _send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_body: str, 
        text_body: str
    ) -> bool:
        """Send email via SES"""
        if not self.ses_client:
            logger.error("SES client not initialized")
            return False
        
        try:
            response = self.ses_client.send_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destination={
                    'ToAddresses': [to_email]
                },
                Message={
                    'Subject': {
                        'Data': subject,
                        'Charset': 'UTF-8'
                    },
                    'Body': {
                        'Html': {
                            'Data': html_body,
                            'Charset': 'UTF-8'
                        },
                        'Text': {
                            'Data': text_body,
                            'Charset': 'UTF-8'
                        }
                    }
                }
            )
            
            logger.info(f"Email sent successfully. MessageId: {response['MessageId']}")
            return True
            
        except ClientError as e:
            logger.error(f"SES error: {e.response['Error']['Message']}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}")
            return False

# Create singleton instance
email_service = EmailService()
