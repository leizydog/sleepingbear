import stripe
import os
from datetime import datetime
import json

# Initialize Stripe (use test keys for development)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_test_key_here")

class PaymentService:
    
    @staticmethod
    def create_payment_intent(amount: float, currency: str = "php", metadata: dict = None):
        """
        Create a Stripe Payment Intent
        Amount should be in the smallest currency unit (centavos for PHP)
        """
        try:
            intent = stripe.Pay
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to centavos
                currency=currency.lower(),
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def confirm_payment(payment_intent_id: str):
        """
        Confirm a payment by checking its status
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'success': True,
                'status': intent.status,
                'amount': intent.amount / 100,  # Convert back to pesos
                'payment_method': intent.payment_method,
                'receipt_url': intent.charges.data[0].receipt_url if intent.charges.data else None,
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def create_refund(payment_intent_id: str, amount: float = None):
        """
        Create a refund for a payment
        If amount is None, refund the full amount
        """
        try:
            refund_params = {'payment_intent': payment_intent_id}
            if amount:
                refund_params['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_params)
            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status,
                'amount': refund.amount / 100,
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def get_payment_methods():
        """
        Return available payment methods
        """
        return [
            {
                'id': 'card',
                'name': 'Credit/Debit Card',
                'icon': '💳',
                'description': 'Visa, Mastercard, etc.'
            },
            {
                'id': 'gcash',
                'name': 'GCash',
                'icon': '📱',
                'description': 'Pay via GCash wallet'
            },
            {
                'id': 'bank_transfer',
                'name': 'Bank Transfer',
                'icon': '🏦',
                'description': 'Direct bank transfer'
            },
        ]