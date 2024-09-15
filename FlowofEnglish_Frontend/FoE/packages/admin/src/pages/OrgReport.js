/* eslint-disable */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Card, CardContent, Typography, Grid, Paper, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const apiUrl = process.env.REACT_APP_API_URL;

const OrganisationCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('orgId');

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const headers = {
      Authorization: `${token}`,
    };

    axios
      .get(`${apiUrl}/report/listorgcourses/${orgId}`, { headers })
      .then((response) => {
        const fetchedCourses = response.data.map((item) => item.course_name);
        setCourses(fetchedCourses);
      })
      .catch((error) => {
        console.error('Error fetching the organisation courses data:', error);
      });

    axios
      .get(`${apiUrl}/report/organisation/${orgId}/users`, { headers })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisation users data:', error);
      });

    axios
      .get(`${apiUrl}/cohorts/orgCohorts/${orgId}`, { headers })
      .then((response) => {
        setCohorts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisation cohorts data:', error);
      });
  }, []);

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text('Organisation Courses, Cohorts and Users Report', 20, 10);

    doc.autoTable({
      startY: 20,
      head: [['Courses Names']],
      body: courses.map((course) => [course]),
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Cohort Names']],
      body: cohorts.map((cohort) => [cohort.cohort]),
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['User ID', 'User Name', 'Phone Number', 'Course Name', 'Cohort Name']],
      body: users.flatMap((user) =>
        user.user_course_info.map((info) => [
          user.id,
          user.name,
          user.phone_no,
          info.course.course_name,
          info.cohort.cohort,
        ])
      ),
    });

    doc.save(`organisation_report.pdf`);
  };

  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Organisation Report
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
            {cohorts.map((cohort) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cohort.id}>
                <Typography variant="body1">{cohort.cohort}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card style={{ margin: '20px 0', padding: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Users with Courses and Cohorts
          </Typography>
          {users.map((user) => (
            <Paper style={{ margin: '10px 0', padding: '10px' }} key={user.id}>
              <Typography variant="h6">
                {user.name} ({user.phone_no})
              </Typography>
              {user.user_course_info.map((info, index) => (
                <div key={index}>
                  <Typography variant="body2">Course: {info.course.course_name}</Typography>
                  <Typography variant="body2">Cohort: {info.cohort.cohort}</Typography>
                  {index < user.user_course_info.length - 1 && <Divider />}
                </div>
              ))}
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganisationCoursesPage;
/* eslint-enable */
/* eslint-enable */
