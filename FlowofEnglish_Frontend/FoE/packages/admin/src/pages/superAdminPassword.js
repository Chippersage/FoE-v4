import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useState } from 'react';

const apiUrl = 'http://localhost:8080';

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
      const response = await axios.post(`${apiUrl}/api/v1/superadmin/resetpassword`,{
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
          <SubmitButton type="submit" fullWidth variant="contained" color="primary">
            Update Password
          </SubmitButton>
        </FormStyled>
      </PaperStyled>
    </ContainerStyled>
  );
};

export default SuperAdminPasswordUpdateForm;



// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
// import { styled } from '@mui/system';
// import axios from 'axios';
// import { useState } from 'react';

// const apiUrl = process.env.REACT_APP_API_URL;

// const useStyles = styled((theme) => ({
//   container: {
//     marginTop: theme.spacing(10),
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   paper: {
//     padding: theme.spacing(3),
//     marginTop: theme.spacing(3),
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   form: {
//     width: '100%', // Fix IE 11 issue.
//     marginTop: theme.spacing(1),
//   },
//   submit: {
//     margin: theme.spacing(3, 0, 2),
//   },
// }));

// const SuperAdminPasswordUpdateForm = () => {
//   const classes = useStyles();
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [superAdminUsername, setSuperAdminUsername] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmNewPassword) {
//       setErrorMessage('New password and confirm new password do not match');
//       return;
//     }

//     try {
//       // const response = await axios.post(`${apiUrl}/auth/superpasswordreset`, 
//       const response = await axios.post("http://localhost:8080/auth/superpasswordreset",{
//         username: superAdminUsername,
//         currentPassword,
//         newPassword,
//       });

//       if (response.data.error) {
//         setErrorMessage(response.data.error);
//         setSuccessMessage('');
//       } else {
//         setSuccessMessage(response.data.message);
//         setErrorMessage('');
//       }
//     } catch (error) {
//       console.error(error);
//       setErrorMessage('An error occurred during password reset');
//       setSuccessMessage('');
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Paper className={classes.paper} elevation={6}>
//         <Typography component="h1" variant="h5">
//           Update Super Admin Password
//         </Typography>
//         <form className={classes.form} noValidate onSubmit={handleSubmit}>
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="superAdminUsername"
//             label="Super Admin Username"
//             type="text"
//             id="superAdminUsername"
//             autoComplete="username"
//             value={superAdminUsername}
//             onChange={(e) => setSuperAdminUsername(e.target.value)}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="currentPassword"
//             label="Current Password"
//             type={showCurrentPassword ? 'text' : 'password'}
//             id="currentPassword"
//             autoComplete="current-password"
//             value={currentPassword}
//             onChange={(e) => setCurrentPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
//                     {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="newPassword"
//             label="New Password"
//             type={showNewPassword ? 'text' : 'password'}
//             id="newPassword"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
//                     {showNewPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="confirmNewPassword"
//             label="Confirm New Password"
//             type={showConfirmNewPassword ? 'text' : 'password'}
//             id="confirmNewPassword"
//             value={confirmNewPassword}
//             onChange={(e) => setConfirmNewPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
//                     {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           {errorMessage && <Typography color="error">{errorMessage}</Typography>}
//           {successMessage && <Typography color="primary">{successMessage}</Typography>}
//           <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
//             Update Password
//           </Button>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default SuperAdminPasswordUpdateForm;








// /*eslint-disable*/
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import axios from 'axios';
// import { useState } from 'react';
// const apiUrl = process.env.REACT_APP_API_URL;
// const useStyles = makeStyles((theme) => ({
//   container: {
//     marginTop: theme.spacing(10),
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   paper: {
//     padding: theme.spacing(3),
//     marginTop: theme.spacing(3),
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   form: {
//     width: '100%', // Fix IE 11 issue.
//     marginTop: theme.spacing(1),
//   },
//   submit: {
//     margin: theme.spacing(3, 0, 2),
//   },
// }));

// const SuperAdminPasswordUpdateForm = () => {
//   const classes = useStyles();
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [superAdminUsername, setSuperAdminUsername] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Basic validation for password match
//     if (newPassword !== confirmNewPassword) {
//       setErrorMessage('New password and confirm new password do not match');
//       return;
//     }

//     try {
//       const response = await axios.post(`${apiUrl}/auth/superpasswordreset`, {
//         username: superAdminUsername,
//         currentPassword,
//         newPassword,
//       });

//       if (response.data.error) {
//         setErrorMessage(response.data.error);
//         setSuccessMessage('');
//       } else {
//         setSuccessMessage(response.data.message);
//         setErrorMessage('');
//       }
//     } catch (error) {
//       console.error(error);
//       setErrorMessage('An error occurred during password reset');
//       setSuccessMessage('');
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Paper className={classes.paper} elevation={6}>
//         <Typography component="h1" variant="h5">
//           Update Super Admin Password
//         </Typography>
//         <form className={classes.form} noValidate onSubmit={handleSubmit}>
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="superAdminUsername"
//             label="Super Admin Username"
//             type="text"
//             id="superAdminUsername"
//             autoComplete="username"
//             value={superAdminUsername}
//             onChange={(e) => setSuperAdminUsername(e.target.value)}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="currentPassword"
//             label="Current Password"
//             type={showCurrentPassword ? 'text' : 'password'}
//             id="currentPassword"
//             autoComplete="current-password"
//             value={currentPassword}
//             onChange={(e) => setCurrentPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
//                     {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="newPassword"
//             label="New Password"
//             type={showNewPassword ? 'text' : 'password'}
//             id="newPassword"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
//                     {showNewPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <TextField
//             variant="outlined"
//             margin="normal"
//             required
//             fullWidth
//             name="confirmNewPassword"
//             label="Confirm New Password"
//             type={showConfirmNewPassword ? 'text' : 'password'}
//             id="confirmNewPassword"
//             value={confirmNewPassword}
//             onChange={(e) => setConfirmNewPassword(e.target.value)}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
//                     {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//           {errorMessage && <Typography color="error">{errorMessage}</Typography>}
//           {successMessage && <Typography color="primary">{successMessage}</Typography>}
//           <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
//             Update Password
//           </Button>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default SuperAdminPasswordUpdateForm;

// /* eslint-enable */
