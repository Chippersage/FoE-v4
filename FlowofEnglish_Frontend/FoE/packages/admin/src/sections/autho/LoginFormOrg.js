/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack, IconButton, InputAdornment, TextField, Checkbox, Alert, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../components/iconify';
import { useUser } from 'src/UserContext';
// ----------------------------------------------------------------------

export default function LoginFormOrg() {
  const navigate = useNavigate();
  const apiUrl = 'https://flowofenglish.thechippersage.com/api/v1';
  const { setUserType, setOrgId } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${apiUrl}/organizations/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationAdminEmail: username, orgPassword: orgPassword }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return;
      }
  
      const orgData = await response.json();
      if (orgData.organizationId) {
        // Assuming token and userType are not returned in the response anymore
        localStorage.setItem('token', 'dummyToken'); // Set token as needed
        setUserType('orgAdmin'); // Set userType as needed
        setOrgId(orgData.organizationId);
        navigate(`/org-dashboards/${orgData.organizationId}/app`, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login');
    }
  };
  

  const handleSuperadmin = () => {
    navigate('/login');
  };

  const handleForgotPassword = () => {
    navigate('/forgot');
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          name="username"
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          name="orgPassword"
          label="Password"
          id="orgPassword"
          value={orgPassword}
          onChange={(e) => setOrgPassword(e.target.value)}
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
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" /> Remember me
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
        Login
      </LoadingButton>
      <LoadingButton fullWidth size="large" variant="contained" sx={{ my: 2 }} onClick={handleSuperadmin}>
        Go to Superadmin Page
      </LoadingButton>
      <Button fullWidth size="large" variant="outlined" onClick={handleForgotPassword}>
        Forgot Password
      </Button>
    </>
  );
}