/*eslint-disable*/
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;
const Signup = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting form with:", userId, password);
    try {
        const response = await axios.post(`${apiUrl}/superadmin/create`, {
        userId,
        password,
      });
      console.log("Response:", response);
      setMessage('Superadmin created successfully!');
    } catch (error) {
      console.error("Error:", error);
      setMessage('Error creating superadmin');
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Signup
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Create Superadmin
            </Button>
          </Box>
        </form>
        {message && (
          <Box mt={2}>
            <Typography variant="body1" color="textSecondary">
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Signup;
/* eslint-enable */
