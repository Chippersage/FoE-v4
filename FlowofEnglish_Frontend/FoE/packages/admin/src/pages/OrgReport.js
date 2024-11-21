/* eslint-disable */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Card, CardContent, Typography, Grid, Paper, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const apiUrl = process.env.REACT_APP_API_URL;

const OrganisationProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
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
      .get(`${apiUrl}/reports/program/{userId}/{programId}/${organizationId}`, { headers })
      .then((response) => {
        const fetchedPrograms = response.data.map((item) => item.programName);
        setPrograms(fetchedPrograms);
      })
      .catch((error) => {
        console.error('Error fetching the organisation Programs data:', error);
      });

    axios
      .get(`${apiUrl}/report/organisation/${organizationId}/users`, { headers })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisation users data:', error);
      });

    axios
      .get(`${apiUrl}/cohorts/orgCohorts/${organizationId}`, { headers })
      .then((response) => {
        setCohorts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the organisation cohorts data:', error);
      });
  }, []);

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text('Organisation Programs, Cohorts and Users Report', 20, 10);

    doc.autoTable({
      startY: 20,
      head: [['Programs Names']],
      body: programs.map((program) => [program]),
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Cohort Names']],
      body: cohorts.map((cohort) => [cohort.cohort]),
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['User ID', 'User Name', 'Phone Number', 'Program Name', 'Cohort Name']],
      body: users.flatMap((user) =>
        user.user_program_info.map((info) => [
          userId,
          userName,
          userPhoneNumber,
          info.program.programName,
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
            Programs Names
          </Typography>
          <Grid container spacing={2}>
            {programs.map((program, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Typography variant="body1">{program}</Typography>
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
            Users with Programs and Cohorts
          </Typography>
          {users.map((user) => (
            <Paper style={{ margin: '10px 0', padding: '10px' }} key={user.id}>
              <Typography variant="h6">
                {user.name} ({user.phone_no})
              </Typography>
              {user.user_program_info.map((info, index) => (
                <div key={index}>
                  <Typography variant="body2">Program: {info.program.programName}</Typography>
                  <Typography variant="body2">Cohort: {info.cohort.cohort}</Typography>
                  {index < user.user_program_info.length - 1 && <Divider />}
                </div>
              ))}
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganisationProgramsPage;
/* eslint-enable */
/* eslint-enable */
