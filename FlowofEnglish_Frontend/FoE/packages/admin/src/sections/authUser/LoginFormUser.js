// /* eslint-disable */
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // @mui
// import { Stack, IconButton, InputAdornment, TextField, Checkbox, Alert, Button } from '@mui/material';
// import { LoadingButton } from '@mui/lab';
// // components
// import Iconify from '../../components/iconify';
// import { useGeneralUser } from 'src/GeneralUserContext';
// // ----------------------------------------------------------------------

// export default function LoginFormUser() {
//   const navigate = useNavigate();
//   const apiUrl = process.env.REACT_APP_API_URL
//   const { setUserType, setUserId } = useGeneralUser();

//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
// try {
//     const response = await fetch(`${apiUrl}/users/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ userId: email, password: password }),
//     });
  
//     if (!response.ok) {
//       const errorData = await response.json();
//       setError(errorData.error || 'Login failed');
//       return;
//     }
  
//     const userData = await response.json();
//     console.log(userData)
  
//     // Check if the response has a token and userType
//     if (userData.token === 'dummyToken' && userData.userType === 'user') {
//       localStorage.setItem('token', userData.token); // Store the token (dummy token in this case)
//       setUserType(userData.userType); // Store the userType ('user')
//       setUserId(userData.userId); // Store userId
//       navigate(`/user-dashboards/${userData.userId}/app`, { replace: true }); // Redirect to user dashboard
//     } else {
//       setError('Invalid email or password');
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     setError('Error during login');
//   }
// };  
  

//   const handleSuperadmin = () => {
//     navigate('/login');
//   };

//   const handleForgotPassword = () => {
//     navigate('/forgot');
//   };

//   return (
//     <>
//       <Stack spacing={3}>
//         <TextField
//           name="email"
//           id="email"
//           label="User email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="email"
//         />

//         <TextField
//           name="password"
//           label="Password"
//           id="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           type={showPassword ? 'text' : 'password'}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                   <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Stack>

//       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
//         <Checkbox name="remember" /> Remember me
//       </Stack>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
//         Login
//       </LoadingButton>
//       <LoadingButton fullWidth size="large" variant="contained" sx={{ my: 2 }} onClick={handleSuperadmin}>
//         Go to Superadmin Page
//       </LoadingButton>
//       <Button disabled fullWidth size="large" variant="outlined">
//         Forgot Password
//       </Button>
//     </>
//   );
// }

// /* eslint-enable */
