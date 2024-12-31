import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
    Container, Paper, TextField, Button, Typography,
    Link, Box, Alert, CircularProgress, Checkbox,
    FormControlLabel
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { LoadingSpinner } from '../common';
import React, { useContext } from 'react';
import { useAuth } from '../../context/AuthContext';

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required')
});

const Login = () => {
    const { login, loading, error: authError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const { email, password, rememberMe } = values;
            const user = await login(email, password, rememberMe);
            
            if (!user.emailVerified) {
                setFieldError('email', 'Please verify your email first');
                return;
            }
            
            navigate('/dashboard');
        } catch (error) {
            setFieldError('submit', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await handleGoogleSignIn();
            navigate('/dashboard');
        } catch (error) {
            console.error('Google sign-in failed:', error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Sign In
                </Typography>

                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    sx={{ mt: 3, mb: 2 }}
                >
                    Continue with Google
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    or use your email
                </Typography>

                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                        rememberMe: false
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                        <Form style={{ width: '100%' }}>
                            {(errors.submit || authError) && (
                                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                    {errors.submit || authError}
                                </Alert>
                            )}
                            
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.password && Boolean(errors.password)}
                                helperText={touched.password && errors.password}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="rememberMe"
                                        color="primary"
                                        checked={values.rememberMe}
                                        onChange={handleChange}
                                    />
                                }
                                label="Remember me"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isSubmitting || loading}
                            >
                                {isSubmitting || loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Link href="/forgot-password" variant="body2">
                                    Forgot password?
                                </Link>
                                <Link href="/register" variant="body2">
                                    Don't have an account? Sign Up
                                </Link>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Container>
    );
};

export default Login;