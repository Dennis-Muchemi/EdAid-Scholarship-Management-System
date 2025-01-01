import { createContext, useState, useEffect, useContext } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification as firebaseSendEmailVerification,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../utils/firebase';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Refresh token every hour
                setInterval(async () => {
                    const newToken = await user.getIdToken(true);
                    // Update token in localStorage or state
                }, 3600000);
            }
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            if (rememberMe) {
                await setPersistence(auth, browserLocalPersistence);
            }
            const result = await signInWithEmailAndPassword(auth, email, password);
            if (!result.user.emailVerified) {
                throw new Error('Please verify your email first');
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const sendEmailVerification = async () => {
        if (auth.currentUser) {
            const actionCodeSettings = {
                url: `${window.location.origin}/verify-email`,
                handleCodeInApp: true
            };
            await firebaseSendEmailVerification(auth.currentUser, actionCodeSettings);
        }
    };

    const register = async (email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification();
            return result;
        } catch (error) {
            console.log('Firebase error code:', error.code);
            console.log('Firebase error message:', error.message);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            register,
            resetPassword,
            sendEmailVerification,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};