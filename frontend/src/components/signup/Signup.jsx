import { useState } from 'react';
import '../styles/signup/Signup.css'; 

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // for handling form input changes
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        //Email Validaiion with regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        //test for valid email
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        //password validation, lenght >= 8
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        //check password matches confirm password
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        
        return true;

    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }
        setLoading(true);

        //Mock fetch request
        // try {

        // }
        // catch (err) {
        //     setError(err.message || 'An error occurred during signup');
        // } finally {
        //     setLoading(false);
        // }
        
    }

    return (
        <div className="signup-container">
            <div className="signup-form-container">
                <h1 className="signup-title">Create an Account</h1>
                <p className="signup-subtitle">Join Green Cart today to start your eco-friendly shopping journey</p>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Account created successfully! Please check your email to verify your account.</div>}
                
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password (min. 8 characters)"
                            required 
                        />
                        <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                        <small className="password-hint">Use at least 8 characters with a mix of letters, numbers & symbols</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required 
                        />
                        <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {/* Signup Button */}
                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                {/* Link to Login */}
                <div className="login-link">
                    Already have an account? <a href="/login">Log in</a>
                </div>
                
                <div className="terms">
                    By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}

