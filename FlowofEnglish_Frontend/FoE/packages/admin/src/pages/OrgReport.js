import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import LearnersProgressChart from '../components/LearnersProgressChart';
import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart';

const apiUrl = process.env.REACT_APP_API_URL;

const ProgressDashboard = () => {
  const [programsWithCohorts, setProgramsWithCohorts] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('All Learners');
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
      setUsers([{ userId: 'All Learners', userName: 'All Learners' }, ...users]);
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
    setSelectedUserId('All Learners');
  };

  // Handle cohort selection
  const handleCohortChange = (cohortId) => {
    setSelectedCohortId(cohortId);
    fetchUsers(selectedProgramId, cohortId);
    setSelectedUserId('All Learners');
  };

  // Fetch user-specific data when a user is selected
  useEffect(() => {
    if (selectedUserId !== 'All Learners') {
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
            <InputLabel>Select Learner</InputLabel>
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
          
          <SingleLearnerProgressChart data={userSpecificData} />
        
      )}
    </Container>
  );
};

export default ProgressDashboard;
