import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Select, MenuItem, Button, Box, } from '@mui/material';

import { getOrgUsers, getOrgCohorts } from '../api';
import { AppWidgetSummary } from '../sections/@dashboard/app';

export default function DashboardClientPage() {
  const theme = useTheme();
  const [organization, setOrganization] = useState({});
  const [orgDetails, setOrgDetails] = useState({});
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');

  const { id: organizationId } = useParams();

  useEffect(() => {
    // Fetch organization details
    axios.get(`${process.env.REACT_APP_API_URL}/organizations/${organizationId}`)
      .then((res) => {
        setOrgDetails(res.data);
      })
      .catch((err) => console.log(err));
      // Fetch organization users
      getOrgUsers(organizationId)
      .then((res) => setUsers(res))
      .catch((err) => console.error(err));

    // Fetch organization cohorts
    getOrgCohorts(organizationId)
      .then(setCohorts)
      .catch((err) => console.error(err));

    // Fetch programs for selection dropdown
    axios.get(`${process.env.REACT_APP_API_URL}/programs/organization/${organizationId}`)
      .then((res) => setPrograms(res.data))
      .catch((err) => console.log(err));
  }, [organizationId]);

  useEffect(() => {
    if (selectedProgram) {
      // Fetch organization users for selected program
      getOrgUsers(organizationId)
        .then(setUsers)
        .catch((err) => console.log(err));
    }
  }, [selectedProgram, organizationId]);

  const handleProgramChange = (event) => {
    setSelectedProgram(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Dashboard | Organization </title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container justifyContent="space-between" spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h4" sx={{ mb: 5 }}>
              Welcome back, {organization.organizationName}!
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" justifyContent="right">
              <Button
                component={RouterLink}
                to={`/org-dashboard/${organizationId}/users`}
                variant="outlined"
                size="large"
                color="primary"
              >
                View All Users
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              value={selectedProgram}
              onChange={handleProgramChange}
              fullWidth
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>Select Program</MenuItem>
              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.programName}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Grid container spacing={4} mt={3}>
          <Grid item xs={12} md={6} lg={6}>
            <AppWidgetSummary
              title="Total Users"
              total={users.length}
              color="info"
              icon={'ant-design:user-outlined'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <AppWidgetSummary
              title="Total Cohorts"
              total={cohorts.length}
              color="warning"
              icon={'ant-design:team-outlined'}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
