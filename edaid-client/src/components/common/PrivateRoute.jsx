import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext'; // adjust this path

const PrivateRoute = ({ children, allowedRoles }) => {
   const { user, loading } = AuthProvider();
   
   if (loading) return <div>Loading...</div>;
   
   if (!user) return <Navigate to="/login" />;
   
   if (allowedRoles && !allowedRoles.includes(user.role)) {
       return <Navigate to="/unauthorized" />;
   }
   
   return children;
};

export default PrivateRoute;