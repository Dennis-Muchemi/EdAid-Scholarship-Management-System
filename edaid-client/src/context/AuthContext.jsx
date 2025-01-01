import { createContext, useState, useEffect, useContext } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification as firebaseSendEmailVerification,
    setPersistence,
    browserLocalPersistence,
    signOut
} from 'firebase/auth';
import { auth } from '../utils/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3500';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async (token, userData = {}) => {
        try {
            // Get current Firebase user verification status
            await auth.currentUser?.reload();
            const isVerified = auth.currentUser?.emailVerified;

            if (!isVerified) {
                throw new Error('Please verify your email before logging in');
            }

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    emailVerified: isVerified
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Force refresh user object
                    await firebaseUser.reload();
                    
                    if (!firebaseUser.emailVerified) {
                        setUser(null);
                        setError('Please verify your email first');
                        setLoading(false);
                        return;
                    }

                    const token = await firebaseUser.getIdToken(true);
                    
                    try {
                        const userData = await fetchUserData(token, {
                            email: firebaseUser.email,
                        });
                        
                        const enhancedUser = {
                            ...firebaseUser,
                            role: userData.user.role,
                            firstName: userData.user.firstName,
                            lastName: userData.user.lastName
                        };
                        setUser(enhancedUser);
                        setError(null);
                    } catch (fetchError) {
                        setUser(null);
                        if (!fetchError.message.includes('verify your email')) {
                            setError(fetchError.message);
                        }
                    }
                } else {
                    setUser(null);
                    setError(null);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                setUser(null);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            if (rememberMe) {
                await setPersistence(auth, browserLocalPersistence);
            }
            
            const result = await signInWithEmailAndPassword(auth, email, password);
            
            // Force reload user and verify email status
            await result.user.reload();
            
            if (!result.user.emailVerified) {
                throw new Error('Please verify your email first');
            }

            // Get fresh token after verification check
            const token = await result.user.getIdToken(true);
            
            const userData = await fetchUserData(token, {
                email: result.user.email
            });

            return {
                ...result.user,
                role: userData.user.role,
                firstName: userData.user.firstName,
                lastName: userData.user.lastName,
                redirectUrl: userData.redirectUrl
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (email, password, firstName, lastName, role = 'student') => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const token = await result.user.getIdToken();

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    role
                })
            });

            if (!response.ok) {
                // Clean up Firebase user if backend registration fails
                await result.user.delete();
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register user in database');
            }

            // Send verification email
            const actionCodeSettings = {
                url: `${window.location.origin}/verify-email`,
                handleCodeInApp: true
            };
            await firebaseSendEmailVerification(result.user, actionCodeSettings);
            
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            await signOut(auth);
            setUser(null);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const sendEmailVerification = async () => {
        if (auth.currentUser) {
            try {
                const actionCodeSettings = {
                    url: `${window.location.origin}/verify-email`,
                    handleCodeInApp: true
                };
                await firebaseSendEmailVerification(auth.currentUser, actionCodeSettings);
            } catch (error) {
                console.error('Email verification error:', error);
                throw error;
            }
        } else {
            throw new Error('No user found');
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        sendEmailVerification,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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

export default AuthProvider;