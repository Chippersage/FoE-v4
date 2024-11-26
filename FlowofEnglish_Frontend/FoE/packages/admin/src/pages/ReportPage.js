import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import LearnersProgressChart from '../components/LearnersProgressChart'; // LearnersProgressChart Component
import SingleLearnerProgressChart from '../components/SingleLearnerProgressChart'; // SingleLearnerProgressChart Component
import { getOrgs } from '../api';

const apiUrl = process.env.REACT_APP_API_URL;

const ProgressDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [programsWithCohorts, setProgramsWithCohorts] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('All users');
  const [progressData, setProgressData] = useState(null);
  const [userSpecificData, setUserSpecificData] = useState(null);

  // Fetch organizations on mount
  const fetchOrganizations = async () => {
    try {
      const response = await getOrgs()
      setOrganizations(response);
      console.log(response)
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Fetch programs and cohorts for the selected organization
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

  // Handle organization selection
  const handleOrgChange = (orgId) => {
    setSelectedOrgId(orgId);
    setProgramsWithCohorts([]);
    setCohorts([]);
    setUsers([]);
    setSelectedProgramId('');
    setSelectedCohortId('');
    setSelectedUserId('All users');
    setProgressData(null);
    setUserSpecificData(null);

    if (orgId) {
      fetchOrgProgramsWithCohorts(orgId);
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

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ marginTop: 0 }}>
      {/* Organization Selection */}
      <Card sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" gutterBottom>
          Select Organization
        </Typography>
        <FormControl
          fullWidth
          sx={{
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
          }}
        >
          <InputLabel>Select Organization</InputLabel>
          <Select value={selectedOrgId} onChange={(e) => handleOrgChange(e.target.value)}>
            {organizations.map((org) => (
              <MenuItem key={org.organizationId} value={org.organizationId}>
                {org.organizationName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* Filters Section */}
      {selectedOrgId && (
        <Card sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h5" gutterBottom>
            Filter Reports
          </Typography>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <FormControl
              fullWidth
              sx={{
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
              }}
            >
              <InputLabel>Select Program</InputLabel>
              <Select
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e.target.value)}
                disabled={!programsWithCohorts.length}
              >
                {programsWithCohorts.map((program) => (
                  <MenuItem key={program.programId} value={program.programId}>
                    {program.programName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              sx={{
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
              }}
            >
              <InputLabel>Select Cohort</InputLabel>
              <Select
                value={selectedCohortId}
                onChange={(e) => handleCohortChange(e.target.value)}
                disabled={!cohorts.length}
              >
                {cohorts.map((cohort) => (
                  <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                    {cohort.cohortName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              sx={{
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
              }}
            >
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={!users.length}
              >
                {users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.userName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      {progressData && <LearnersProgressChart data={progressData} selectedUserId={selectedUserId} />}
      {userSpecificData && (
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
