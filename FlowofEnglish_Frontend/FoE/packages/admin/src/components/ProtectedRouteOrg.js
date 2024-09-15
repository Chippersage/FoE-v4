/*eslint-disable*/
import React from 'react';
import { Navigate } from 'react-router-dom';

const OrgAdminProtectedRoute = ({ children }) => {
  const tokenOrg = localStorage.getItem('token');
  // console.log('TokenOrg:', tokenOrg);
  // Logging the token

  if (!tokenOrg) {
    return <Navigate to="/loginorg" replace />;
  }

  return children;
};

export default OrgAdminProtectedRoute;

/* eslint-enable */
