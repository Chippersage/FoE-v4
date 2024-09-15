/*eslint-disable*/
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
const apiUrl = process.env.REACT_APP_API_URL;
const ForgotPassword = () => {
  const [organisationName, setOrganisationName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/v1/organizations/forgotorgpassword`, {
        organisationName,
        email,
      });
      setMessage(`OTP sent to ${email}`);
    } catch (error) {
      setMessage(`Error: ${error.response.data.message}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Organization Name"
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
      <Button type="submit" variant="contained" color="primary">
        Send OTP
      </Button>
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default ForgotPassword;
/* eslint-enable */
