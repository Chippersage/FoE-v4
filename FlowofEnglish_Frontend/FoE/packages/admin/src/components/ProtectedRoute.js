/*eslint-disable*/
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

// Super Admin Protected Route
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const { userType } = useUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userType === 'orgAdmin') {
    // Dynamically get orgId from localStorage or context
    const orgId = localStorage.getItem('orgId');
    return <Navigate to={`/org-dashboards/${orgId}/app`} replace />;
  }

  return children;
};

export default ProtectedRoute;