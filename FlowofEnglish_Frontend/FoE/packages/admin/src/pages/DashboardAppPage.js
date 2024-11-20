import axios from 'axios';

import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// components
// sections
import {
  AppNewsUpdate,
  AppOrderTimeline,
  AppWidgetSummary
} from '../sections/@dashboard/app';
import  {  getUserSessionMappingsByUserId } from '../api'
// ----------------------------------------------------------------------
const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardAppPage() {
  const theme = useTheme();
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [registeredLearners, setRegisteredLearners] = useState([]);

  // Fetch organization details on component mount
  useEffect(() => {
    axios
      .get(`${apiUrl}/organizations`)
      .then((res) => {
        setOrgs(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  
    axios
      .get(`${apiUrl}/users`)
      .then((res) => {
        setUsers(res.data);
      // Fetch session mappings for each user
      const fetchMappings = res.data.map(async (user) => {
        const sessionMappings = await getUserSessionMappingsByUserId(user.userId);
        const lastSession = sessionMappings?.[0];
        return {
          ...user,
          organizationName: user.organization?.organizationName || 'N/A',
          sessionStartTimestamp: lastSession?.sessionStartTimestamp
            ? new Date(lastSession.sessionStartTimestamp).toISOString()
            : null,
        };
      });

      Promise.all(fetchMappings)
        .then(setRegisteredLearners)
        .catch(console.error);
    })
    .catch(console.error);

    axios
      .get(`${apiUrl}/cohorts`)
      .then((res) => {
        setCohorts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`${apiUrl}/programs`)
      .then((res) => {
        setPrograms(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  // console.log('hello');
  return (
    <>
      <Helmet>
        <title> Dashboard | Chippersage </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
            title="Learners" 
            total={users.length} 
            icon={'ant-design:user-outlined'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Organisations"
              total={orgs.length}
              color="info"
              icon={'ant-design:bank-outlined'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Cohorts"
              total={cohorts.length}
              color="warning"
              icon={'ant-design:whats-app-outlined'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Programs" 
            total={programs.length} 
            color="error" 
            icon={'ant-design:flag-outlined'}
             />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            {/* <AppNewsUpdate
              title="Learners Update"
              list={[...users].map((user, index) => ({
                id: index,
                title: user.userName,
                description: user.userPhoneNumber,
                image: `/assets/images/covers/cover_1.jpg`,
                OrgName: user.organization?.organizationName,
              }))}
            /> */}
            <Grid item xs={12}>
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Registered Learners
    </Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Learner ID</strong></TableCell>
            <TableCell><strong>Learner Name</strong></TableCell>
            <TableCell><strong>Cohort Name</strong></TableCell>
            <TableCell><strong>Last Activity</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {registeredLearners.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.userId}</TableCell>
              <TableCell>{user.userName}</TableCell>
              <TableCell>{user.organizationName}</TableCell>
              <TableCell>{user.sessionStartTimestamp || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Paper>
    </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
