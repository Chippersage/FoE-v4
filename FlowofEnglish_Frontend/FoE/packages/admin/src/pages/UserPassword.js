/*eslint-disable*/
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
const apiUrl = process.env.REACT_APP_API_URL;
const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const PasswordUpdateForm = () => {
  const classes = useStyles();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [orgUsername, setOrgUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for password match
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirm new password do not match');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/auth/loginreset`, {
        username: orgUsername,
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
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={6}>
        <Typography component="h1" variant="h5">
          Update Password
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="orgUsername"
            label="Organization Username"
            type="text"
            id="orgUsername"
            autoComplete="username"
            value={orgUsername}
            onChange={(e) => setOrgUsername(e.target.value)}
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
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
            Update Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PasswordUpdateForm;

/* eslint-enable */
