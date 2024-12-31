import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layouts/DashboardLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminDashboard from './components/admin/Dashboard';
import ReviewerDashboard from './components/reviewer/Dashboard';
import StudentDashboard from './components/student/Dashboard';
import { PrivateRoute } from './components/common/PrivateRoute';

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common';
import { DashboardLayout } from './components/layouts';
import { Login, Register, ForgotPassword } from './components/auth';
import { AdminDashboard, UserManagement, ApplicationReview } from './components/admin';
import { ReviewerDashboard, Applications as ReviewerApplications } from './components/reviewer';
import { StudentDashboard, Applications as StudentApplications } from './components/student';
import { PrivateRoute } from './components/common';

const theme = createTheme({
   // Add your theme customization here
});

const PrivateRoute = ({ children, allowedRoles }) => {
   const { user, loading } = useAuth();
   
   if (loading) return <div>Loading...</div>;
   
   if (!user) return <Navigate to="/login" />;
   
   if (allowedRoles && !allowedRoles.includes(user.role)) {
       return <Navigate to="/unauthorized" />;
   }
   
   return children;
};

const App = () => {
   return (
       <ThemeProvider theme={theme}>
           <AuthProvider>
               <BrowserRouter>
               <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <DashboardLayout>
                            <Routes>
                                <Route path="/dashboard" element={<AdminDashboard />} />
                                <Route path="/applications" element={<ApplicationReview />} />
                                <Route path="/users" element={<UserManagement />} />
                            </Routes>
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                {/* Reviewer Routes */}
                <Route path="/reviewer/*" element={
                    <PrivateRoute allowedRoles={['reviewer']}>
                        <DashboardLayout>
                            <Routes>
                                <Route path="/dashboard" element={<ReviewerDashboard />} />
                                <Route path="/applications" element={<Applications />} />
                            </Routes>
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                {/* Student Routes */}
                <Route path="/student/*" element={
                    <PrivateRoute allowedRoles={['student']}>
                        <DashboardLayout>
                            <Routes>
                                <Route path="/dashboard" element={<StudentDashboard />} />
                                <Route path="/applications" element={<Applications />} />
                            </Routes>
                        </DashboardLayout>
                    </PrivateRoute>
                } />

                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/profile" element={
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                } />
                <Route path="/change-password" element={
                    <PrivateRoute>
                        <ChangePassword />
                    </PrivateRoute>
                } />
            </Routes>
               </BrowserRouter>
           </AuthProvider>
       </ThemeProvider>
   );
};

export default App;
