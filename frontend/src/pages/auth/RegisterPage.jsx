// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/api'; 
import Header from '../../components/common/Header'; 
import './Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '', middle_name: '', last_name: '',
        email: '', contact_number: '', password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.middle_name) { delete dataToSend.middle_name; }
            
            // await axios.post('/auth/register', dataToSend);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            
            navigate('/login'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <Header /> 
            <div className="auth-form-container">
                <h1 className="auth-title">Register Account</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-grid">
                        <div className="input-group"><label htmlFor="first_name">FIRST NAME</label><input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required/></div>
                        <div className="input-group"><label htmlFor="middle_name">MIDDLE NAME (OPTIONAL)</label><input type="text" id="middle_name" name="middle_name" value={formData.middle_name} onChange={handleChange}/></div>
                        <div className="input-group"><label htmlFor="last_name">LAST NAME</label><input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required/></div>
                        <div className="input-group"><label htmlFor="email">EMAIL ADDRESS</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required/></div>
                        <div className="input-group"><label htmlFor="contact_number">CONTACT NUMBER</label><input type="tel" id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleChange} required/></div>
                        <div className="input-group"><label htmlFor="password">PASSWORD</label><input type="password" id="password" name="password" placeholder="**********" value={formData.password} onChange={handleChange} required/></div>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
                <p className="auth-link-footer">
                    Already have an account? <Link to="/login" className="link-text">Login Account</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;