/*eslint-disable*/
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ForgotPasswordx from '../components/ForgotPasswordx';
import ResetPasswordx from '../components/ResetPasswordx';

const ForgotPassword = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        <ForgotPasswordx />
        <ResetPasswordx />
      </Box>
    </Container>
  );
};

export default ForgotPassword;
/* eslint-enable */
