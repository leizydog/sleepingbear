// src/pages/owner/NewListingPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';

const STEPS = { DETAILS: 1, PAYMENT: 2, CONFIRMATION: 3 };

const NewListingPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        condo_name: '', unit_number: '', unit_type: '', condo_type: '', address_location: '',
        accepted_payment_methods: [], price_per_month: '',
        is_accurate_complete: false, is_terms_agreed: false, is_review_understood: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePaymentChange = (method) => {
        setFormData(prev => {
            const methods = prev.accepted_payment_methods;
            if (methods.includes(method)) { return { ...prev, accepted_payment_methods: methods.filter(m => m !== method) }; } 
            else { return { ...prev, accepted_payment_methods: [...methods, method] }; }
        });
    };

    const handleNext = () => {
        setError(null);
        if (currentStep === STEPS.DETAILS) {
            if (!formData.condo_name || !formData.unit_type || !formData.address_location) { setError("Please fill in all required property details."); return; }
            setCurrentStep(STEPS.PAYMENT);
        } else if (currentStep === STEPS.PAYMENT) {
            if (!formData.price_per_month || formData.accepted_payment_methods.length === 0) { setError("Please specify the price and select at least one payment method."); return; }
            setCurrentStep(STEPS.CONFIRMATION);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(null); setLoading(true);

        if (!formData.is_accurate_complete || !formData.is_terms_agreed || !formData.is_review_understood) {
            setError("You must agree to all confirmation statements before submitting."); setLoading(false); return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            navigate('/admin'); // Redirect to dashboard 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case STEPS.DETAILS: return (
                    <>
                        <h3 className="form-step-title">Step 1: Enter Property Details</h3>
                        <div className="form-grid-owner">
                            <div className="input-group"><label>Condo Name</label><input name="condo_name" type="text" value={formData.condo_name} onChange={handleChange} required /></div>
                            <div className="input-group"><label>Unit Number</label><input name="unit_number" type="text" value={formData.unit_number} onChange={handleChange} /></div>
                            <div className="input-group"><label>Unit Type</label><input name="unit_type" type="text" placeholder="e.g., 1-Bedroom, Studio" value={formData.unit_type} onChange={handleChange} required /></div>
                            <div className="input-group"><label>Condo Type</label><input name="condo_type" type="text" placeholder="e.g., Residential" value={formData.condo_type} onChange={handleChange} /></div>
                            <div className="input-group full-width"><label>Address / Location</label><input name="address_location" type="text" value={formData.address_location} onChange={handleChange} required /></div>
                        </div>
                    </>
                );
            case STEPS.PAYMENT: return (
                    <>
                        <h3 className="form-step-title">Step 2: Define Pricing and Payments</h3>
                        <div className="form-grid-owner">
                            <div className="input-group full-width"><label>Price per Month (₱)</label><input name="price_per_month" type="number" value={formData.price_per_month} onChange={handleChange} required /></div>
                            <div className="input-group full-width">
                                <label>Accepted Payment Methods</label>
                                <div className="checkbox-group">
                                    {['BPI', 'GCASH', 'CASH', 'Bank Transfer'].map(method => (
                                        <label key={method} className="method-checkbox">
                                            <input type="checkbox" checked={formData.accepted_payment_methods.includes(method)} onChange={() => handlePaymentChange(method)}/>{method}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case STEPS.CONFIRMATION: return (
                    <form onSubmit={handleSubmit} className="owner-confirmation-form">
                        <h3 className="form-step-title">Step 3: Publish Confirmation</h3>
                        <div className="review-details">
                            <h4>Review Summary:</h4>
                            <p><strong>Condo:</strong> {formData.condo_name} - Unit {formData.unit_number}</p>
                            <p><strong>Price:</strong> ₱{formData.price_per_month.toLocaleString()}/month</p>
                            <p><strong>Payments:</strong> {formData.accepted_payment_methods.join(', ') || 'None selected'}</p>
                        </div>
                        <div className="confirmation-checkboxes">
                            <label className="terms-checkbox owner-term"><input type="checkbox" name="is_accurate_complete" checked={formData.is_accurate_complete} onChange={handleChange} />I confirm that all information provided is **accurate and complete**.</label>
                            <label className="terms-checkbox owner-term"><input type="checkbox" name="is_terms_agreed" checked={formData.is_terms_agreed} onChange={handleChange} />I agree to the **terms and conditions** of the platform.</label>
                            <label className="terms-checkbox owner-term"><input type="checkbox" name="is_review_understood" checked={formData.is_review_understood} onChange={handleChange} />I understand the listing will be **reviewed before being published**.</label>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="modal-actions">
                            <button type="button" onClick={() => setCurrentStep(STEPS.PAYMENT)} className="btn-secondary">BACK</button>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'SUBMIT'}</button>
                        </div>
                    </form>
                );
            default: return null;
        }
    };
    
    const stepLabels = ['Property Details', 'Payment Method', 'Publish Confirmation'];

    return (
        <div className="owner-listing-page-wrapper">
            <Header />
            <div className="owner-listing-container">
                <h1 className="page-title">List Your Place</h1>
                <div className="booking-progress listing-progress">
                    {stepLabels.map((label, index) => (
                        <div key={index} className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}>
                            <div className="step-circle">{index + 1}</div><span className="step-label">{label}</span>
                            {index < stepLabels.length - 1 && <div className="step-line"></div>}
                        </div>
                    ))}
                </div>
                <div className="listing-form-content">
                    {renderStepContent()}
                    {(currentStep === STEPS.DETAILS || currentStep === STEPS.PAYMENT) && currentStep !== STEPS.CONFIRMATION && (
                        <div className="modal-actions form-nav-buttons">
                            {currentStep > STEPS.DETAILS && (<button onClick={() => setCurrentStep(currentStep - 1)} className="btn-secondary">BACK</button>)}
                            <button onClick={handleNext} className="btn-primary">NEXT</button>
                        </div>
                    )}
                    {error && currentStep !== STEPS.CONFIRMATION && <p className="error-message">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default NewListingPage;