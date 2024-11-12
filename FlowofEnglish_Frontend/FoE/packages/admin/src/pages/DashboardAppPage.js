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
            <AppWidgetSummary title="Users" total={users.length} icon={'ant-design:user-outlined'} />
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
              title="Users Update"
              list={[...users].map((user, index) => ({
                id: index,
                title: user.name,
                description: user.phone_no,
                image: `/assets/images/covers/cover_1.jpg`,
                postedAt: user.created_at,
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
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
          </Grid>

          {/* 
          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Website Visits"
              subheader="(+43%) than last year"
              chartLabels={[
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ]}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Courses"
              chartData={[
                { label: 'English Learner', value: 8888 },
                { label: '', value: 2222 },
               
              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.info.main,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Course stats"
              subheader="No. of users "
              chartData={[
                { label: 'English Learner', value: 43 },
              
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
