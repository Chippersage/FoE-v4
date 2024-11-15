/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper, IconButton, InputAdornment, Card, CardContent, CardHeader } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useParams, useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const StyledPaper = styled(Paper)({
  padding: '24px',
  marginTop: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledCard = styled(Card)({
  marginBottom: '24px',
});

const PasswordUpdateForm = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orgData, setOrgData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/loginorg');
      return;
    }
    const headers = { Authorization: `${token}` };

    axios.get(`${apiUrl}/organizations/${id}`, { headers })
      .then((res) => setOrgData(res.data))
      .catch((err) => {
        localStorage.removeItem('token');
        navigate('/loginorg');
      });
  }, [id, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/organizations/resetorgpassword`, {
        organisationName: organizationName,
        email: email,
        otp: otp,
      });

      alert(response.data.message);
      setNewPassword('');
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : 'An error occurred.');
    }
  };
  // Toggle password visibility
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Container maxWidth="sm" sx={{ marginTop: 10 }}>
      {/* Organization Info Card */}
      <StyledCard>
        <CardHeader title="Organization Info" />
        <CardContent>
        <Typography variant="h6">Organization: {orgData?.organizationName || 'N/A'}</Typography>
        <Typography variant="body2">OrganizationId: {orgData?.organizationId || 'Loading...'}</Typography>
        <Typography variant="body2">Admin: {orgData?.organizationAdminName || 'Loading...'}</Typography>
        <Typography variant="body2">Email: {orgData?.organizationAdminEmail || 'Loading...'}</Typography>
        <Typography variant="body2">Phone: {orgData?.organizationAdminPhone || 'Loading...'}</Typography>

        </CardContent>
      </StyledCard>

      {/* Password Update Form */}
      <StyledPaper>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Reset Organization Password
        </Typography>
        <form onSubmit={handleSubmit}style={{ width: '100%', marginTop: 8 }}>
          <TextField
            label="Organization Name"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <TextField
            label="OTP"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <TextField
            label="New Password"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errorMessage && (
            <Typography color="error" variant="body2" style={{ marginTop: '8px' }}>
              {errorMessage}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Reset Password
          </Button>
        </form>
        </StyledPaper>
    </Container>
  );
};

export default PasswordUpdateForm;

/* eslint-enable */
