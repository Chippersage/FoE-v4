import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const ContainerStyled = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(10),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const PaperStyled = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const FormStyled = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const SuperAdminPasswordUpdateForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [superAdminUsername, setSuperAdminUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm new password do not match');
      return;
    }

    try {
      // const response = await axios.post(`${apiUrl}/auth/superpasswordreset`, 
      const response = await axios.post(`${apiUrl}/superadmin/resetpassword`,{
        username: superAdminUsername,
        currentPassword,
        newPassword,
      });

      if (response.data.error) {
        setErrorMessage(response.data.error);
        setSuccessMessage('');
      } else {
        setSuccessMessage(response.data.message);
        setErrorMessage('');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An error occurred during password reset');
      setSuccessMessage('');
    }
  };

  return (
    <ContainerStyled component="main" maxWidth="xs">
      <PaperStyled elevation={6}>
        <Typography component="h1" variant="h5">
          Update Super Admin Password
        </Typography>
        <FormStyled noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="superAdminUsername"
            label="Super Admin Username"
            type="text"
            id="superAdminUsername"
            autoComplete="username"
            value={superAdminUsername}
            onChange={(e) => setSuperAdminUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="currentPassword"
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            id="currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmNewPassword"
            label="Confirm New Password"
            type={showConfirmNewPassword ? 'text' : 'password'}
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                    {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          {successMessage && <Typography color="primary">{successMessage}</Typography>}
          <SubmitButton
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
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
          }}
          >
            Update Password
          </SubmitButton>
        </FormStyled>
      </PaperStyled>
    </ContainerStyled>
  );
};

export default SuperAdminPasswordUpdateForm;