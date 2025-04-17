// OrgAdminProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const OrgAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const { userType, orgId } = useUser();
  const localStorageOrgId = localStorage.getItem('orgId');

  if (!token) {
    return <Navigate to="/loginorg" replace />;
  }

  // Only allow Org Admin, redirect others to their respective dashboards
  if (userType === 'superAdmin') {
    return <Navigate to="/dashboard/app" replace />;
  }

  // Ensure orgId is available for Org Admin
  if (userType === 'orgAdmin' && !orgId && !localStorageOrgId) {
    return <Navigate to="/loginorg" replace />;
  }

  return children;
};

export default OrgAdminProtectedRoute;