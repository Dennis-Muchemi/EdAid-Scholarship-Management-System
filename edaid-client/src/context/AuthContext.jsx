import { createContext, useState, useEffect, useContext } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
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

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
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