import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';

import firebaseConfig from '../../config/firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login handler
export const handleLogin = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Send token to backend Firebase verification endpoint
        const response = await fetch('/auth/firebase/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const { user } = await response.json();
        // Store user data in localStorage or state management
        localStorage.setItem('user', JSON.stringify(user));
        
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Google sign-in handler
export const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        // Send token to backend Firebase social auth endpoint
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

        const { user } = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Registration handler
export const handleRegister = async (formData) => {
    try {
        const { email, password, firstName, lastName, role } = formData;
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Send user data to backend Firebase endpoint
        const response = await fetch('/auth/firebase/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                firstName,
                lastName,
                role: role.toLowerCase()
            })
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        window.location.href = '/auth/login';
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Logout handler
export const handleLogout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};