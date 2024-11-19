/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardHeader, Paper, styled } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ForgotPasswordx from '../components/ForgotPasswordx';


const apiUrl = process.env.REACT_APP_API_URL;

// Styled Components
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

const UserPassword = () => {
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
    axios
      .get(`${apiUrl}/organizations/${id}`, { headers })
      .then((res) => setOrgData(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/loginorg');
      });
  }, [id, navigate]);

  return (
    <Container maxWidth="sm" sx={{ marginTop: 10 }}>
      {/* Organization Info Card */}
      <StyledCard>
        <CardHeader title="Organization Info" />
        <CardContent>
          <Typography variant="body2">OrganizationName: {orgData?.organizationName || 'N/A'}</Typography>
          <Typography variant="body2">OrganizationId: {orgData?.organizationId || 'Loading...'}</Typography>
          <Typography variant="body2">Admin: {orgData?.organizationAdminName || 'Loading...'}</Typography>
          <Typography variant="body2">Email: {orgData?.organizationAdminEmail || 'Loading...'}</Typography>
          <Typography variant="body2">Phone: {orgData?.organizationAdminPhone || 'Loading...'}</Typography>
        </CardContent>
      </StyledCard>

      {/* Password Reset Section */}
      <StyledPaper>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Reset Organization Password
        </Typography>
        <ForgotPasswordx />
      </StyledPaper>
    </Container>
  );
};

export default UserPassword;
/* eslint-enable */
