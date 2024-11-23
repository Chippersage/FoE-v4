/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import LearnersProgressChart from '../components/LearnersProgressChart'; // Import your bar chart component
import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart'; // Placeholder for the pie chart component
import { getOrgCohorts, getOrgPrograms } from 'src/api';

const apiUrl = process.env.REACT_APP_API_URL;

const ProgressDashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('All users');
  const [progressData, setProgressData] = useState(null);
  const [userSpecificData, setUserSpecificData] = useState(null);

  const fetchOrgPrograms = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      const response = await getOrgPrograms(orgId);
      console.log('orgProgramsResponse', response);
      setPrograms(response);
      setSelectedProgramId(response[0]?.programId); // Default to the first program
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchOrgCohorts = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      const response = await getOrgCohorts(orgId);
      console.log('orgCohortsResponse', response);
      setCohorts(response);
      setSelectedCohortId(response[0]?.cohortId); // Default to the first cohort
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Fetch programs and cohorts on component mount
  useEffect(() => {
    const orgId = localStorage.getItem('orgId');
    if (!orgId) {
      console.error('Organization ID not found in local storage.');
      return;
    }else{
      fetchOrgPrograms();
      fetchOrgCohorts();
    }

  }, []);

  // Fetch progress data whenever selected program or cohort changes
  useEffect(() => {
    if (selectedProgramId && selectedCohortId) {
      axios
        .get(`${apiUrl}/reports/program/${selectedProgramId}/cohort/${selectedCohortId}/progress`)
        .then((res) => {
          setProgressData(res.data);
          setUsers([{ learnerId: 'All users', learnerName: 'All users' }, ...res.data.users]);
        })
        .catch((err) => console.error('Error fetching progress data:', err));
    }
  }, [selectedProgramId, selectedCohortId]);

  // Fetch user-specific data when a specific user is selected
  useEffect(() => {
    if (selectedUserId !== 'All users') {
      const user = users.find((u) => u.learnerId === selectedUserId);
      if (user) {
        setUserSpecificData(user); // Replace with the required user-specific data
      }
    } else {
      setUserSpecificData(null);
    }
  }, [selectedUserId, users]);

  return (
    <Container maxWidth="lg" sx={{ marginTop: 5 }}>
      {/* Dropdown Section */}
      <Card sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Filter Reports
        </Typography>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <FormControl fullWidth>
            <InputLabel>Select Program</InputLabel>
            <Select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)}>
              {programs.map((program) => (
                <MenuItem key={program.programId} value={program.programId}>
                  {program.programName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Select Cohort</InputLabel>
            <Select value={selectedCohortId} onChange={(e) => setSelectedCohortId(e.target.value)}>
              {cohorts.map((cohort) => (
                <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                  {cohort.cohortName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Select User</InputLabel>
            <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              {users.map((user) => (
                <MenuItem key={user.learnerId} value={user.learnerId}>
                  {user.learnerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* Charts Section */}
      {progressData && <LearnersProgressChart data={progressData} selectedUserId={selectedUserId} />}

      {userSpecificData && selectedUserId !== 'All users' && (
        <Card sx={{ marginTop: 3, padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            User-Specific Report
          </Typography>
          <SingleLearnerProgressChart data={userSpecificData} />
        </Card>
      )}
    </Container>
  );
};

export default ProgressDashboard;
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
