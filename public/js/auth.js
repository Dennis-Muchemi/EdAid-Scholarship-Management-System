import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';

// Import Firebase configuration
import firebaseConfig from '../../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login handler
export const handleLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Send token to backend
        await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

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

        // Send token to backend
        await fetch('/auth/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Registration handler
export const handleRegistration = async (userData) => {
    try {
        const { email, password, firstName, lastName } = userData;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Send user data to backend
        await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ firstName, lastName, email })
        });

        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Logout handler
export const handleLogout = async () => {
    try {
        await signOut(auth);
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};