import stripe
import os
from datetime import datetime
import json

# Initialize Stripe (use test keys for development)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_test_key_here")

class PaymentService:
    
    @staticmethod
    def create_payment_intent(amount: float, payment_method_type: str, currency: str = "php", metadata: dict = None):
        """
        Create a Stripe Payment Intent
        """
        try:
            # 1. Map our internal types to Stripe types
            # 'bpi' -> 'card' (BPI acts as a standard credit/debit card in Stripe)
            # 'gcash' -> 'gcash' (if available) or 'card' fallback
            stripe_method_types = []
            
            if payment_method_type == 'bpi':
                stripe_method_types = ['card']
            elif payment_method_type == 'gcash':
                # Note: 'gcash' payment method requires a Stripe account in a supported region (like Singapore)
                # If using a US test account, this might fail, so we fallback to card for testing if needed
                stripe_method_types = ['card'] 
            else:
                stripe_method_types = ['card']

            # 2. Create the Intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to centavos (e.g. 100.00 -> 10000)
                currency=currency.lower(),
                payment_method_types=stripe_method_types,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': False, # Disable automatic to force specific types
                }
            )
            
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
            }
        except stripe.StripeError as e:
            # Fixed: Catch stripe.StripeError directly, not stripe.error.StripeError
            print(f"Stripe Error: {e}")
            return {
                'success': False,
                'error': str(e),
            }
        except Exception as e:
            print(f"General Error: {e}")
            return {
                'success': False,
                'error': f"An unexpected error occurred: {str(e)}",
            }
    
    @staticmethod
    def confirm_payment(payment_intent_id: str):
        """
        Confirm a payment by checking its status
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            # Check if paid
            is_paid = intent.status == 'succeeded'
            
            return {
                'success': True,
                'is_paid': is_paid,
                'status': intent.status,
                'amount': intent.amount / 100,  # Convert back to pesos
                'payment_method': intent.payment_method_types[0] if intent.payment_method_types else 'unknown',
            }
        except stripe.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
        except Exception as e:
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