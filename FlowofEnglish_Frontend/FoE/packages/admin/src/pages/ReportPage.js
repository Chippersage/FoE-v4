import axios from 'axios';
import { useState, useEffect } from 'react';
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import LearnersProgressChart from '../components/LearnersProgressChart';
import LineProgressChart from '../components/LineProgressChart';
import ProgressDataTable from '../components/TableView';

import { getOrgs } from '../api';

const apiUrl = process.env.REACT_APP_API_URL;

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
  </div>
);

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
  const [selectedVisualization, setSelectedVisualization] = useState('barchart');
  const [isLoading, setIsLoading] = useState(true);
  // Fetch organizations on mount
  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await getOrgs()
      setOrganizations(response);
      console.log(response)
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Fetch programs and cohorts for the selected organization
  const fetchOrgProgramsWithCohorts = async (orgId) => {
    setIsLoading(true);
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
    }finally {
      setIsLoading(false);
    }
  };

  // Fetch users for selected program and cohort
  const fetchUsers = async (programId, cohortId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/reports/program/${programId}/cohort/${cohortId}/progress`);
      const { users } = response.data;
      setUsers([{ userId: 'All users', userName: 'All users' }, ...users]);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    finally {
      setIsLoading(false);
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
              <InputLabel>Select Visualization</InputLabel>
            <Select
              value={selectedVisualization}
              onChange={(e) => setSelectedVisualization(e.target.value)}
            >
              <MenuItem value="barchart">Bar Chart</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
              <MenuItem value="linechart">Line Chart</MenuItem>
            </Select>
            </FormControl>
          </div>
        </Card>
      )}

     {/* Display loading spinner when data is being fetched */}
 {isLoading ? (
        <LoadingSpinner />
      ) : (
        // Display either the chart or table based on selection
        progressData && (
          <Card sx={{ padding: 3, marginBottom: 3 }}>
            {selectedVisualization === 'barchart' ? (
              <LearnersProgressChart data={progressData} programId={selectedProgramId} selectedUserId={selectedUserId} />
            ) : selectedVisualization === 'linechart' ? (
              <LineProgressChart data={progressData} />
            ) : (
              <ProgressDataTable data={progressData} />
            )}
          </Card>
        )
      )}
    </Container>
  );
};

export default ProgressDashboard;
