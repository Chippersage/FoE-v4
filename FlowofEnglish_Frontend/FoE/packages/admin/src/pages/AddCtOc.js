/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getPrograms, addProgramsToOrganization, getSelectedPrograms } from '../api'; // Ensure the API functions are correctly imported

const ProgramList = () => {
  const [Programs, setPrograms] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { organisationId } = useParams();

  useEffect(() => {
    // Fetch all Programs
    getPrograms().then((res) => {
      setPrograms(res);

      // Initialize selectedPrograms state
      const initialSelected = res.reduce((acc, Program) => {
        acc[Program.id] = false;
        return acc;
      }, {});
      setSelectedPrograms(initialSelected);

      // Fetch selected Programs for this organization
      getSelectedPrograms(organisationId).then((selectedProgramIds) => {
        const updatedSelected = { ...initialSelected };
        selectedProgramIds.forEach((ProgramId) => {
          updatedSelected[ProgramId] = true;
        });
        setSelectedPrograms(updatedSelected);
      });
    });
  }, [organisationId]);

  const handleToggle = (ProgramId) => {
    setSelectedPrograms((prevSelectedPrograms) => {
      const updatedSelected = { ...prevSelectedPrograms };
      updatedSelected[ProgramId] = !prevSelectedPrograms[ProgramId]; // Toggle the selection

      return updatedSelected;
    });
  };

  const handleSave = () => {
    // Extract selected Program IDs from the selectedPrograms state
    const selectedProgramIds = Object.keys(selectedPrograms)
      .filter((ProgramId) => selectedPrograms[ProgramId])
      .map((ProgramId) => parseInt(ProgramId, 10));

    // Call the API to add Programs to the organization
    addProgramsToOrganization(organisationId, selectedProgramIds)
      .then((res) => {
        console.log('Programs added:', res);
        setSnackbarMessage('Programs updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error adding Programs:', error);
        setSnackbarMessage('Failed to update Programs');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Program to organisation
      </Typography>
      <Grid container spacing={2}>
        {Programs.map((Program) => (
          <Grid item xs={12} sm={6} md={4} key={Program.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">{Program.Program_name}</Typography>
              </CardContent>
              <CardActions>
                <FormControlLabel
                  control={<Checkbox checked={selectedPrograms[Program.id]} onChange={() => handleToggle(Program.id)} />}
                  label={selectedPrograms[Program.id] ? 'Selected' : 'Not Selected'}
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="primary" onClick={handleSave} sx={{ marginTop: 2 }}>
        Save
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Changed anchor origin to top
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProgramList;

/* eslint-enable */
