import axios from 'axios';
import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// components
// sections
import {
  AppNewsUpdate,
  AppOrderTimeline,
  AppWidgetSummary
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------
const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardAppPage() {
  const theme = useTheme();
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [langs, setLangs] = useState([]);

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
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`${apiUrl}/cohorts`)
      .then((res) => {
      console.log(res.data);
        setCourses(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`${apiUrl}/programs`)
      .then((res) => {
        setLangs(res.data);
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
              total={courses.length}
              color="warning"
              icon={'ant-design:whats-app-outlined'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Programs" 
            total={langs.length} 
            color="error" 
            icon={'ant-design:flag-outlined'}
             />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="Learners Update"
              list={[...users].map((user, index) => ({
                id: index,
                title: user.userName,
                description: user.userPhoneNumber,
                image: `/assets/images/covers/cover_1.jpg`,
                OrgName: user.organization?.organizationName,
              }))}
            />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title=" Timeline"
              list={[...users].map((user, index) => ({
                id: index,
                title: [
                  'User Registered',
                  'User Registered',
                  'Welcome triggered',
                  'Welcome triggered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                  'User Registered',
                ][index],
                type: `order${index + 1}`,
                time: user.created_at,
              }))}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
