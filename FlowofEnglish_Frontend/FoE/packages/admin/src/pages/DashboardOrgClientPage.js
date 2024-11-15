import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Grid, Container, Typography, Box, Button, Card, CardContent, CardHeader } from '@mui/material';
import { AppWidgetSummary, AppNewsUpdate } from '../sections/@dashboard/app';

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

          {/* Learners Card */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Learners"
              total={users.length}
              icon={'ant-design:user-outlined'}
            />
          </Grid>

          {/* Cohorts Card */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Cohorts"
              total={cohorts.length}
              color="info"
              icon={'ant-design:whats-app-outlined'}
            />
            </Grid>
            {/* Programs Card */}
           <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Programs" 
            total={cohorts.length} 
            color="error" 
            icon={'ant-design:flag-outlined'}
             />
          </Grid>
          {/* Registered Learners Update */}
          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="Registered Learners"
              list={users.map((user, index) => ({
                id: index,
                title: user.userName,
                description: user.userPhoneNumber,
                image: `/assets/images/covers/cover_1.jpg`,
              }))}
            />
          </Grid>
          </Grid>
      </Container>
    </>
  );
}

           
          //    View All Buttons 

          //  <Grid item xs={12} md={6} lg={4}>
          //   <Button
          //     fullWidth
          //     component={RouterLink}
          //     to={`/org-dashboards/${id}/org-Create-Users`}
          //     variant="outlined"
          //     color="primary"
          //     size="large"
          //     sx={{ mb: 2 }}
          //   >
          //     View All Learners
          //   </Button>
          //   <Button
          //     fullWidth
          //     component={RouterLink}
          //     to={`/org-dashboards/${id}/orgdashc`}
          //     variant="outlined"
          //     color="primary"
          //     size="large"
          //   >
          //     View All Cohorts
          //   </Button>
          //   </Grid> 
          
   
          // <Grid item xs={12} sm={6} md={4}>
          //   <Card>
          //     <CardHeader title="Learners" />
          //     <CardContent>
          //       <Typography variant="h6">Total Learners: {users.length}</Typography>
          //       <Box display="flex" justifyContent="flex-end">
          //         <Button component={RouterLink} to={`/org-dashboards/${id}/org-Create-Users`} variant="outlined" size="large" color="primary">
          //           View All Learners
          //         </Button>
          //       </Box>
          //     </CardContent>
          //   </Card>
          // </Grid>
          
          // <Grid item xs={12} sm={6} md={4}>
          //   <Card>
          //     <CardHeader title="Cohorts" />
          //     <CardContent>
          //       <Typography variant="h6">Total Cohorts: {cohorts.length}</Typography>
          //       <Box display="flex" justifyContent="flex-end">
          //         <Button component={RouterLink} to={`/org-dashboards/${id}/orgdashc`} variant="outlined" size="large" color="primary">
          //           View All Cohorts
          //         </Button>
          //         </Box>
          //     </CardContent>
          //   </Card>
          // </Grid>
          
          // <Grid item xs={12}>
          //   <Card>
          //     <CardHeader title="Registered Learners" />
          //     <CardContent>
          //       {users.length > 0 ? (
          //         users.map((user) => (
          //           <Typography key={user.userId}>
          //             {user.userName} - {user.userPhoneNumber}
          //           </Typography>
          //         ))
          //       ) : (
          //         <Typography>No registered Learners available</Typography>
          //       )}
          //     </CardContent>
          //   </Card>
          // </Grid> 
          
        
