/* eslint-disable */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Card, CardContent, Typography, Grid } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const apiUrl = process.env.REACT_APP_API_URL;

const ReportPage = () => {
  const [courses, setCourses] = useState([]);
  const [cohortNames, setCohortNames] = useState([]);
  const [organisationsCourses, setOrganisationsCourses] = useState([]);
  const [organisationsCohorts, setOrganisationsCohorts] = useState([]);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    const headers = {
      Authorization: `${token}`,
    };

    axios
      .get(`${apiUrl}/report/listcourses`, { headers })
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the courses data:', error);
      });

    axios
      .get(`${apiUrl}/report/listcohortnames`, { headers })
      .then((response) => {
        setCohortNames(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the cohort names data:', error);
      });

    axios
      .get(`${apiUrl}/report/listorganisationscourses`, { headers })
      .then((response) => {
        setOrganisationsCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisations courses data:', error);
      });

    axios
      .get(`${apiUrl}/report/listorganisationcohorts`, { headers })
      .then((response) => {
        setOrganisationsCohorts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisations cohorts data:', error);
      });

    axios
      .get(`${apiUrl}/report/listusercourses`, { headers })
      .then((response) => {
        setUserCourses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the user courses data:', error);
      });
  }, []);

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text('Super Admin Report', 20, 10);

    doc.autoTable({
      startY: 20,
      head: [['Courses Names']],
      body: courses.map((course) => [course]),
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Cohort Names']],
      body: cohortNames.map((cohort) => [cohort]),
    });

    organisationsCourses.forEach((organisation) => {
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [[`Organisation: ${organisation.organisation_name} - Courses`]],
        body: organisation.courses.map((course) => [course]),
      });
    });

    organisationsCohorts.forEach((organisation) => {
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [[`Organisation: ${organisation.organisation_name} - Cohorts`]],
        body: organisation.cohorts.map((cohort) => [cohort]),
      });
    });

    userCourses.forEach((user) => {
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 10,
        head: [[`User: ${user.user_name} - ${user.phone_no} - Courses`]],
        body: user.courses.length > 0 ? user.courses.map((course) => [course]) : [['No courses enrolled']],
      });
    });

    doc.save('report.pdf');
  };

  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        Report
      </Typography>
      <Typography variant="h2" gutterBottom>
        Super Admin Report
      </Typography>
      <Button color="info" variant="contained" endIcon={<DownloadIcon />} onClick={downloadReport}>
        Download Report
      </Button>
      <hr />

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Courses Names
          </Typography>
          <Grid container spacing={2}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Typography variant="body1">{course}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Cohort Names
          </Typography>
          <Grid container spacing={2}>
            {cohortNames.map((cohort, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Typography variant="body1">{cohort}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Organisations and Their Courses
          </Typography>
          {organisationsCourses.map((organisation, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <Typography variant="h6">{organisation.organisation_name}</Typography>
              <Grid container spacing={2}>
                {organisation.courses.map((course, courseIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={courseIndex}>
                    <Typography variant="body2">{course}</Typography>
                  </Grid>
                ))}
              </Grid>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Organisations and Their Cohorts
          </Typography>
          {organisationsCohorts.map((organisation, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <Typography variant="h6">{organisation.organisation_name}</Typography>
              <Grid container spacing={2}>
                {organisation.cohorts.map((cohort, cohortIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={cohortIndex}>
                    <Typography variant="body2">{cohort}</Typography>
                  </Grid>
                ))}
              </Grid>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Users and Their Courses
          </Typography>
          {userCourses.map((user, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <Typography variant="h6">
                {user.user_name} - {user.phone_no}
              </Typography>
              <Grid container spacing={2}>
                {user.courses.length > 0 ? (
                  user.courses.map((course, courseIndex) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={courseIndex}>
                      <Typography variant="body2">{course}</Typography>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2">No courses enrolled</Typography>
                  </Grid>
                )}
              </Grid>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReportPage;

/* eslint-enable */
/* eslint-enable */
