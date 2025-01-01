import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../utils/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Box,
    Alert,
    MenuItem,
    Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First name and last name are required');
            return false;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            await register(
                formData.email, 
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.role
            );

            navigate('/login', { 
                state: { 
                    message: 'Registration successful! Please check your email for verification link.'
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            handleRegistrationError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            setError('');
            
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();

            // Call your backend to handle Google sign-up
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/firebase/social`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: formData.role, // Send selected role for Google sign-up
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ')[1] || '',
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to complete registration');
            }

            const userData = await response.json();
            
            navigate('/login', { 
                state: { 
                    message: 'Registration with Google successful! You can now sign in.'
                }
            });
        } catch (error) {
            console.error('Google sign-up error:', error);
            handleRegistrationError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationError = (error) => {
        if (error.code === 'auth/email-already-in-use') {
            setError('An account with this email already exists. Please try logging in instead.');
        } else if (error.code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
        } else if (error.code === 'auth/operation-not-allowed') {
            setError('Google sign-up is not enabled. Please try email registration.');
        } else if (error.code === 'auth/weak-password') {
            setError('Password is too weak. Please choose a stronger password.');
        } else if (error.code === 'auth/popup-closed-by-user') {
            setError('Google sign-up was cancelled. Please try again.');
        } else {
            setError(error.message || 'Failed to create account. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                
                <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    name="role"
                    label="Role"
                    value={formData.role}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="reviewer">Reviewer</MenuItem>
                </TextField>

                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    Sign up with Google
                </Button>

                <Divider sx={{ width: '100%', mb: 2 }}>OR</Divider>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            required
                            fullWidth
                            name="firstName"
                            label="First Name"
                            autoComplete="given-name"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            fullWidth
                            name="lastName"
                            label="Last Name"
                            autoComplete="family-name"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </Box>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="email"
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        helperText="Password must be at least 6 characters long"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </Box>
                
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Link href="/login" variant="body2">
                        Already have an account? Sign in
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;