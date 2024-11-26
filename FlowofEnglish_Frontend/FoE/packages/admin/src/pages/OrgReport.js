import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import LearnersProgressChart from '../components/LearnersProgressChart'; // LearnersProgressChart Component
import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart'; // SingleLearnerProgressChart Component

const apiUrl = process.env.REACT_APP_API_URL;

const ProgressDashboard = () => {
  const [programsWithCohorts, setProgramsWithCohorts] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('All users');
  const [progressData, setProgressData] = useState(null);
  const [userSpecificData, setUserSpecificData] = useState(null);
  const { id: orgId } = useParams();

  // Fetch programs and cohorts
  const fetchOrgProgramsWithCohorts = async (orgId) => {
    try {
      const response = await axios.get(`${apiUrl}/organizations/${orgId}/programs-with-cohorts`);
      const programs = response.data.programs;
      setProgramsWithCohorts(programs);

      const defaultProgram = programs[0];
      setSelectedProgramId(defaultProgram.programId);
      setCohorts(defaultProgram.cohorts);

      const defaultCohort = defaultProgram.cohorts[0];
      setSelectedCohortId(defaultCohort.cohortId);

      fetchUsers(defaultProgram.programId, defaultCohort.cohortId);
    } catch (error) {
      console.error('Error fetching programs with cohorts:', error);
    }
  };

  // Fetch users for selected program and cohort
  const fetchUsers = async (programId, cohortId) => {
    try {
      const response = await axios.get(`${apiUrl}/reports/program/${programId}/cohort/${cohortId}/progress`);
      const { users } = response.data;
      setUsers([{ userId: 'All users', userName: 'All users' }, ...users]);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle program selection
  const handleProgramChange = (programId) => {
    setSelectedProgramId(programId);
    const selectedProgram = programsWithCohorts.find((program) => program.programId === programId);
    const programCohorts = selectedProgram.cohorts;
    setCohorts(programCohorts);

    const defaultCohort = programCohorts[0];
    setSelectedCohortId(defaultCohort.cohortId);

    fetchUsers(programId, defaultCohort.cohortId);
    setSelectedUserId('All users');
  };

  // Handle cohort selection
  const handleCohortChange = (cohortId) => {
    setSelectedCohortId(cohortId);
    fetchUsers(selectedProgramId, cohortId);
    setSelectedUserId('All users');
  };

  // Fetch user-specific data when a user is selected
  useEffect(() => {
    if (selectedUserId !== 'All users') {
      const selectedUser = users.find((user) => user.userId === selectedUserId);
      if (selectedUser) {
        setUserSpecificData(selectedUser);
      }
    } else {
      setUserSpecificData(null);
    }
  }, [selectedUserId, users]);

  // Fetch programs with cohorts on component mount
  useEffect(() => {
    if (!orgId) {
      console.error('Organization ID not found.');
      return;
    }
    fetchOrgProgramsWithCohorts(orgId);
  }, [orgId]);

  return (
    <Container maxWidth="lg" sx={{ marginTop: 0 }}>
      {/* Filter Section */}
      <Card sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Filter Reports
        </Typography>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <FormControl fullWidth sx={{
            '& .MuiInputLabel-root': {
              backgroundColor: 'white', // Add background to prevent overlap
              padding: '0 4px', // Add some padding for better appearance
              transform: 'translate(14px, 16px) scale(1)', // Adjust for when not focused
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)', // Adjust for when focused/shrunk
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                top: 0, // Ensure the outline is aligned properly
              },
            },
          }}>
            <InputLabel>Select Program</InputLabel>
            <Select value={selectedProgramId} onChange={(e) => handleProgramChange(e.target.value)}>
              {programsWithCohorts.map((program) => (
                <MenuItem key={program.programId} value={program.programId}>
                  {program.programName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{
            '& .MuiInputLabel-root': {
              backgroundColor: 'white', // Add background to prevent overlap
              padding: '0 4px', // Add some padding for better appearance
              transform: 'translate(14px, 16px) scale(1)', // Adjust for when not focused
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)', // Adjust for when focused/shrunk
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                top: 0, // Ensure the outline is aligned properly
              },
            },
          }}>
            <InputLabel>Select Cohort</InputLabel>
            <Select value={selectedCohortId} onChange={(e) => handleCohortChange(e.target.value)}>
              {cohorts.map((cohort) => (
                <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                  {cohort.cohortName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{
            '& .MuiInputLabel-root': {
              backgroundColor: 'white', // Add background to prevent overlap
              padding: '0 4px', // Add some padding for better appearance
              transform: 'translate(14px, 16px) scale(1)', // Adjust for when not focused
            },
            '& .MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)', // Adjust for when focused/shrunk
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                top: 0, // Ensure the outline is aligned properly
              },
            },
          }}>
            <InputLabel>Select User</InputLabel>
            <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              {users.map((user) => (
                <MenuItem key={user.userId} value={user.userId}>
                  {user.userName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* Charts Section */}
      {progressData && <LearnersProgressChart data={progressData} selectedUserId={selectedUserId} />}
      {userSpecificData && (
        <Card sx={{ marginTop: 3}}>
          
          <SingleLearnerProgressChart data={userSpecificData} />
        </Card>
      )}
    </Container>
  );
};

export default ProgressDashboard;

// /* eslint-disable */
// import React, { useEffect, useState } from 'react';
// import { Container, Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
// import axios from 'axios';
// import LearnersProgressChart from '../components/LearnersProgressChart'; // Import your bar chart component
// import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart'; // Placeholder for the pie chart component
// import { useParams } from 'react-router-dom';

// const apiUrl = process.env.REACT_APP_API_URL;

// const ProgressDashboard = () => {
//   const [programsWithCohorts, setProgramsWithCohorts] = useState([]);
//   const [cohorts, setCohorts] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedProgramId, setSelectedProgramId] = useState('');
//   const [selectedCohortId, setSelectedCohortId] = useState('');
//   const [selectedUserId, setSelectedUserId] = useState('All users');
//   const [progressData, setProgressData] = useState(null);
//   const [userSpecificData, setUserSpecificData] = useState(null);
//   const { id: orgId } = useParams();

//   // Fetch programs and cohorts
//   const fetchOrgProgramsWithCohorts = async (orgId) => {
//     try {
//       const response = await axios.get(`${apiUrl}/organizations/${orgId}/programs-with-cohorts`);
//       const programs = response.data.programs;
//       setProgramsWithCohorts(programs);

//       // Default program and cohort selection
//       const defaultProgram = programs[0];
//       setSelectedProgramId(defaultProgram.programId);
//       setCohorts(defaultProgram.cohorts);

//       const defaultCohort = defaultProgram.cohorts[0];
//       setSelectedCohortId(defaultCohort.cohortId);

//       // Fetch users for default program and cohort
//       fetchUsers(defaultProgram.programId, defaultCohort.cohortId);
//     } catch (error) {
//       console.error('Error fetching programs with cohorts:', error);
//     }
//   };

//   // Fetch users for the selected program and cohort
//   const fetchUsers = async (programId, cohortId) => {
//     try {
//       const response = await axios.get(`${apiUrl}/reports/program/${programId}/cohort/${cohortId}/progress`);
//       const { users } = response.data;
//       setUsers([{ userId: 'All users', userName: 'All users' }, ...users]);
//       setProgressData(response.data); // Set progress data for LearnersProgressChart
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   };

//   // Handle program selection change
//   const handleProgramChange = (programId) => {
//     setSelectedProgramId(programId);
//     const selectedProgram = programsWithCohorts.find((program) => program.programId === programId);
//     const programCohorts = selectedProgram.cohorts;
//     setCohorts(programCohorts);

//     const defaultCohort = programCohorts[0];
//     setSelectedCohortId(defaultCohort.cohortId);

//     // Fetch users for the selected program and default cohort
//     fetchUsers(programId, defaultCohort.cohortId);
//     setSelectedUserId('All users');
//   };

//   // Handle cohort selection change
//   const handleCohortChange = (cohortId) => {
//     setSelectedCohortId(cohortId);
//     fetchUsers(selectedProgramId, cohortId);
//     setSelectedUserId('All users');
//   };

//   // Fetch user-specific data on user selection change
//   useEffect(() => {
//     if (selectedUserId !== 'All users') {
//       const selectedUser = users.find((user) => user.userId === selectedUserId);
//       if (selectedUser) {
//         setUserSpecificData(selectedUser);
//       }
//     } else {
//       setUserSpecificData(null);
//     }
//   }, [selectedUserId, users]);

//   // Fetch programs with cohorts on component mount
//   useEffect(() => {
//     if (!orgId) {
//       console.error('Organization ID not found.');
//       return;
//     }
//     fetchOrgProgramsWithCohorts(orgId);
//   }, [orgId]);

//   return (
//     <Container maxWidth="lg" sx={{ marginTop: 5 }}>
//       {/* Dropdown Section */}
//       <Card sx={{ padding: 3, marginBottom: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Filter Reports
//         </Typography>
//         <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
//           {/* Program Selection */}
//           <FormControl fullWidth>
//             <InputLabel>Select Program</InputLabel>
//             <Select value={selectedProgramId} onChange={(e) => handleProgramChange(e.target.value)}>
//               {programsWithCohorts.map((program) => (
//                 <MenuItem key={program.programId} value={program.programId}>
//                   {program.programName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Cohort Selection */}
//           <FormControl fullWidth>
//             <InputLabel>Select Cohort</InputLabel>
//             <Select value={selectedCohortId} onChange={(e) => handleCohortChange(e.target.value)}>
//               {cohorts.map((cohort) => (
//                 <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
//                   {cohort.cohortName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* User Selection */}
//           <FormControl fullWidth>
//             <InputLabel>Select User</InputLabel>
//             <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
//               {users.map((user) => (
//                 <MenuItem key={user.userId} value={user.userId}>
//                   {user.userName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </div>
//       </Card>

//       {/* Charts Section */}
//       {progressData && <LearnersProgressChart data={progressData} selectedUserId={selectedUserId} />}

//       {userSpecificData && selectedUserId !== 'All users' && (
//         <Card sx={{ marginTop: 3, padding: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             User-Specific Report
//           </Typography>
//           <SingleLearnerProgressChart data={userSpecificData} />
//         </Card>
//       )}
//     </Container>
//   );
// };

// export default ProgressDashboard;
/* eslint-enable */

// /* eslint-disable */
// import React, { useEffect, useState } from 'react';
// import { Container, Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
// import axios from 'axios';
// import LearnersProgressChart from '../components/LearnersProgressChart'; // Import your bar chart component
// import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart'; // Placeholder for the pie chart component
// import { getOrgCohorts, getOrgPrograms } from 'src/api';
// import { useParams } from 'react-router-dom';

// const apiUrl = process.env.REACT_APP_API_URL;

// const ProgressDashboard = () => {
//   const [programsWithCohorts, setProgramsWithCohorts] = useState([]);
//   const [cohorts, setCohorts] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedProgramId, setSelectedProgramId] = useState('');
//   const [selectedCohortId, setSelectedCohortId] = useState('');
//   const [selectedUserId, setSelectedUserId] = useState('All users');
//   const [progressData, setProgressData] = useState(null);
//   const [userSpecificData, setUserSpecificData] = useState(null);
//   const { id } = useParams();

//   const fetchOrgProgramsWithCohorts = async (orgId) => {
//     try {
//       // const response = await getOrgPrograms(orgId);
//       const response = await axios.get(
//         `${apiUrl}/organizations/${orgId}/programs-with-cohorts`
//       );
//       console.log('orgProgramsWithCohortsResponse', response.data);
//       setProgramsWithCohorts(response.data.programs);
//       setCohorts(response.data.programs[0]?.cohorts);
//       setSelectedCohortId(response.data.programs[0]?.cohorts[0]?.cohortId);
//       setSelectedProgramId(response.data.programs[0]?.programId); // Default to the first program
//     } catch (error) {
//       console.error('Error fetching programs with cohorts:', error);
//     }
//   };

//   // Fetch programs with cohorts on component mount
//   useEffect(() => {
//     // const orgId = localStorage.getItem('orgId');
//     if (!id) {
//       console.error('Organization ID not found in local storage.');
//       return;
//     }else{
//       fetchOrgProgramsWithCohorts(id);
//     }

//   }, []);

//   // Fetch user-specific data when a specific user is selected
//   useEffect(() => {
//     if (selectedUserId !== 'All users') {
//       const user = users.find((u) => u.learnerId === selectedUserId);
//       if (user) {
//         setUserSpecificData(user); // Replace with the required user-specific data
//       }
//     } else {
//       setUserSpecificData(null);
//     }
//   }, [selectedUserId, users]);

//   return (
//     <Container maxWidth="lg" sx={{ marginTop: 5 }}>
//       {/* Dropdown Section */}
//       <Card sx={{ padding: 3, marginBottom: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Filter Reports
//         </Typography>
//         <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
//           <FormControl fullWidth>
//             <InputLabel>Select Program</InputLabel>
//             <Select value={selectedProgramId} onChange={(e) => {
//               setSelectedProgramId(e.target.value)
//               }}>
//               {programsWithCohorts.map((program) => (
//                 <MenuItem key={program.programId} value={program.programId}>
//                   {program.programName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl fullWidth>
//             <InputLabel>Select Cohort</InputLabel>
//             <Select value={selectedCohortId} onChange={(e) => setSelectedCohortId(e.target.value)}>
//               {cohorts.map((cohort) => (
//                 <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
//                   {cohort.cohortName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl fullWidth>
//             <InputLabel>Select User</InputLabel>
//             <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
//               {users.map((user) => (
//                 <MenuItem key={user.learnerId} value={user.learnerId}>
//                   {user.learnerName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </div>
//       </Card>

//       {/* Charts Section */}
//       {progressData && <LearnersProgressChart data={progressData} selectedUserId={selectedUserId} />}

//       {userSpecificData && selectedUserId !== 'All users' && (
//         <Card sx={{ marginTop: 3, padding: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             User-Specific Report
//           </Typography>
//           <SingleLearnerProgressChart data={userSpecificData} />
//         </Card>
//       )}
//     </Container>
//   );
// };

// export default ProgressDashboard;
/* eslint-enable */

// import React from 'react';
// import LearnerProgressChart from '../components/LearnerProgressChart';

// // const data = {
// //   programId: 'Prg_EEA_1',
// //   programName: 'EEA Level 1',
// //   programDesc: 'This is the English Ever After Course to learn basic English concepts',
// //   0: {
// //     cohortId: 'Cht_Class1_KnowledgeSeekers',
// //     learners: {
// //       0: { learnerId: 'Adharsh01', subconcepts_completed: 23 },
// //       1: { learnerId: 'Adharsh02', subconcepts_completed: 15 },
// //       2: { learnerId: 'User03', subconcepts_completed: 18 },
// //       3: { learnerId: 'User04', subconcepts_completed: 20 },
// //     },
// //   },
// // };

// const OrgReport = () => {
//   return (
//     <div>
//       <LearnerProgressChart data={data} />
//     </div>
//   );
// };

// export default OrgReport;

// import React from 'react';
// import { Card } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const LearnerProgressChart = () => {
//   // Sample data - replace with your actual data
//   const data = {
//     programId: 'Prg_EEA_1',
//     programName: 'EEA Level 1',
//     programDesc: 'This is the English Ever After Course to learn basic English concepts',
//     0: {
//       cohortId: 'Cht_Class1_KnowledgeSeekers',
//       learners: {
//         0: {
//           learnerId: 'Adharsh01',
//           subconcepts_completed: 23,
//           Stages_0_status: '1',
//           Stages_1_status: 0,
//           stages_2_status: 0,
//           Totalscore: 56,
//         },
//         1: {
//           learnerId: 'Adharsh02',
//           subconcepts_completed: 23,
//           Stages_0_status: '1',
//           Stages_1_status: 1,
//           stages_2_status: 0,
//           Totalscore: 56,
//         },
//         2: {
//           learnerId: 'User03',
//           subconcepts_completed: 23,
//           Stages_0_status: '1',
//           Stages_1_status: 1,
//           stages_2_status: 1,
//           Totalscore: 56,
//         },
//         3: {
//           learnerId: 'User04',
//           subconcepts_completed: 23,
//           Stages_0_status: '1',
//           Stages_1_status: 1,
//           stages_2_status: 1,
//           Totalscore: 56,
//         },
//       },
//     },
//   };

//   // Transform data for the chart
//   const transformDataForChart = () => {
//     const learners = data[0]?.learners || {};
//     return Object.values(learners).map((learner) => ({
//       name: learner.learnerId,
//       progress: learner.subconcepts_completed,
//     }));
//   };

//   const chartData = transformDataForChart();

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="text-2xl font-bold">Learner Progress</h2>
//       </div>

//       <Card className="p-4">
//         <div className="h-96 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={chartData}
//               margin={{
//                 top: 20,
//                 right: 30,
//                 left: 20,
//                 bottom: 5,
//               }}
//             >
//               <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12 }}
//                 label={{
//                   value: 'Learners',
//                   position: 'bottom',
//                   offset: 0,
//                   fontSize: 14,
//                   fill: '#666',
//                 }}
//               />
//               <YAxis
//                 tick={{ fontSize: 12 }}
//                 label={{
//                   value: 'Subconcepts Completed',
//                   angle: -90,
//                   position: 'insideLeft',
//                   offset: 10,
//                   fontSize: 14,
//                   fill: '#666',
//                 }}
//               />
//               <Tooltip />
//               <Bar dataKey="progress" fill="#2196f3" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default LearnerProgressChart;
