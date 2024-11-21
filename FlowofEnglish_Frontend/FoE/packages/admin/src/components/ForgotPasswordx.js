import { Box, Button, TextField, Typography, Snackbar, Alert, IconButton, 
  InputAdornment,  } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import Iconify from './iconify';

const ForgotPassword = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!showOtpField) {
        // Request OTP
        await axios.post(`${process.env.REACT_APP_API_URL}/organizations/forgot-password`, {
          organizationName,
          email,
        });
        setShowOtpField(true);
        setAlert({
          open: true,
          message: `OTP sent to ${email}`,
          severity: 'success'
        });
      } else {
        // Reset password
        await axios.post(`${process.env.REACT_APP_API_URL}/organizations/reset-password`, {
          organizationName,
          email,
          otp,
          newPassword,
        });
        setAlert({
          open: true,
          message: 'Password reset successful',
          severity: 'success'
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>
      
      <TextField
        label="Organization Name"
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      
      <TextField
        label="Admin Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />

      {showOtpField && (
        <>
          <TextField
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
          name="New Password"
          label="New Password"
          
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
              
            ),
          }}
        />
        </>
      )}

      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        {showOtpField ? 'Reset Password' : 'Send OTP'}
      </Button>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;