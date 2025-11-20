// src/components/organisms/BookingModal/BookingModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const STEPS = { CUSTOMER_INFO: 1, PAYMENT: 2, CONFIRMATION: 3 };

const BookingModal = ({ property, onClose, onSuccess }) => {
    const { user } = useAuth(); 
    const [currentStep, setCurrentStep] = useState(STEPS.CUSTOMER_INFO);
    const [loading, setLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false); 

    const [formData, setFormData] = useState({
        purpose: 'PERSONAL USE', 
        first_name: user?.first_name || '', last_name: user?.last_name || '',
        email: user?.email || '', phone_number: user?.phone_number || '',
        is_terms_agreed: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleStep1Next = () => {
        if (formData.first_name && formData.last_name && formData.email && formData.phone_number) {
            setCurrentStep(STEPS.PAYMENT);
            setBookingError(null);
        } else {
            setBookingError('Please fill in all required customer details.');
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setLoading(true); setBookingError(null);

        if (!formData.is_terms_agreed) {
            setBookingError('You must agree to the Terms and Conditions.');
            setLoading(false); return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800)); 
            const apiSuccess = Math.random() > 0.2; // 80% success

            if (apiSuccess) {
                setIsConfirmed(true);
            } else {
                throw new Error("Payment failed or property is no longer available.");
            }

        } catch (err) {
            setIsConfirmed(false); 
            setBookingError(err.message || 'Booking declined. Please check payment details.');
        } finally {
            setLoading(false);
            setCurrentStep(STEPS.CONFIRMATION);
        }
    };
    
    const renderPaymentFields = () => {
        switch (paymentMethod) {
            case 'BPI': return (<div className="payment-fields">
                <input name="card_number" type="text" placeholder="Card Number" className="modal-input" onChange={handleChange} required />
                <input name="cardholder_name" type="text" placeholder="Cardholder Name" className="modal-input" onChange={handleChange} required />
                <div className="flex-group">
                    <input name="expiry_date" type="text" placeholder="MM/Y" className="modal-input" onChange={handleChange} required />
                    <input name="cvv_cvc" type="text" placeholder="CVV/CVC" className="modal-input" onChange={handleChange} required />
                </div>
                <input name="otp" type="text" placeholder="One-Time PIN (OTP)" className="modal-input" onChange={handleChange} required />
            </div>);
            case 'GCASH': return (<div className="payment-fields">
                <input name="gcash_number" type="tel" placeholder="Gcash Number" className="modal-input" onChange={handleChange} required />
                <input name="gcash_account_name" type="text" placeholder="Account Name" className="modal-input" onChange={handleChange} required />
            </div>);
            case 'CASH': return <p className="info-message">You have selected cash payment. You will be contacted for further instructions.</p>;
            default: return <p className="info-message">Please select a payment method above.</p>;
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case STEPS.CUSTOMER_INFO: return (<div className="step-content">
                    <h3>Step 1: Provide Customer Information</h3>
                    <div className="input-group-half"><label>Purpose of Booking</label><select name="purpose" value={formData.purpose} onChange={handleChange} className="modal-input">
                        <option value="PERSONAL USE">PERSONAL USE</option><option value="FOR OTHERS">FOR OTHERS</option>
                    </select></div>
                    <div className="form-grid-modal">
                        <input name="first_name" type="text" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="modal-input" />
                        <input name="last_name" type="text" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="modal-input" />
                        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="modal-input" />
                        <input name="phone_number" type="tel" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required className="modal-input" />
                    </div>
                    {bookingError && <p className="error-message">{bookingError}</p>}
                    <div className="modal-actions">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button onClick={handleStep1Next} className="btn-primary">NEXT</button>
                    </div>
                </div>);
            case STEPS.PAYMENT: return (
                    <form onSubmit={handleStep2Submit} className="step-content">
                        <h3>Step 2: Provide Payment Information</h3>
                        <div className="payment-methods">
                            {['BPI', 'GCASH', 'CASH'].map(m => (
                                <label key={m} className={`payment-option ${paymentMethod === m ? 'selected' : ''}`}>
                                    <input type="radio" name="paymentMethod" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />{m}
                                </label>
                            ))}
                        </div>
                        {renderPaymentFields()}
                        <label className="terms-checkbox">
                            <input type="checkbox" name="is_terms_agreed" checked={formData.is_terms_agreed} onChange={handleChange} required />
                            I agree to the Terms and Conditions.
                        </label>
                        {bookingError && <p className="error-message">{bookingError}</p>}
                        <div className="modal-actions">
                            <button type="button" onClick={() => setCurrentStep(STEPS.CUSTOMER_INFO)} className="btn-secondary">BACK</button>
                            <button type="submit" className="btn-primary" disabled={loading || !paymentMethod}>
                                {loading ? 'Processing...' : 'NEXT'}
                            </button>
                        </div>
                    </form>);
            case STEPS.CONFIRMATION: return (
                <div className={`confirmation-content ${isConfirmed ? 'success' : 'decline'}`}>
                    <span className="confirmation-icon">{isConfirmed ? '🎉' : '❌'}</span>
                    <h2>{isConfirmed ? 'Booking Confirmed!' : 'Sorry! Your booking has been declined.'}</h2>
                    <p>{isConfirmed ? 'An email confirmation has been sent.' : bookingError || 'There was an issue processing your request.'}</p>
                    <div className="modal-actions-single">
                        {isConfirmed ? (
                            <button onClick={onSuccess} className="btn-primary">VIEW BOOKING DETAILS</button>
                        ) : (
                            <button onClick={() => setCurrentStep(STEPS.PAYMENT)} className="btn-primary">TRY AGAIN</button>
                        )}
                        <button onClick={onClose} className="btn-secondary">BACK TO HOME</button>
                    </div>
                </div>
            );
            default: return null;
        }
    };
    
    const stepLabels = ['Customer Information', 'Payment Information', 'Confirmation'];

    return (
        <div className="modal-overlay">
            <div className="booking-modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 className="modal-header">Book {property.name}</h2>
                {currentStep < STEPS.CONFIRMATION && (
                    <div className="booking-progress">
                        {stepLabels.map((label, index) => (
                            <div key={index} className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}>
                                <div className="step-circle">{index + 1}</div>
                                <span className="step-label">{label}</span>
                                {index < stepLabels.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default BookingModal;