import stripe
import os
from datetime import datetime
import json

# Initialize Stripe
# Make sure STRIPE_SECRET_KEY is set in your .env file
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentService:
    
    @staticmethod
    def create_payment_intent(amount: float, payment_method_type: str, currency: str = "php", metadata: dict = None):
        """
        Create a Stripe Payment Intent
        """
        try:
            # 1. Map our internal types to Stripe types
            # 'bpi' -> 'card' (BPI is processed as a standard Visa/Mastercard)
            # 'gcash' -> 'gcash'
            stripe_method_types = []
            if payment_method_type == 'bpi':
                stripe_method_types = ['card']
            elif payment_method_type == 'gcash':
                stripe_method_types = ['gcash']
            else:
                # Fallback for others
                stripe_method_types = ['card']

            # 2. Create the Intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to centavos (e.g. 100.00 -> 10000)
                currency=currency.lower(),
                payment_method_types=stripe_method_types,
                metadata=metadata or {},
            )
            
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
            }
        except stripe.error.StripeError as e:
            print(f"Stripe Error: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def confirm_payment(payment_intent_id: str):
        """
        Check payment status from Stripe
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            is_paid = intent.status == 'succeeded'
            
            return {
                'success': True,
                'status': 'completed' if is_paid else 'pending',
                'is_paid': is_paid,
                'amount': intent.amount / 100,
                'payment_method': intent.payment_method_types[0] if intent.payment_method_types else 'unknown',
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
            
    @staticmethod
    def get_payment_methods():
        return [
            {'id': 'bpi', 'name': 'BPI (Credit/Debit Card)', 'icon': '💳'},
            {'id': 'gcash', 'name': 'GCash', 'icon': '📱'},
            {'id': 'cash', 'name': 'Cash (Admin Office)', 'icon': '💵'},
        ]