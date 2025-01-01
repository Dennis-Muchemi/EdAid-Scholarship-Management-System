import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    FormControlLabel,
    Checkbox,
    Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationOption, setShowVerificationOption] = useState(false);
    
    const { login, sendEmailVerification } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const { state } = location;
        if (state?.message) {
            setSuccessMessage(state.message);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setShowVerificationOption(false);

        try {
            const userWithRole = await login(email, password, rememberMe);
            handleSuccessfulLogin(userWithRole);
        } catch (error) {
            console.error('Login error:', error);
            handleLoginError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError('');
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Get the token
            const token = await result.user.getIdToken();
            
            // Call your backend to handle Google sign-in
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/firebase/social`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate with server');
            }

            const userData = await response.json();
            handleSuccessfulLogin(userData);
        } catch (error) {
            console.error('Google sign-in error:', error);
            setError('Failed to sign in with Google: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessfulLogin = (userData) => {
        if (userData.redirectUrl) {
            navigate(userData.redirectUrl);
        } else {
            // Fallback routing based on role
            switch (userData.role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'reviewer':
                    navigate('/reviewer/dashboard');
                    break;
                case 'student':
                    navigate('/student/dashboard');
                    break;
                default:
                    setError('Invalid user role');
            }
        }
    };

    const handleLoginError = (error) => {
        if (error.message.includes('verify your email')) {
            setError('Please verify your email before logging in');
            setShowVerificationOption(true);
        } else if (error.code === 'auth/user-not-found') {
            setError('No account found with this email');
        } else if (error.code === 'auth/wrong-password') {
            setError('Incorrect password');
        } else if (error.code === 'auth/too-many-requests') {
            setError('Too many failed attempts. Please try again later.');
        } else {
            setError('Failed to sign in: ' + (error.message || 'Unknown error'));
        }
    };

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            await sendEmailVerification();
            setSuccessMessage('Verification email sent! Please check your inbox.');
            setError('');
        } catch (error) {
            setError('Failed to send verification email: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Sign In
                </Typography>
                
                {successMessage && (
                    <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                        {successMessage}
                    </Alert>
                )}
                
                {error && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Alert severity="error">
                            {error}
                            {showVerificationOption && (
                                <Button 
                                    onClick={handleResendVerification}
                                    size="small"
                                    sx={{ ml: 2 }}
                                >
                                    Resend Verification Email
                                </Button>
                            )}
                        </Alert>
                    </Box>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                value="remember"
                                color="primary"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                        }
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        Sign in with Google
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Link href="/forgot-password" variant="body2">
                            Forgot password?
                        </Link>
                        <Link href="/register" variant="body2">
                            Don't have an account? Sign up
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;