/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const apiUrl = process.env.REACT_APP_API_URL;
const UsersReport = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/report/listusersCoursescohortsorganisations`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the main data:', error);
      });
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Super Admin Report', 14, 16);
    const tableColumn = ['User Name', 'Phone', 'Organisation', 'Courses', 'Cohorts'];
    const tableRows = [];

    data.forEach((item) => {
      const itemData = [
        item.user_name,
        item.phone_no,
        item.organisation_name,
        item.course_name.join(', ') || 'No courses enrolled',
        item.cohort_name.join(', ') || 'No cohorts assigned',
      ];
      tableRows.push(itemData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save('reportuser.pdf');
  };

  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        Report
      </Typography>
      <Typography variant="h2" gutterBottom>
        Super Admin Report
      </Typography>
      <Button color="info" variant="contained" endIcon={<DownloadIcon />} onClick={downloadPDF}>
        Download Report
      </Button>
      <Divider style={{ margin: '20px 0' }} />

      {data.map((item, index) => (
        <Card style={{ margin: '20px 0', padding: '10px' }} key={index}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {item.user_name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Phone: {item.phone_no}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Organisation: {item.organisation_name}
            </Typography>
            <Divider style={{ margin: '10px 0' }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Courses</Typography>
                <List>
                  {item.course_name.length > 0 ? (
                    item.course_name.map((course, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={course} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No courses enrolled" />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Cohorts</Typography>
                <List>
                  {item.cohort_name.length > 0 ? (
                    item.cohort_name.map((cohort, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={cohort} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No cohorts assigned" />
                    </ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default UsersReport;

/* eslint-enable */
