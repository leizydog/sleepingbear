import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
// import { useAuth } from '../../context/AuthContext'; // <-- Removed failing import

// ⭐️ MOCK AUTH CONTEXT AND HOOK ⭐️
// This mock is included to resolve the "Could not resolve" error and allow the component to compile.
// In a real application, you would ensure the path to your actual AuthContext is correct.
const useAuth = () => {
    // Provide a mock login function that simply logs the success.
    const mockLogin = (accessToken, user) => {
        console.log("MOCK AUTH: Login successful. Token obtained.", accessToken);
        console.log("MOCK AUTH: User data received:", user);
        // This simulates storing the user token and state in a global context.
    };
    return { 
        login: mockLogin,
        // Assuming your real context provides user data or other necessary values
    };
};
// ⭐️ END MOCK ⭐️

const API_URL = 'http://127.0.0.1:8000/auth/login';

const LoginPage = () => {
    const navigate = useNavigate();
    // Using the mock hook to prevent compilation failure
    const { login: authContextLogin } = useAuth(); 
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // 1. Prepare data as URLSearchParams (Form Data)
        const requestData = new URLSearchParams();
        // The backend uses OAuth2PasswordRequestForm, which expects 'username' and 'password'
        requestData.append('username', formData.email); 
        requestData.append('password', formData.password); 

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    // 2. Set Content-Type header correctly for form data
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                // 3. Send the URL-encoded string as the body
                body: requestData.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle HTTP errors
                let errorMessage = data.detail || "Login failed due to server error.";
                
                if (response.status === 401) {
                    errorMessage = "Incorrect email or password.";
                } else if (response.status === 422) {
                    // This means the input still failed validation (e.g., email format invalid)
                    console.error("Validation error details:", data);
                    errorMessage = "Invalid input format. Please check your email and password fields.";
                }
                
                throw new Error(errorMessage);
            }

            // Handle successful login
            // The response data contains { access_token, token_type, user }
            const { access_token, user } = data;

            // Update AuthContext state
            authContextLogin(access_token, user); 
            
            // Redirect based on role
            // NOTE: If using the MOCK hook, navigation won't work in this specific editor environment,
            // but the logic is correct for a real application setup.
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'owner') {
                navigate('/owner/dashboard');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Login error:', err.message || err);
            setError(err.message || 'An unknown error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your component rendering the form
    return (
        // I've simplified the styling to focus on functionality
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Login Account</h2>
                
                <input 
                    type="email" 
                    name="email" 
                    placeholder="EMAIL ADDRESS"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="PASSWORD"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                
                {error && <p style={{ color: 'red', margin: 0, fontSize: '0.9em' }}>{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <p style={{ margin: 0, textAlign: 'center', fontSize: '0.9em' }}>
                    Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register Account</a>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;