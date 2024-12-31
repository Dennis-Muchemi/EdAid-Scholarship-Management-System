// Import Firebase modules and config
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail
} from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';

import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = registerForm.email.value;
                const password = registerForm.password.value;
                const firstName = registerForm.firstName.value;
                const lastName = registerForm.lastName.value;
                const role = registerForm.role.value;

                // First check if user exists
                try {
                    const methods = await fetchSignInMethodsForEmail(auth, email);
                    if (methods && methods.length > 0) {
                        alert('User already exists. Please login.');
                        window.location.href = '/auth/login';
                        return;
                    }
                } catch (error) {
                    console.error("Error checking existing user:", error);
                }

                // Create user in Firebase
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Send verification email
                await sendEmailVerification(user);
                
                // Get the token
                const idToken = await user.getIdToken();
                
                // Register in backend
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
                        role
                    })
                });

                if (!response.ok) {
                    throw new Error('Registration failed');
                }

                alert('Registration successful! Please check your email for verification link.');
                window.location.href = '/auth/login';
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    alert('User already exists. Please login.');
                    window.location.href = '/auth/login';
                } else {
                    alert(error.message);
                }
            }
        });
    }

    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = loginForm.email.value;
                const password = loginForm.password.value;

                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    const resendButton = document.createElement('button');
                    resendButton.textContent = 'Resend verification email';
                    resendButton.className = 'btn btn-link';
                    resendButton.onclick = async () => {
                        try {
                            await sendEmailVerification(user);
                            alert('Verification email sent! Please check your inbox.');
                        } catch (error) {
                            alert('Error sending verification email: ' + error.message);
                        }
                    };
                    loginForm.appendChild(resendButton);
                    throw new Error('Please verify your email. Check your inbox or click "Resend verification email"');
                }

                const idToken = await user.getIdToken();
                
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
                alert(error.message);
            }
        });
    }

    // Handle Google Sign In
    const googleButtons = document.querySelectorAll('.google-signin-btn');
    if (googleButtons) {
        googleButtons.forEach(button => {
            button.addEventListener('click', async () => {
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
                    alert(error.message);
                }
            });
        });
    }
});