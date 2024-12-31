import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary, PrivateRoute, EmailVerification } from './components/common';
import { DashboardLayout, NavBar } from './components/layouts';
import { Login, Register, ForgotPassword } from './components/auth';
import { AdminDashboard, UserManagement, ApplicationReview } from './components/admin';
import { ReviewerDashboard, Applications as ReviewerApplications } from './components/reviewer';
import { StudentDashboard, Applications as StudentApplications } from './components/student';
import { AuthProvider } from './context/AuthContext';
import { UserProfile} from './components/profile';
import { ChangePassword } from './components/auth';

const theme = createTheme({
   palette: {
     primary: {
       main: '#1976d2',
       light: '#42a5f5',
       dark: '#1565c0',
       contrastText: '#ffffff',
     },
     // ... rest of your theme configuration
   }
});


const App = () => {
   return (
       <ErrorBoundary>
           <ThemeProvider theme={theme}>
               <AuthProvider>
                   <BrowserRouter>
                       <Routes>
                           {/* Public Routes */}
                           <Route path="/login" element={<Login />} />
                           <Route path="/register" element={<Register />} />
                           <Route path="/forgot-password" element={<ForgotPassword />} />
                           <Route path="/verify-email" element={<EmailVerification />} />

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
                                           <Route path="/applications" element={<ReviewerApplications />} />
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
                                           <Route path="/applications" element={<StudentApplications />} />
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
       </ErrorBoundary>
   );
};

export default App;
