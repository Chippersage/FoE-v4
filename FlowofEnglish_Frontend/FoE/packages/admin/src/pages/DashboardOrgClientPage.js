import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Grid, Container, Typography, Box, Button, Card, CardContent, CardHeader } from '@mui/material';
import { getOrgCohorts, getOrgUsers } from '../api';

const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardOrgClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orgData, setOrgData] = useState({});
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch organization details, cohorts, and users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/loginorg');
      return;
    }
    const headers = { Authorization: `${token}` };

    // Fetch organization info
    axios.get(`${apiUrl}/organizations/${id}`, { headers })
      .then((res) => setOrgData(res.data))
      .catch((err) => {
        localStorage.removeItem('token');
        navigate('/loginorg');
      });

    // Fetch cohorts and users for the organization
    getOrgCohorts(id).then(setCohorts).catch(console.error);
    getOrgUsers(id).then(setUsers).catch(console.error);
  }, [id, navigate]);

  return (
    <>
      <Helmet>
        <title> Dashboard | Organization</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Welcome message */}
        <Typography variant="h4" sx={{ mb: 5 }}>
          Welcome back, {orgData.organizationName}!
        </Typography>

        <Grid container spacing={3}>
          {/* Organization Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardHeader title="Organization Info" />
              <CardContent>
                <Typography variant="h6">Organization: {orgData.organizationName}</Typography>
                <Typography variant="body2">OrganizationId: {orgData.organizationId}</Typography>
                <Typography variant="body2">Admin: {orgData.organizationAdminName}</Typography>
                <Typography variant="body2">Email: {orgData.organizationAdminEmail}</Typography>
                <Typography variant="body2">Phone: {orgData.organizationAdminPhone}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Users Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardHeader title="Users" />
              <CardContent>
                <Typography variant="h6">Total Users: {users.length}</Typography>
                <Box display="flex" justifyContent="flex-end">
                  <Button component={RouterLink} to={`/org-dashboards/${id}/org-Create-Users`} variant="outlined" size="large" color="primary">
                    View All Users
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cohorts Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardHeader title="Cohorts" />
              <CardContent>
                <Typography variant="h6">Total Cohorts: {cohorts.length}</Typography>
                <Box display="flex" justifyContent="flex-end">
                  <Button component={RouterLink} to={`/org-dashboards/${id}/orgdashc`} variant="outlined" size="large" color="primary">
                    View All Cohorts
                  </Button>
                  </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Users List Card */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Registered Users" />
              <CardContent>
                {users.length > 0 ? (
                  users.map((user) => (
                    <Typography key={user.userId}>
                      {user.userName} - {user.userPhoneNumber}
                    </Typography>
                  ))
                ) : (
                  <Typography>No registered users available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
