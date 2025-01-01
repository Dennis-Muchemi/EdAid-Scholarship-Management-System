import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useAuth } from '../../context/AuthContext';
import {
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3500';

const EmailVerification = () => {
    const [verificationState, setVerificationState] = useState('verifying');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { sendEmailVerification } = useAuth();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const oobCode = queryParams.get('oobCode');
                const mode = queryParams.get('mode');
                const continueUrl = queryParams.get('continueUrl');

                // If we have a continueUrl but no oobCode, the user was redirected back
                // from Firebase's default verification page
                if (!oobCode && continueUrl) {
                    // Verify with backend directly
                    await verifyWithBackend();
                    setVerificationState('success');
                    setLoading(false);
                    return;
                }

                if (!oobCode || mode !== 'verifyEmail') {
                    setError('Invalid verification link');
                    setVerificationState('error');
                    setLoading(false);
                    return;
                }

                // Apply the verification code with Firebase
                await applyActionCode(auth, oobCode);

                // Force reload the user to get the latest verification status
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    const idToken = await auth.currentUser.getIdToken(true);

                    if (!auth.currentUser.emailVerified) {
                        throw new Error('Email verification failed');
                    }

                    // Verify with backend
                    await verifyWithBackend(idToken);
                }

                setVerificationState('success');
            } catch (error) {
                console.error('Verification error:', error);
                
                if (error.code === 'auth/invalid-action-code') {
                    if (auth.currentUser?.emailVerified) {
                        // If the code is invalid but the email is verified,
                        // the user probably already verified their email
                        setVerificationState('success');
                    } else {
                        setError('This verification link has expired or already been used.');
                        setVerificationState('expired');
                    }
                } else if (error.code === 'auth/expired-action-code') {
                    setError('This verification link has expired.');
                    setVerificationState('expired');
                } else {
                    setError(error.message || 'Verification failed');
                    setVerificationState('error');
                }
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [location]);

    const verifyWithBackend = async (idToken) => {
        try {
            if (!idToken && auth.currentUser) {
                idToken = await auth.currentUser.getIdToken(true);
            }

            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to confirm verification with backend');
            }

            return await response.json();
        } catch (error) {
            console.error('Backend verification error:', error);
            throw error;
        }
    };

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            await sendEmailVerification();
            alert('New verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Error sending verification email:', error);
            setError('Failed to send verification email: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = async () => {
        try {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                await auth.currentUser.getIdToken(true);
            }
            navigate('/login', { 
                state: { 
                    message: 'Email verified successfully. You can now log in.' 
                } 
            });
        } catch (error) {
            console.error('Error preparing for login:', error);
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <Container component="main" maxWidth="xs">
                <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Email Verification
                </Typography>

                {verificationState === 'success' && (
                    <>
                        <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                            Your email has been successfully verified! You can now log in to your account.
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGoToLogin}
                            fullWidth
                        >
                            Go to Login
                        </Button>
                    </>
                )}

                {verificationState === 'expired' && (
                    <>
                        <Alert severity="warning" sx={{ width: '100%', mb: 3 }}>
                            {error}
                            Please request a new verification link.
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleResendVerification}
                            fullWidth
                            disabled={loading}
                        >
                            Request New Verification Link
                        </Button>
                    </>
                )}

                {verificationState === 'error' && (
                    <>
                        <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                            {error}
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleResendVerification}
                            fullWidth
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            Request New Verification Link
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleGoToLogin}
                            fullWidth
                        >
                            Back to Login
                        </Button>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default EmailVerification;