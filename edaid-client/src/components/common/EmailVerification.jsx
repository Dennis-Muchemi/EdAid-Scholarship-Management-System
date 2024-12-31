import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../utils/firebase'; // adjust path as needed
import { useAuth } from '../../context/AuthContext'; // adjust path as needed
import {
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';

const EmailVerification = () => {
    const [verificationState, setVerificationState] = useState('verifying'); // 'verifying', 'success', 'expired', 'error'
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const verifyEmail = async () => {
            const queryParams = new URLSearchParams(location.search);
            const oobCode = queryParams.get('oobCode');

            if (!oobCode) {
                setVerificationState('error');
                setLoading(false);
                return;
            }

            try {
                await applyActionCode(auth, oobCode);
                setVerificationState('success');
            } catch (error) {
                console.error('Verification error:', error);
                // Check if the error is due to expired code
                if (error.code === 'auth/invalid-action-code' || 
                    error.code === 'auth/expired-action-code') {
                    setVerificationState('expired');
                } else {
                    setVerificationState('error');
                }
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [location]);

    const handleResendVerification = async () => {
        try {
            if (user) {
                await sendEmailVerification(user);
                alert('Verification email sent! Please check your inbox.');
            }
        } catch (error) {
            console.error('Error sending verification email:', error);
            alert('Failed to send verification email. Please try again later.');
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    if (loading) {
        return (
            <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {verificationState === 'success' && (
                    <>
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            Your email has been verified successfully!
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
                        <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
                            Your verification link has expired or has already been used.
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleResendVerification}
                            fullWidth
                        >
                            Resend Verification Email
                        </Button>
                    </>
                )}

                {verificationState === 'error' && (
                    <>
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            There was an error verifying your email.
                        </Alert>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleResendVerification}
                            fullWidth
                        >
                            Resend Verification Email
                        </Button>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default EmailVerification;