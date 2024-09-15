// /*eslint-disable*/
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box } from '@mui/material';

// const apiUrl = process.env.REACT_APP_API_URL;
// const CohortList = () => {
//   const [cohorts, setCohorts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [newCohort, setNewCohort] = useState('');
//   const [isCreating, setIsCreating] = useState(false);
//   const [createError, setCreateError] = useState(null);

//   const fetchCohorts = async () => {
//     const orgId = localStorage.getItem('orgId');
//     if (!orgId) {
//       setError('Organization ID not found in local storage');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await axios.get(`${apiUrl}/cohorts/orgCohorts/${orgId}`);
//       setCohorts(response.data);
//     } catch (error) {
//       setError('Error fetching cohorts data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCohorts();
//   }, []);

//   const handleCreateCohort = async () => {
//     setIsCreating(true);
//     setCreateError(null);
//     const orgId = localStorage.getItem('orgId');

//     if (!orgId) {
//       setCreateError('Organization ID not found in local storage');
//       setIsCreating(false);
//       return;
//     }

//     try {
//       const response = await axios.post(`${apiUrl}/cohorts`, {
//         cohort: newCohort,
//         id_organisation: parseInt(orgId, 10), // Add radix parameter here
//       });
//       setCohorts([...cohorts, response.data]);
//       setNewCohort('');
//     } catch (error) {
//       setCreateError('Error creating cohort');
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   if (loading) {
//     return <Typography>Loading...</Typography>;
//   }

//   if (error) {
//     return <Typography>{error}</Typography>;
//   }

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Cohorts
//       </Typography>
//       <Box mb={3}>
//         <TextField label="New Cohort Name" value={newCohort} onChange={(e) => setNewCohort(e.target.value)} fullWidth />
//         <Button
//           variant="contained"
//           color="primary"
//           style={{ marginTop: '16px' }}
//           onClick={handleCreateCohort}
//           disabled={isCreating}
//         >
//           {isCreating ? 'Creating...' : 'Create Cohort'}
//         </Button>
//         {createError && <Typography color="error">{createError}</Typography>}
//       </Box>
//       <Grid container spacing={3}>
//         {cohorts.map((cohort) => (
//           <Grid item xs={12} sm={6} md={4} key={cohort.id}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6">{cohort.cohort}</Typography>
//                 {cohort.organisation && (
//                   <>
//                     <Typography variant="body2" color="textSecondary">
//                       Organisation: {cohort.organisation.organisation_name}
//                     </Typography>
//                     <Typography variant="body2" color="textSecondary">
//                       Email: {cohort.organisation.email}
//                     </Typography>
//                   </>
//                 )}
//                 <Typography variant="body2" color="textSecondary">
//                   Created At: {new Date(cohort.created_at).toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary">
//                   Updated At: {new Date(cohort.updated_at).toLocaleString()}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };

// export default CohortList;
// /*eslint-enaable*/


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

const CohortList = () => {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCohort, setNewCohort] = useState('');
  const [cohortDesc, setCohortDesc] = useState('');
  const [cohortStartDate, setCohortStartDate] = useState('');
  const [cohortEndDate, setCohortEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchCohorts = async () => {
    const orgId = localStorage.getItem('orgId');
    if (!orgId) {
      setError('Organization ID not found in local storage');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/cohorts`);
      setCohorts(response.data);
    } catch (error) {
      setError('Error fetching cohorts data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

  const handleCreateCohort = async () => {
    setIsCreating(true);
    setCreateError(null);
    const orgId = localStorage.getItem('orgId');

    if (!orgId) {
      setCreateError('Organization ID not found in local storage');
      setIsCreating(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/cohorts`, {
        cohortId: newCohort,
        cohortCreation: new Date().toISOString(), // You might want to adjust this to match your requirements
        cohortDesc,
        cohortStartDate,
        cohortEndDate,
        organizationId: orgId
      });
      setCohorts([...cohorts, response.data]);
      setNewCohort('');
      setCohortDesc('');
      setCohortStartDate('');
      setCohortEndDate('');
    } catch (error) {
      setCreateError('Error creating cohort');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Cohorts
      </Typography>
      <Box mb={3}>
        <TextField
          label="New Cohort Name"
          value={newCohort}
          onChange={(e) => setNewCohort(e.target.value)}
          fullWidth
        />
        <TextField
          label="Cohort Description"
          value={cohortDesc}
          onChange={(e) => setCohortDesc(e.target.value)}
          fullWidth
        />
        <TextField
          label="Cohort Start Date"
          type="date"
          value={cohortStartDate}
          onChange={(e) => setCohortStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Cohort End Date"
          type="date"
          value={cohortEndDate}
          onChange={(e) => setCohortEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '16px' }}
          onClick={handleCreateCohort}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Cohort'}
        </Button>
        {createError && <Typography color="error">{createError}</Typography>}
      </Box>
      <Grid container spacing={3}>
        {cohorts.map((cohort) => (
          <Grid item xs={12} sm={6} md={4} key={cohort.cohortId}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cohort.cohortDesc}</Typography>
                {cohort.organization && (
                  <>
                    <Typography variant="body2" color="textSecondary">
                      Organization: {cohort.organization.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Email: {cohort.organization.email}
                    </Typography>
                  </>
                )}
                <Typography variant="body2" color="textSecondary">
                  Created At: {new Date(cohort.cohortCreation).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start Date: {new Date(cohort.cohortStartDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  End Date: {new Date(cohort.cohortEndDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CohortList;
