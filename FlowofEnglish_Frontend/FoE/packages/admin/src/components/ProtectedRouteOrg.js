/*eslint-disable*/
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const OrgAdminProtectedRoute = ({ children }) => {
  const tokenOrg = localStorage.getItem('token');
  const { userType } = useUser();
  // console.log('TokenOrg:', tokenOrg);
  // Logging the token

  if (!tokenOrg) {
    return <Navigate to="/loginorg" replace />;
  }

  if (userType === 'superAdmin') {
    return <Navigate to="/dashboard/app" replace />;
  }


  return children;
};

export default OrgAdminProtectedRoute;

/* eslint-enable */
