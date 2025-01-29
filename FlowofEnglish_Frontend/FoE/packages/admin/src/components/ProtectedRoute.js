/*eslint-disable*/
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const { userType } = useUser();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (userType === 'orgAdmin') {
    return <Navigate to="/org-dashboards/:id/app" replace />;
  }

  return children;
};

export default ProtectedRoute;
