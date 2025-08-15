/* eslint-disable */

import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
// import Logo from '../components/logo';
// sections
import { LoginFormOrg } from '../sections/autho';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const apiUrl = process.env.REACT_APP_API_URL;

export default function LoginPageOrg() {
  const mdUp = useResponsive('up', 'md');

  return (
    <>
      <Helmet>
        <title> Login | Mindfultalk </title>
      </Helmet>

      <StyledRoot>
      <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: 3,
          }}
        >
          <LoginFormOrg />
        </Container>
        </StyledRoot>
    </>
  );
}

// const StyledRoot = styled('div')(({ theme }) => ({
//   [theme.breakpoints.up('md')]: {
//     display: 'flex',
//   },
// }));

// const StyledSection = styled('div')(({ theme }) => ({
//   width: '100%',
//   maxWidth: 480,
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   boxShadow: theme.customShadows.card,
//   backgroundColor: theme.palette.background.default,
// }));

// const StyledContent = styled('div')(({ theme }) => ({
//   maxWidth: 480,
//   margin: 'auto',
//   minHeight: '100vh',
//   display: 'flex',
//   justifyContent: 'center',
//   flexDirection: 'column',
//   padding: theme.spacing(12, 0),
// }));

// ----------------------------------------------------------------------


      {/* <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        /> */}

       {/* {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Welcome Admin
            </Typography>
            <img src={`/assets/illustrations/illustration_login.png`} alt="login" />
          </StyledSection>
        )} */}


        // <Container
        //   sx={{
        //     width: {
        //       xs: '100%', // Full width on small screens
        //       sm: '600px', // Restrict to 600px on larger screens
        //     },
        //     margin: '0 auto',
        //     padding: 2,
        //   }}
        // >
        //   <LoginFormOrg />
        // </Container>
  //   </>
  // );

