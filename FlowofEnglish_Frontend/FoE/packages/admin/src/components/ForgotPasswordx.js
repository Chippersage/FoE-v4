import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import Iconify from './iconify';

const ForgotPasswordx = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Timer for OTP resend functionality
  useEffect(() => {
    let interval;
    if (showOtpField && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [showOtpField, resendTimer]);

  const handleBackToLogin = () => {
    navigate('/loginorg');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading || isResending) return; // Prevent submission if already loading
    setIsLoading(true);
    try {
      if (!showOtpField) {
        // First step: Request OTP by sending only email
        await axios.post(`${process.env.REACT_APP_API_URL}/organizations/forgot-password`, {
          email,
        });
        setShowOtpField(true);
        setAlert({
          open: true,
          message: `OTP sent to ${email}`,
          severity: 'success',
        });
        // Start the resend timer
        setResendTimer(60);
        setCanResendOtp(false);
      } else {
        // Second step: Verify OTP and get new password
        await axios.post(`${process.env.REACT_APP_API_URL}/organizations/forgot-password`, {
          email,
          otp,
        });
        setAlert({
          open: true,
          message: 'Password reset successful. Check your email for the new password.',
          severity: 'success',
        });
        // Reset form after successful password reset
        setTimeout(() => {
          setEmail('');
          setOtp('');
          setShowOtpField(false);
          // Redirect to login page after successful password reset
          navigate('/loginorg');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      setAlert({
        open: true,
        message: error.response?.data?.message || 'An error occurred',
        severity: 'error',
      });
      // If OTP verification failed, enable resend button immediately
      if (showOtpField && errorMessage.toLowerCase().includes('otp')) {
        setCanResendOtp(true);
        setResendTimer(0);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (isResending || isLoading) return; // Prevent resend if already in progress

    setIsResending(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/organizations/forgot-password`, {
        email,
        resend: true,
      });

      setAlert({
        open: true,
        message: `New OTP sent to ${email}`,
        severity: 'success',
      });

      // Reset the resend timer
      setResendTimer(60);
      setCanResendOtp(false);
      // Clear the OTP field
      setOtp('');
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to resend OTP',
        severity: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div className="min-h-screen md:bg-gray-100 w-full flex flex-col items-center md:p-4">
      <div className="mb-8 mt-8">
        {/* <img src="/assets/main-logo.png" alt="flowofenglish Logo" className="h-16" /> */}
        <img src="/assets/mindful_logo_circle.png" alt="Mindfultalk Logo" className="h-16" />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md md:p-8 p-4">
        <h2 className="md:text-3xl text-xl font-semibold text-center text-gray-800 mb-8">Forgot Password</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Box sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
            <TextField
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={showOtpField || isLoading} // Disable after OTP is sent
            />

            {showOtpField && (
              <TextField
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isLoading || isResending}
                placeholder="Enter the OTP sent to your email"
              />
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading || isResending}
              sx={{
                bgcolor: '#5bc3cd', // Default background color
                color: 'white', // Text color
                fontWeight: 'bold', // Font weight
                '&:hover': {
                  bgcolor: '#DB5788', // Hover background color
                },
                py: 1.5, // Padding Y
                px: 2, // Padding X
                borderRadius: '8px', // Border radius
                mt: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : showOtpField ? (
                'Reset Password'
              ) : (
                'Send OTP'
              )}
            </Button>

            {showOtpField && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {canResendOtp ? (
                  <Button
                    onClick={handleResendOtp}
                    disabled={isResending || isLoading}
                    sx={{
                      color: '#5bc3cd',
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {isResending ? <CircularProgress size={20} color="inherit" /> : 'Resend OTP'}
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Resend OTP in {resendTimer} seconds
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <div className="mt-6 text-center space-y-2">
            <Button
              onClick={handleBackToLogin}
              disabled={isLoading || isResending}
              className="text-[#5bc3cd] hover:underline block w-full"
            >
              Back to Admin Login?
            </Button>
          </div>
        </form>
      </div>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ForgotPasswordx;
