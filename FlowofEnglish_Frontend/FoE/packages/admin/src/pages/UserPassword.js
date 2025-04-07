/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardHeader, Paper, styled, Grid, Box, CircularProgress, Divider, Chip } from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import ResetPasswordx from '../components/ResetPasswordx';


const apiUrl = process.env.REACT_APP_API_URL;

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  border: '1px solid #f0f0f0',
  height: '100%'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  border: '1px solid #f0f0f0'
}));

const InfoItem = ({ label, value, loading, isEmail = false }) => (
  <Box sx={{ mb: 1.5, display: 'flex', flexDirection: isEmail ? 'column' : 'row', width: '100%' }}>
    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120, color: 'text.secondary', mb: isEmail ? 0.5 : 0 }}>
      {label}:
    </Typography>
    {loading ? (
      <CircularProgress size={16} sx={{ ml: isEmail ? 0 : 1 }} />
    ) : (
      <Typography
        variant="body1"
        sx={{
          wordBreak: isEmail ? 'break-all' : 'normal',
          overflowWrap: 'break-word',
          whiteSpace: isEmail ? 'normal' : 'nowrap',
          textOverflow: isEmail ? 'clip' : 'ellipsis',
          overflow: 'hidden',
          maxWidth: '100%'
        }}
      >
        {value || 'N/A'}
      </Typography>
    )}
  </Box>
);

const UserPassword = () => {
  const [orgData, setOrgData] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/loginorg');
      return;
    }

    const fetchOrgData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `${token}` };
        const response = await axios.get(`${apiUrl}/organizations/${id}`, { headers });
        setOrgData(response.data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
        localStorage.removeItem('token');
        navigate('/loginorg');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [id, navigate])

  return (
    <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#5bc3cd', mb: 3 }}>
        Organization Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          {/* Organization Info Card */}
          <StyledCard>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Organization Info</Typography>
                  {!loading && <Chip label="Active" color="success" size="small" />}
                </Box>
              }
              sx={{ bgcolor: '#f5f5f5', pb: 1.5 }}
            />
            <CardContent sx={{ height: 'calc(100% - 70px)', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flexGrow: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <InfoItem label="Org Name" value={orgData?.organizationName} loading={loading} />
                  <InfoItem label="Org ID" value={orgData?.organizationId} loading={loading} />
                  <Divider sx={{ my: 2 }} />
                  <InfoItem label="Admin" value={orgData?.organizationAdminName} loading={loading} />
                  <InfoItem label="Email" value={orgData?.organizationAdminEmail} loading={loading} isEmail={false} />
                  <InfoItem label="Phone" value={orgData?.organizationAdminPhone} loading={loading} />
                  <InfoItem label="Created At" value={orgData?.createdAt? format(new Date(orgData.createdAt), "dd MMM yyyy, hh:mm a") : 'N/A'} loading={loading}/>
                  {/* Added spacing element to push content to the top and ensure the card expands */}
                  <Box sx={{ flexGrow: 1, minHeight: '100px' }} />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={7}>
          {/* Password Reset Section */}
          <ResetPasswordx organizationAdminEmail={orgData?.organizationAdminEmail} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserPassword;
/* eslint-enable */