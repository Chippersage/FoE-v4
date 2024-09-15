/*eslint-disable*/
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;
const ResetPassword = () => {
  const [organisationName, setOrganisationName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post(`${apiUrl}/api/v1/organizations/resetorgpassword`, {
            organisationName,
            email,
            otp,
        });
        setMessage(`New password sent to ${email}`);
    } catch (error) {
        setMessage(`Error: ${error.response.data.message}`);
    }
};

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <TextField
        label="Organization name"
        value={organisationName}
        onChange={(e) => setOrganisationName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Admin Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth margin="normal" required />
      <Button type="submit" variant="contained" color="primary">
        Reset Password
      </Button>
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default ResetPassword;
/* eslint-enable */
