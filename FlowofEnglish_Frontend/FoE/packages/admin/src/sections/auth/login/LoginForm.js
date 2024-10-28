
/* eslint-disable */
import { LoadingButton } from '@mui/lab';
import { Checkbox, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios'; // Import axios
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/UserContext'; // Assuming this is the correct path to UserContext
import Iconify from '../../../components/iconify';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUserType } = useUser(); // Using useUser hook to get setUserType
  const apiUrl = process.env.REACT_APP_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  try {
    const response = await axios.post(`${apiUrl}/superadmin/login`, {
      userId,
      password,
    });
  
    const data = response.data; // Access data from the response
    console.log('Response data:', data); // Log the entire response
  
    // Fix condition to match response fields correctly
    if (data.token === 'dummyToken' && data.userType === 'superAdmin') {
      localStorage.setItem('token', data.token); // Store the token in localStorage
      setUserType(data.userType); // Set the userType from context
      navigate('/dashboard', { replace: true }); // Redirect to the dashboard
    } else {
      setError(data.error || 'Login failed');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      setError('Invalid credentials');
    } else if (error.response && error.response.status === 500) {
      setError('Server error. Please try again later.');
    } else {
      setError('Error during login');
    }
  }
  };  
  const handleSuperAdmin = () => {
    navigate('/loginorg');
  };

  const handleRedirectToUserLogin = () => {
    navigate('/loginUser');
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          name="userId"
          id="userId"
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      {error && (
        <Typography variant="body2" color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" /> Remember me
      </Stack>

      <LoadingButton fullWidth size="large" variant="contained" onClick={handleSubmit}>
        Login
      </LoadingButton>
      <LoadingButton fullWidth size="large" variant="contained" sx={{ my: 2 }} onClick={handleSuperAdmin}>
        Go to organization admin Page
      </LoadingButton>
      {/* <LoadingButton fullWidth size="large" variant="contained" sx={{ my: 2 }} onClick={handleRedirectToUserLogin}>
        Go to User Login Page
      </LoadingButton> */}
    </>
  );
}
/* eslint-enable */
