// frontend/auth.js - Frontend authentication handlers
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';

import firebaseConfig from '../../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Registration handler
export const handleRegister = async (formData) => {
    try {
        const { email, password, firstName, lastName, role } = formData;
        
        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        
        // Get ID token
        const idToken = await user.getIdToken();

        // Send user data to backend
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                role: role.toLowerCase()
            })
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        // Show success message and redirect
        alert('Registration successful! Please check your email for verification link.');
        window.location.href = '/auth/login';
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Login handler
export const handleLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            throw new Error('Please verify your email. Check your inbox or click "Resend verification email"');
        }

        const idToken = await user.getIdToken();
        
        // Send token to backend
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const { redirectUrl } = await response.json();
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
    try {
        const user = auth.currentUser;
        if (user) {
            await sendEmailVerification(user);
            alert('Verification email sent! Please check your inbox.');
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

// Google sign-in handler
export const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        const response = await fetch('/auth/firebase/social', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Google sign-in failed');
        }

        const { redirectUrl } = await response.json();
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Password reset handler
export const handlePasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
};

// Logout handler
export const handleLogout = async () => {
    try {
        await signOut(auth);
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = {
                    email: registerForm.email.value,
                    password: registerForm.password.value,
                    firstName: registerForm.firstName.value,
                    lastName: registerForm.lastName.value,
                    role: registerForm.role.value
                };
                await handleRegister(formData);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await handleLogin(
                    loginForm.email.value,
                    loginForm.password.value
                );
            } catch (error) {
                alert(error.message);
                if (error.message.includes('verify your email')) {
                    const resendButton = document.createElement('button');
                    resendButton.textContent = 'Resend verification email';
                    resendButton.className = 'btn btn-link';
                    resendButton.onclick = () => resendVerificationEmail(loginForm.email.value);
                    loginForm.appendChild(resendButton);
                }
            }
        });
    }

    // Password reset form handler
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await handlePasswordReset(resetForm.email.value);
            } catch (error) {
                alert(error.message);
            }
        });
    }
});