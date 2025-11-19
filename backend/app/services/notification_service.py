from datetime import datetime
from typing import List, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class NotificationService:
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@sleepingbear.com")
    
    def send_retention_alert(self, tenant_email: str, tenant_name: str, risk_score: int):
        """
        Send retention alert email to tenant
        """
        subject = "Special Offer - We Value Your Stay!"
        
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">Hello {tenant_name}!</h2>
            
            <p>We noticed you haven't booked with us recently, and we wanted to reach out.</p>
            
            <p>As a valued tenant, we're offering you:</p>
            <ul>
              <li>🎁 <strong>15% discount</strong> on your next booking</li>
              <li>🏠 <strong>Priority access</strong> to premium properties</li>
              <li>💳 <strong>Flexible payment terms</strong></li>
            </ul>
            
            <p>Use code: <strong style="color: #667eea;">WELCOME BACK15</strong></p>
            
            <div style="margin: 30px 0;">
              <a href="https://sleepingbear.com/properties" 
                 style="background-color: #667eea; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Browse Properties
              </a>
            </div>
            
            <p>Questions? Reply to this email or call us at +63-XXX-XXX-XXXX</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Sleeping Bear Condominium Rentals<br>
              Making your stay comfortable
            </p>
          </body>
        </html>
        """
        
        return self._send_email(tenant_email, subject, html_body)
    
    def send_admin_notification(self, admin_email: str, at_risk_count: int, high_risk_tenants: List[Dict]):
        """
        Send daily summary to admin
        """
        subject = f"Retention Alert: {at_risk_count} Tenants At Risk"
        
        tenant_list = "\n".join([
            f"- {t['name']} ({t['email']}) - Risk Score: {t['risk_score']}"
            for t in high_risk_tenants[:10]
        ])
        
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #dc3545;">Daily Retention Report</h2>
            
            <p><strong>{at_risk_count}</strong> tenants are at risk of churning.</p>
            
            <h3>Top 10 High-Risk Tenants:</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{tenant_list}</pre>
            
            <p>
              <a href="https://sleepingbear.com/admin/retention" 
                 style="background-color: #667eea; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Full Dashboard
              </a>
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This is an automated report sent daily at {datetime.now().strftime('%I:%M %p')}
            </p>
          </body>
        </html>
        """
        
        return self._send_email(admin_email, subject, html_body)
    
    def _send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Send email using SMTP
        """
        try:
            # For development, just log the email
            if not self.smtp_username or not self.smtp_password:
                print(f"\n📧 EMAIL (Dev Mode - Not Sent)")
                print(f"To: {to_email}")
                print(f"Subject: {subject}")
                print(f"Body: {html_body[:200]}...")
                return True
            
            # Production: Actually send email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False