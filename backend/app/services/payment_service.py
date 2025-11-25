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
            stripe_method_types = []
            
            if payment_method_type == 'bpi':
                # BPI in Stripe (via PayMongo or direct) often uses 'card' or 'grabpay' for testing
                # For this demo, we map BPI to 'card' so you can type test numbers.
                stripe_method_types = ['card']
            elif payment_method_type == 'gcash':
                # Note: 'gcash' payment method requires a Stripe account in a supported region
                stripe_method_types = ['card'] # Fallback to card for stability if gcash isn't enabled
            else:
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
        # ✅ FIXED: Use stripe.error.StripeError instead of stripe.StripeError
        except stripe.error.StripeError as e:
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
        # ✅ FIXED: Exception handling here too
        except stripe.error.StripeError as e:
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
            {'id': 'bpi', 'name': 'BPI (Credit/Debit Card)', 'icon': 'card_icon', 'description': 'Pay via Card'},
            {'id': 'gcash', 'name': 'GCash', 'icon': 'gcash_icon', 'description': 'Live via Stripe'},
            {'id': 'cash', 'name': 'Cash', 'icon': 'cash_icon', 'description': 'Pay at Office'},
        ]