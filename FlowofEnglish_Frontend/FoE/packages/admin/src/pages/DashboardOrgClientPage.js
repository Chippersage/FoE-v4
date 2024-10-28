/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Typography,
  Select,
  MenuItem,
  Link,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

import { deleteUserProgramInfo, getProgramLevelUsers } from '../api';
// sections
import { AppNewsUpdate, AppWebsiteVisits, AppWidgetSummary } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------
const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardOrgClientPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [Programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDeregister, setUserToDeregister] = useState();

  const { id } = useParams();
  const [selectedProgram, setSelectedProgram] = useState(0);

  const handleProgramChange = (event) => {
    const ProgramId = event.target.value;
    setUsers([]);
    setSelectedProgram(ProgramId);
    // call any function or update states related to selected Program
  };

  const handleDeregisterConfirm = (user) => {
    setIsConfirmOpen(true);
    setUserToDeregister(user);
  };

  const handleDeregister = async () => {
    try {
      const ci_id = users
        .filter((user) => user.id === userToDeregister.id)
        .flatMap((user) => user.user_Program_info)
        .filter((ci) => ci.id_Program === selectedProgram)[0].id;
      await deleteUserProgramInfo(ci_id);
      getProgramLevelUsers(id, selectedProgram, null).then((res) => {
        setUsers((prev) => res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch organization details on component mount
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
      .get(`${apiUrl}/organizations/${id}`, { headers })
      // console.log(req.params.id);
      .then((res) => {
        // console.log(`id issss ${id}`);
        // console.log('res isss', res.data);
        setOrgs(res.data);
      })
      .catch((err) => {
        if (err) {
          localStorage.removeItem('token');
          navigate('/loginorg');
        }
      });

    axios
      .get(`${apiUrl}/organisations/organisationsx/${id}/programs`, { headers })
      .then((res) => {
        setPrograms(res.data);
        setSelectedProgram(res.data.length > 0 ? res.data[0].id : 0);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/levels/Programlevels/${selectedProgram}`)
      .then((res) => {
        setLevels(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    getProgramLevelUsers(id, selectedProgram, null)
      .then((res) => {
        setUsers((prev) => res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedProgram]);

  const chartDataPoints = (level) => {
    const dataMap = new Map();
    users
      .flatMap((user) =>
        user.user_Program_info.filter((ci) => ci.id_Program === selectedProgram && ci.current_level === level.id)
      )
      .map((ci) => ci.cohort.cohort)
      .forEach((c) => {
        const exists = dataMap.get(c);
        if (!exists) {
          dataMap.set(c, 1);
        } else {
          dataMap.set(c, exists + 1);
        }
      });
    return dataMap;
  };
  const linkTo = `/org-dashboard/${id}/users`;

  return (
    <>
      <Helmet>
        <title> Dashboard | Chipper Sage </title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h4" sx={{ mb: 5 }}>
              Welcome back, {orgs.organisation_name}!
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" justifyContent="right" mr={1}>
              <Button component={RouterLink} to={linkTo} variant="outlined" size="large" color="primary">
                <Typography variant="" color="">
                  All Users
                </Typography>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Select
              theme={theme}
              value={selectedProgram}
              style={{ width: '100%' }}
              onChange={handleProgramChange}
              label="Select Program"
            >
              {Programs.map((Program) => (
                <MenuItem key={Program.id} value={Program.id}>
                  {Program.Program_name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {levels.length === 0 && (
            <Typography variant="h5" sx={{ ml: 5, mt: 5 }}>
              No levels found for this Program.
            </Typography>
          )}
          {levels.map((level) => (
            <Grid item xs={12} sm={6} md={4} key={level.id}>
              <AppWidgetSummary
                title={`${level.level} Users`}
                // color="success"
                total={
                  users.filter((user) => user.user_Program_info.filter((ci) => ci.current_level === level.id).length > 0)
                    .length || 0
                }
                icon={'ant-design:user-outlined'}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4} mt={0}>
          <Grid item xs={12} md={12} lg={12}>
            <AppNewsUpdate
              title="Registered Users"
              list={users.map((user, index) => ({
                id: user.id,
                title: user.name,
                description: user.phone_no,
                image: `/assets/images/covers/cover_1.jpg`,
                postedAt: user.user_Program_info.filter((ci) => ci.id_Program === selectedProgram)[0].created_at,
              }))}
              onDelete={handleDeregisterConfirm}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4} mt={1}>
          {levels.map((level) => (
            <Grid item xs={12} md={6} lg={4} key={level.id}>
              <AppWebsiteVisits
                title={level.level}
                subheader="Cohort performance"
                chartLabels={
                  Array.from(chartDataPoints(level).keys()).length > 0
                    ? Array.from(chartDataPoints(level).keys())
                    : ['No Cohort found']
                }
                chartData={[
                  {
                    name: 'Users',
                    type: 'bar',
                    fill: 'solid',
                    data: Array.from(chartDataPoints(level).values()),
                  },
                ]}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'De-register User?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to de-register the user {userToDeregister?.title}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeregister();
              setIsConfirmOpen(false);
            }}
            autoFocus
            sx={{ color: 'error.main' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
/* eslint-enable */
