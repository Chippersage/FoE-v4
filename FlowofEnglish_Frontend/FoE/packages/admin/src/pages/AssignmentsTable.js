import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,CircularProgress,
    Snackbar, Alert,IconButton} from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { format } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL;

const AssignmentsTable = ({ cohortId }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [editedAssignments, setEditedAssignments] = useState({});
    const LIGHT_TEAL = '#e6f5f5';
    useEffect(() => {
      fetchAssignments();
    }, [cohortId]);
  
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/assignments/cohort/${cohortId}`);
        const sortedAssignments = response.data.sort((a, b) => (a.correctedDate ? 1 : -1));
        setAssignments(sortedAssignments);
        // Initialize editedAssignments with current values
        const initialEdits = {};
        response.data.forEach((assignment) => {
          initialEdits[assignment.assignmentId] = {
            score: assignment.score || '',
            remarks: assignment.remarks || '',
            file: null,
          };
        });
        setEditedAssignments(initialEdits);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAlert({
          open: true,
          message: 'Failed to load assignments',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
  
    const handleScoreChange = (assignmentId, score) => {
      setEditedAssignments((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          score,
        },
      }));
    };
  
    const handleRemarksChange = (assignmentId, remarks) => {
      setEditedAssignments((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          remarks,
        },
      }));
    };
  
    const handleFileChange = (assignmentId, file) => {
      setEditedAssignments((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          file,
        },
      }));
    };
    const handleCorrectedDateChange = (assignmentId, date) => {
      setEditedAssignments((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          correctedDate: date,
        },
      }));
    };
    const handleSubmitCorrection = async (assignmentId) => {
      const editedData = editedAssignments[assignmentId];
  
      if (!editedData.score && !editedData.file) {
        setAlert({
          open: true,
          message: 'Please provide at least a score or a correction file',
          severity: 'warning',
        });
        return;
      }
  
      setUpdating(true);
      const formData = new FormData();
  
      if (editedData.file) {
        formData.append('file', editedData.file);
      }
  
      formData.append('score', editedData.score);
      formData.append('remarks', editedData.remarks);
      if (editedData.correctedDate) {
        const correctedDateTime = new Date(editedData.correctedDate).toISOString();
        formData.append('correctedDate', correctedDateTime);
      }
      
      try {
        const response = await axios.post(
          `${apiUrl}/assignments/${assignmentId}/correct`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
        // Update the local state with the corrected assignment
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.assignmentId === assignmentId ? response.data : assignment
          )
        );
  
        setAlert({
          open: true,
          message: 'Assignment successfully corrected',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error correcting assignment:', error);
        setAlert({
          open: true,
          message: 'Failed to correct assignment',
          severity: 'error',
        });
      } finally {
        setUpdating(false);
      }
    };
  
    const formatDateTime = (timestamp) => {
      if (!timestamp) return '-';
      // Convert timestamp to Date object
      const date = new Date(timestamp * 1000);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    };
  
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Assignments for Cohort: {cohortId}
        </Typography>
  
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Assignment ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Subconcept</TableCell>
                  <TableCell>Max Score</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Submitted File</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Correction File</TableCell>
                  <TableCell>Corrected Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.assignmentId}
                  sx={{
                    backgroundColor: assignment.correctedDate ? LIGHT_TEAL : 'inherit',
                    color: assignment.correctedDate ? 'black' : 'inherit',
                  }}
                  >
                    <TableCell>{assignment.assignmentId}</TableCell>
                    <TableCell>{assignment.user.userName} ({assignment.user.userId})</TableCell>
                    <TableCell>{assignment.program.programId}</TableCell>
                    <TableCell>{assignment.stage.stageId}</TableCell>
                    <TableCell>{assignment.unit.unitId}</TableCell>
                    <TableCell title={assignment.subconcept.subconceptDesc}>
                      {assignment.subconcept.subconceptId}
                    </TableCell>
                    <TableCell>{assignment.subconcept.subconceptMaxscore}</TableCell>
                    <TableCell>{formatDateTime(assignment.submittedDate)}</TableCell>
                    <TableCell>
                      {assignment.submittedFile && (
                        <a
                          href={`${apiUrl}/files/${assignment.submittedFile.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {assignment.submittedFile.fileName}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={editedAssignments[assignment.assignmentId]?.score || ''}
                        onChange={(e) => handleScoreChange(assignment.assignmentId, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: assignment.subconcept.subconceptMaxscore,
                          style: { width: '60px' },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        multiline
                        maxRows={3}
                        value={editedAssignments[assignment.assignmentId]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(assignment.assignmentId, e.target.value)}
                        inputProps={{ style: { width: '150px' } }}
                      />
                    </TableCell>
                    <TableCell>
                    <label htmlFor={`correction-file-${assignment.assignmentId}`}>
  <input
    accept="*/*"
    id={`correction-file-${assignment.assignmentId}`}
    type="file"
    style={{ display: 'none' }}
    onChange={(e) => handleFileChange(assignment.assignmentId, e.target.files[0])}
  />
  <IconButton component="span" color="primary">
    <CloudUploadIcon />
  </IconButton>
</label>
{/* <TableCell>
  <TextField
    type="date"
    size="small"
    value={editedAssignments[assignment.assignmentId]?.correctedDate || ''}
    onChange={(e) => handleCorrectedDateChange(assignment.assignmentId, e.target.value)}
  />
</TableCell> */}
                      {editedAssignments[assignment.assignmentId]?.file?.name ||
                        (assignment.correctedFile ? assignment.correctedFile.fileName : '')}
                    </TableCell>
                    <TableCell>
    {assignment.correctedDate ? (
      formatDateTime(assignment.correctedDate)
    ) : (
      <TextField
        type="date"
        size="small"
        value={editedAssignments[assignment.assignmentId]?.correctedDate || ''}
        onChange={(e) => handleCorrectedDateChange(assignment.assignmentId, e.target.value)}
      />
    )}
  </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleSubmitCorrection(assignment.assignmentId)}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
  
        {/* Alert message */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setAlert({ ...alert, open: false })}
            severity={alert.severity}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  };
  
  export default AssignmentsTable;