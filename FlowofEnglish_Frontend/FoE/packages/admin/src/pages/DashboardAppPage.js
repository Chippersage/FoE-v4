import axios from 'axios';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
// @mui
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
import { useTheme } from '@mui/material/styles';
// components
// sections
import { AppWidgetSummary } from '../sections/@dashboard/app';
import { getUserSessionMappingsByUserId } from '../api';
// ----------------------------------------------------------------------
const apiUrl = process.env.REACT_APP_API_URL;

export default function DashboardAppPage() {
  const theme = useTheme();
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [registeredLearners, setRegisteredLearners] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'Learner not logged in';

    const date = new Date(timestamp);
    const relativeTime = formatDistanceToNow(date, { addSuffix: true });
    const formattedTime = format(date, 'hh:mm a');
    return `${relativeTime} at ${formattedTime}`;
  };

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
          .then((learners) => {
            // Sort learners by sessionStartTimestamp in ascending order (earliest first)
            learners.sort((a, b) => {
              if (!a.sessionStartTimestamp) return 1; // Place users without a login at the end
              if (!b.sessionStartTimestamp) return -1;
              return new Date(b.sessionStartTimestamp) - new Date(a.sessionStartTimestamp);
            });
            setRegisteredLearners(learners);
          })
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

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const paginatedLearners = registeredLearners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // console.log('hello');
  return (
    <>
      <Helmet>
        <title> Dashboard | Chippersage </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Learners"
              total={users.length}
              svgIcon={
                <img src="/assets/icons/navbar/profile.svg" alt="Learners Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Organisations"
              total={orgs.length}
              color="info"
              svgIcon={
                <img src="/assets/icons/navbar/organization.svg" alt="cohorts Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Cohorts"
              total={cohorts.length}
              color="warning"
              svgIcon={
                <img src="/assets/icons/navbar/cohort.svg" alt="cohorts Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Programs"
              total={programs.length}
              color="error"
              svgIcon={
                <img src="/assets/icons/navbar/program.svg" alt="Programs Icon" style={{ width: 40, height: 40 }} />
              }
            />
          </Grid>

          {/* <Grid item xs={12} md={6} lg={8}> */}
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
                        <strong>Organization Name</strong>
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
                          <TableCell>{user.organizationName}</TableCell>
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
        {/* </Grid> */}
      </Container>
    </>
  );
}

// import axios from 'axios';

// import { useEffect, useState } from 'react';
// import { formatDistanceToNow, format } from 'date-fns';
// import { Helmet } from 'react-helmet-async';
// // @mui
// import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// // components
// // sections
// import { AppWidgetSummary } from '../sections/@dashboard/app';
// import  {  getUserSessionMappingsByUserId } from '../api'
// // ----------------------------------------------------------------------
// const apiUrl = process.env.REACT_APP_API_URL;

// export default function DashboardAppPage() {
//   const theme = useTheme();
//   const [orgs, setOrgs] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [cohorts, setCohorts] = useState([]);
//   const [programs, setPrograms] = useState([]);
//   const [registeredLearners, setRegisteredLearners] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   const formatLastActivity = (timestamp) => {
//     if (!timestamp) return 'Learner not logged in';

//     const date = new Date(timestamp);
//     const relativeTime = formatDistanceToNow(date, { addSuffix: true });
//     const formattedTime = format(date, 'hh:mm a');
//     return `${relativeTime} at ${formattedTime}`;
//   };

//   // Fetch organization details on component mount
//   useEffect(() => {
//     axios
//       .get(`${apiUrl}/organizations`)
//       .then((res) => {
//         setOrgs(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     axios
//       .get(`${apiUrl}/users`)
//       .then((res) => {
//         setUsers(res.data);
//         // Fetch user attempts for each user
//         const fetchAttempts = res.data.map(async (user) => {
//           const userAttempts = await axios.get(`${apiUrl}/user-attempts?userId=${user.userId}`);
//           const lastAttempt = userAttempts.data.sort((a, b) =>
//             new Date(b.userAttemptEndTimestamp) - new Date(a.userAttemptEndTimestamp)
//           )[0];
//           return {
//             ...user,
//             organizationName: user.organization?.organizationName || 'N/A',
//             lastActivityTimestamp: lastAttempt?.userAttemptEndTimestamp || null,
//           };
//         });
//         Promise.all(fetchAttempts)
//           .then((usersWithAttempts) => {
//             // Sort users by last activity timestamp in descending order
//             const sortedUsers = usersWithAttempts.sort((a, b) =>
//               new Date(b.lastActivityTimestamp) - new Date(a.lastActivityTimestamp)
//             );
//             setRegisteredLearners(sortedUsers);
//           })
//           .catch(console.error);
//       })
//       .catch(console.error);
//       // // Fetch session mappings for each user
//       // const fetchMappings = res.data.map(async (user) => {
//       //   const sessionMappings = await getUserSessionMappingsByUserId(user.userId);
//       //   const lastSession = sessionMappings?.[0];
//       //   return {
//       //     ...user,
//       //     organizationName: user.organization?.organizationName || 'N/A',
//       //     sessionStartTimestamp: lastSession?.sessionStartTimestamp
//       //       ? new Date((lastSession.sessionStartTimestamp)).toISOString()
//       //       : null,
//       //   };
//       // });
//     //   Promise.all(fetchMappings)
//     //     .then(setRegisteredLearners)
//     //     .catch(console.error);
//     // })
//     // .catch(console.error);

//     axios
//       .get(`${apiUrl}/cohorts`)
//       .then((res) => {
//         setCohorts(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     axios
//       .get(`${apiUrl}/programs`)
//       .then((res) => {
//         setPrograms(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, []);

//   // Handle pagination change
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0); // Reset to first page
//   };

//   const paginatedLearners = registeredLearners.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   // console.log('hello');
//   return (
//     <>
//       <Helmet>
//         <title> Dashboard | Chippersage </title>
//       </Helmet>

//       <Container maxWidth="xl">
//         <Typography variant="h4" sx={{ mb: 5 }}>
//           Hi, Welcome
//         </Typography>

//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={3}>
//             <AppWidgetSummary
//             title="Learners"
//             total={users.length}
//             svgIcon={
//               <img
//               src="/assets/icons/navbar/profile.svg"
//               alt="Learners Icon"
//               style={{ width: 40, height: 40 }}/>}
//               />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <AppWidgetSummary
//               title="Organisations"
//               total={orgs.length}
//               color="info"
//               svgIcon={
//                 <img
//                 src="/assets/icons/navbar/organization.svg"
//                 alt="cohorts Icon"
//                 style={{ width: 40, height: 40 }}/>}
//             />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <AppWidgetSummary
//               title="Cohorts"
//               total={cohorts.length}
//               color="warning"
//               svgIcon={
//                 <img
//                 src="/assets/icons/navbar/cohort.svg"
//                 alt="cohorts Icon"
//                 style={{ width: 40, height: 40 }}/>}
//                 />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <AppWidgetSummary title="Programs"
//             total={programs.length}
//             color="error"
//             svgIcon={
//               <img
//               src="/assets/icons/navbar/program.svg"
//               alt="Programs Icon"
//               style={{ width: 40, height: 40 }}/>}
//               />
//           </Grid>

//           {/* <Grid item xs={12} md={6} lg={8}> */}
//             <Grid item xs={12}>
//   <Paper sx={{ p: 2 }}>
//     <Typography variant="h6" sx={{ mb: 2 }}>
//       Registered Learners
//     </Typography>
//     <TableContainer>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell><strong>Learner ID</strong></TableCell>
//             <TableCell><strong>Learner Name</strong></TableCell>
//             <TableCell><strong>Organization Name</strong></TableCell>
//             <TableCell><strong>Last Activity</strong></TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//         {paginatedLearners.length > 0 ? (
//                       paginatedLearners.map((user) => (
//             <TableRow key={user.userId}>
//               <TableCell>{user.userId}</TableCell>
//               <TableCell>{user.userName}</TableCell>
//               <TableCell>{user.organizationName}</TableCell>
//               {/* <TableCell>{user.sessionStartTimestamp || 'N/A'}</TableCell> */}
//               <TableCell>{formatLastActivity(user.lastActivityTimestamp)}</TableCell>
//             </TableRow>
//           ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={4} align="center">
//                 No learners registered yet.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//         <TablePagination
//         rowsPerPageOptions={[5, 10, 20, 25]}
//         component="div"
//         count={registeredLearners.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//         />
//     </Paper>
//     </Grid>
//           </Grid>
//         {/* </Grid> */}
//       </Container>
//     </>
//   );
// }
