import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Snackbar, Alert, IconButton, InputAdornment, CircularProgress, Paper, Divider,
  useTheme, Grid, Fade } from '@mui/material';
import axios from 'axios';
import Iconify from './iconify';

const ResetPasswordx = ({ organizationAdminEmail }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });
  const [formErrors, setFormErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Pre-fill email from props if available
  useEffect(() => {
    if (organizationAdminEmail) {
      setEmail(organizationAdminEmail);
    }
  }, [organizationAdminEmail]);

  // Password strength checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }
    
    // Simple password strength algorithm
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    const strengthMessages = [
      { message: 'Very Weak', color: '#ff4d4f' },
      { message: 'Weak', color: '#ff7a45' },
      { message: 'Medium', color: '#ffc53d' },
      { message: 'Strong', color: '#73d13d' },
      { message: 'Very Strong', color: '#52c41a' }
    ];

    setPasswordStrength({
      score,
      message: strengthMessages[score - 1]?.message || '',
      color: strengthMessages[score - 1]?.color || ''
    });

    // Validate password
    if (newPassword.length < 8) {
      setFormErrors(prev => ({
        ...prev,
        newPassword: 'Password must be at least 8 characters'
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        newPassword: ''
      }));
    }
  }, [newPassword]);

  // Validate confirm password
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  }, [newPassword, confirmPassword]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Client-side validation before submission
    if (newPassword !== confirmPassword) {
      setAlert({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    if (newPassword.length < 8) {
      setAlert({
        open: true,
        message: 'Password must be at least 8 characters',
        severity: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${apiUrl}/organizations/reset-password`, {
        email,
        oldPassword,
        newPassword
      });
      
      setAlert({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const renderPasswordStrength = () => {
    if (!newPassword) return null;
    
    return (
      <Box sx={{ mt: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" sx={{ mr: 1 }}>
            Password Strength:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: passwordStrength.color }}>
            {passwordStrength.message}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', width: '100%', gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Box
              key={level}
              sx={{
                height: 4,
                flex: 1,
                borderRadius: 1,
                bgcolor: level <= passwordStrength.score ? passwordStrength.color : '#e9e9e9'
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
        Reset Organization Password
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              disabled={isLoading || organizationAdminEmail}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:email-outline" width={20} height={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Current Password"
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-outline" width={20} height={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowOldPassword(!showOldPassword)} 
                      edge="end"
                      disabled={isLoading}
                    >
                      <Iconify icon={showOldPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-outline" width={20} height={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowNewPassword(!showNewPassword)} 
                      edge="end"
                      disabled={isLoading}
                    >
                      <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {renderPasswordStrength()}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:lock-outline" width={20} height={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      edge="end"
                      disabled={isLoading}
                    >
                      <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, position: 'relative' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading || !!formErrors.newPassword || !!formErrors.confirmPassword}
            sx={{
              bgcolor: '#5bc3cd',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#DB5788',
              },
              py: 1.5,
              px: 2,
              borderRadius: '8px',
            }}
          >
            {isLoading ? 'Updating Password...' : 'Change Password'}
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
        
        <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters for best security.
        </Typography>
      </Box>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ResetPasswordx;