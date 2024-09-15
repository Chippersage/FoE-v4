/*eslint-disable*/
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const ProtectedRoute = () => {
//   const navigate = useNavigate();
//   const isAuthenticated = !!localStorage.getItem('token'); // Adjust this based on your auth logic

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/login');
//     }
//   }, [isAuthenticated, navigate]);

//   return isAuthenticated;
// };

// export default ProtectedRoute;
/* eslint-enable */
