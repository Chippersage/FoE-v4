import {
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { AppWidgetSummary } from '../sections/@dashboard/app';

import { getOrgCohorts, getOrgPrograms, getOrgUsers, getUserSessionMappingsByUserId } from '../api';

const formatLastActivity = (timestamp) => {
  if (!timestamp) return 'Learner not logged in';

  const date = new Date(timestamp);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  const formattedTime = format(date, 'hh:mm a');
  return `${relativeTime} at ${formattedTime}`;
};

const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardOrgClientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orgData, setOrgData] = useState({});
  const [cohorts, setCohorts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [users, setUsers] = useState([]);
  const [registeredLearners, setRegisteredLearners] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch organization details, cohorts, and users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/loginorg');
      return;
    }
    const headers = { Authorization: `${token}` };

    // Fetch organization info
    axios
      .get(`${apiUrl}/organizations/${id}`, { headers })
      .then((res) => setOrgData(res.data))
      .catch((err) => {
        localStorage.removeItem('token');
        navigate('/loginorg');
      });

    // Fetch cohorts and users for the organization
    getOrgCohorts(id)
      .then(setCohorts)
      .catch(() => setCohorts([]));
    getOrgUsers(id)
      .then((fetchedUsers) => {
        setUsers(fetchedUsers || []);

        // Fetch session mappings for each user
        const fetchMappings = fetchedUsers.map(async (user) => {
          //  console.log('Fetching session mappings for user:', user.userId);
          const sessionMappings = await getUserSessionMappingsByUserId(user.userId);
          //  console.log(`Session Mappings for user ${user.userId}:`, sessionMappings);
          const lastSession = sessionMappings?.[0];
          return {
            ...user,
            cohortName: user.cohort?.cohortName || 'N/A',
            sessionStartTimestamp: lastSession?.sessionStartTimestamp
              ? new Date(lastSession.sessionStartTimestamp).toISOString()
              : null,
          };
        });
        Promise.all(fetchMappings)
          .then((learners) => {
            // Sort learners by sessionStartTimestamp in descending order (most recent first)
            learners.sort((a, b) => {
              if (!a.sessionStartTimestamp) return 1; // Place users without a login at the end
              if (!b.sessionStartTimestamp) return -1;
              return new Date(b.sessionStartTimestamp) - new Date(a.sessionStartTimestamp);
            });
            setRegisteredLearners(learners);
          })
          .catch(console.error);
      })
      .catch(() => setUsers([]));
    getOrgPrograms(id)
      .then(setPrograms)
      .catch(() => setPrograms([]));
  }, [id, navigate]);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const paginatedLearners = registeredLearners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Helmet>
        <title> Dashboard | Organization</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Welcome message */}
        <Typography variant="h4" sx={{ mb: 5 }}>
          Welcome, {orgData.organizationName}!
        </Typography>

        <Grid container spacing={0} justifyContent="space-between" alignItems="center">
          {/* Learners Card */}
          <Grid item xs={12} sm={6} md={3} lg={3.5}>
            <AppWidgetSummary
              title="Learners"
              total={users ? users.length : 0}
              svgIcon={
                <img src="/assets/icons/navbar/profile.svg" alt="Learners Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>

          {/* Cohorts Card */}
          <Grid item xs={12} sm={6} md={3} lg={3.5}>
            <AppWidgetSummary
              title="Cohorts"
              total={cohorts ? cohorts.length : 0}
              color="info"
              svgIcon={
                <img src="/assets/icons/navbar/cohort.svg" alt="cohorts Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>
          {/* Programs Card */}
          <Grid item xs={12} sm={6} md={3} lg={3.5}>
            <AppWidgetSummary
              title="Programs"
              total={programs ? programs.length : 0}
              color="error"
              svgIcon={
                <img src="/assets/icons/navbar/program.svg" alt="Programs Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={6}>
          {/* Registered Learners Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Registered Learners
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Learner ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Learner Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Cohort Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Last Activity</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLearners.length > 0 ? (
                      paginatedLearners.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>{user.userId}</TableCell>
                          <TableCell>{user.userName}</TableCell>
                          <TableCell>{user.cohortName}</TableCell>
                          {/* <TableCell>{user.sessionStartTimestamp || 'N/A'}</TableCell> */}
                          <TableCell>{formatLastActivity(user.sessionStartTimestamp)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No learners registered yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 25]}
                component="div"
                count={registeredLearners.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
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
