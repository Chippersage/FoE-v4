import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
  Snackbar, Alert, IconButton, Card, Chip, Tooltip, NoSsr, Accordion,
  AccordionSummary, AccordionDetails, Divider, Dialog, DialogContent,
  DialogTitle, DialogActions
} from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmptyStateIcon from '@mui/icons-material/FolderOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';

const apiUrl = process.env.REACT_APP_API_URL;

const AssignmentsTable = ({ cohortId }) => {
  const [assignments, setAssignments] = useState([]);
  const [statistics, setStatistics] = useState({
    correctedAssignments: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    cohortUserCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [editedAssignments, setEditedAssignments] = useState({});
  const [contentDialog, setContentDialog] = useState({
    open: false,
    title: '',
    content: '',
    link: ''
  });
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level (1 = 100%)

  // Theme colors
  const LIGHT_TEAL = '#e6f5f5';
  const LINK_COLOR = '#0066cc';
  const HOVER_COLOR = '#f5f5f5';
  const DEPENDENCY_CHIP_COLOR = '#f0e6ff';
  
  useEffect(() => {
    fetchAssignments();
  }, [cohortId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/assignments/cohort/${cohortId}`);
      // Handle the new response format with assignments and statistics
      const { assignments: fetchedAssignments, statistics: fetchedStatistics } = response.data;
      
      // Sort assignments with pending first
      const sortedAssignments = fetchedAssignments.sort((a, b) => (a.correctedDate ? 1 : -1));
      setAssignments(sortedAssignments);
      setStatistics(fetchedStatistics);
      
      // Initialize editedAssignments with current values
      const initialEdits = {};
      fetchedAssignments.forEach((assignment) => {
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
    const assignment = assignments.find(a => a.assignmentId === assignmentId);

    if (!editedData.score && !editedData.file) {
      setAlert({
        open: true,
        message: 'Please provide at least a score or a correction file',
        severity: 'warning',
      });
      return;
    }
    
    // Validate score against max score
    if (editedData.score && assignment.subconcept && assignment.subconcept.subconceptMaxscore) {
      const maxScore = assignment.subconcept.subconceptMaxscore;
      if (parseInt(editedData.score, 10) > maxScore)  {
        setAlert({
          open: true,
          message: `Score cannot exceed the maximum score of ${maxScore}`,
          severity: 'error',
        });
        return;
      }
    }

    // Validate correction date
    if (editedData.correctedDate && assignment.submittedDate) {
      const correctedDate = new Date(editedData.correctedDate);
      const submittedDate = new Date(assignment.submittedDate * 1000); // Convert timestamp to Date
      if (correctedDate < submittedDate) {
        setAlert({
          open: true,
          message: 'Correction date cannot be earlier than submission date',
          severity: 'error',
        });
        return;
      }
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

      // Update statistics
      setStatistics(prevStats => ({
        ...prevStats,
        correctedAssignments: prevStats.correctedAssignments + 1,
        pendingAssignments: prevStats.pendingAssignments - 1
      }));

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

  const handleOpenContent = (title, content, link) => {
    setContentDialog({
      open: true,
      title,
      content,
      link
    });
  };

  const handleCloseContent = () => {
    setContentDialog({
      ...contentDialog,
      open: false
    });
  };

  // Empty state component
  const EmptyState = () => (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      my={8}
      p={4}
      sx={{ 
        backgroundColor: '#f5f5f5', 
        borderRadius: 2, 
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <EmptyStateIcon sx={{ fontSize: 80, color: '#999', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No Assignments Found
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center">
        There are no assignments available for this cohort.
      </Typography>
    </Box>
  );

  return (
    <Card sx={{ p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h5" component="div">
            Assignments for Cohort: {cohortId}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Chip 
            label={`Total: ${statistics.totalAssignments}`} 
            color="default" 
            variant="outlined" 
          />
          <Chip 
            label={`Pending: ${statistics.pendingAssignments}`} 
            color="warning" 
            variant="outlined" 
          />
          <Chip 
            label={`Corrected: ${statistics.correctedAssignments}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Users: ${statistics.cohortUserCount}`} 
            color="info" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2, 
            overflow: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '& .MuiTableRow-root:hover': {
              backgroundColor: HOVER_COLOR
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f8ff' }}>
                <TableCell>Assignment ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Assignment Q</TableCell>
                <TableCell>Dependencies</TableCell>
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
                <TableRow 
                  key={assignment.assignmentId}
                  sx={{
                    backgroundColor: assignment.correctedDate ? LIGHT_TEAL : 'inherit',
                    color: assignment.correctedDate ? 'black' : 'inherit',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Chip 
                      label={assignment.assignmentId} 
                      size="small" 
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`User ID: ${assignment.user.userId}`}>
                      <span>{assignment.user.userName}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell> 
                    {assignment.subconcept.subconceptLink ? (
                      <Button
                        size="small"
                        variant="text"
                        endIcon={<LinkIcon fontSize="small" />}
                        onClick={() => handleOpenContent(
                          assignment.subconcept.subconceptId,
                          assignment.subconcept.subconceptDesc,
                          assignment.subconcept.subconceptLink
                        )}
                        sx={{ 
                          color: LINK_COLOR, 
                          textDecoration: 'underline',
                          fontWeight: 500,
                          textTransform: 'none',
                          padding: '0px 4px'
                        }}
                      >
                        {assignment.subconcept.subconceptId}
                      </Button>
                    ) : (
                      assignment.subconcept.subconceptId
                    )}
                  </TableCell>
                  <TableCell>
                    {assignment.subconcept.dependencies && assignment.subconcept.dependencies.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {assignment.subconcept.dependencies.map((dep, index) => (
                          <Chip 
                            key={index}
                            label={dep.subconceptId}
                            size="small"
                            sx={{ 
                              bgcolor: DEPENDENCY_CHIP_COLOR, 
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 } 
                            }}
                            onClick={() => handleOpenContent(
                              dep.subconceptId,
                              dep.subconceptDesc,
                              dep.subconceptLink
                            )}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={assignment.subconcept.subconceptMaxscore} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(assignment.submittedDate)}</TableCell>
                  <TableCell>
                    {assignment.submittedFile && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        href={assignment.submittedFile.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Button>
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
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
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
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <label htmlFor={`correction-file-${assignment.assignmentId}`}>
                        <input
                          accept="*/*"
                          id={`correction-file-${assignment.assignmentId}`}
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileChange(assignment.assignmentId, e.target.files[0])}
                        />
                        <Tooltip title="Upload correction file">
                          <IconButton component="span" color="primary" size="small">
                            <CloudUploadIcon />
                          </IconButton>
                        </Tooltip>
                      </label>
                      {editedAssignments[assignment.assignmentId]?.file?.name ? (
                        <Typography variant="caption" noWrap sx={{ ml: 1, maxWidth: 100 }}>
                          {editedAssignments[assignment.assignmentId].file.name}
                        </Typography>
                      ) : (
                        assignment.correctedFile && (
                          <Button
                            variant="text"
                            size="small"
                            href={assignment.correctedFile.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 1, textTransform: 'none' }}
                          >
                            View File
                          </Button>
                        )
                      )}
                    </Box>
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
                        sx={{ width: 130 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleSubmitCorrection(assignment.assignmentId)}
                      disabled={updating || assignment.correctedDate}
                      sx={{ 
                        textTransform: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      {updating ? 'Saving...' : assignment.correctedDate ? 'Corrected' : 'Save'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Content Dialog for viewing subconcept content */}
      <Dialog 
        open={contentDialog.open} 
        onClose={handleCloseContent}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
          {contentDialog.title}
        </DialogTitle>
        <DialogContent>
          {contentDialog.content && (
            <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
              {contentDialog.content}
            </Typography>
          )}
          
          {contentDialog.link && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Content Link:</Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: '500px',  // Increased height for better viewing
                  position: 'relative' // For positioning zoom controls
                }}
              >
                 <Box 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 10,
              display: 'flex',
              gap: 1,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: '4px',
              padding: '4px'
            }}
          >
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 2))}
            >
              Zoom +
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => setZoomLevel(1)} // Reset zoom
            >
              Reset
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5))}
            >
              Zoom -
            </Button>
          </Box>
          <Box 
            sx={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease'
            }}
          >
                <iframe
                  src={contentDialog.link}
                  title="Subconcept Content"
                  width="100%"
                  height="400px"  // Increased height
                  style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
                />
              </Box>
            </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContent} color="primary">
            Close
          </Button>
          {contentDialog.link && (
            <Button 
              href={contentDialog.link}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="contained"
            >
              Open in New Tab
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
          sx={{ width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AssignmentsTable;




// import React, { useState, useEffect } from 'react';
// import { Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,CircularProgress,
//     Snackbar, Alert,IconButton} from '@mui/material';
// import axios from 'axios';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { format } from 'date-fns';

// const apiUrl = process.env.REACT_APP_API_URL;

// const AssignmentsTable = ({ cohortId }) => {
//     const [assignments, setAssignments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [updating, setUpdating] = useState(false);
//     const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
//     const [editedAssignments, setEditedAssignments] = useState({});
//     const LIGHT_TEAL = '#e6f5f5';
//     useEffect(() => {
//       fetchAssignments();
//     }, [cohortId]);
  
//     const fetchAssignments = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`${apiUrl}/assignments/cohort/${cohortId}`);
//         const sortedAssignments = response.data.sort((a, b) => (a.correctedDate ? 1 : -1));
//         setAssignments(sortedAssignments);
//         // Initialize editedAssignments with current values
//         const initialEdits = {};
//         response.data.forEach((assignment) => {
//           initialEdits[assignment.assignmentId] = {
//             score: assignment.score || '',
//             remarks: assignment.remarks || '',
//             file: null,
//           };
//         });
//         setEditedAssignments(initialEdits);
//       } catch (error) {
//         console.error('Error fetching assignments:', error);
//         setAlert({
//           open: true,
//           message: 'Failed to load assignments',
//           severity: 'error',
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     const handleScoreChange = (assignmentId, score) => {
//       setEditedAssignments((prev) => ({
//         ...prev,
//         [assignmentId]: {
//           ...prev[assignmentId],
//           score,
//         },
//       }));
//     };
  
//     const handleRemarksChange = (assignmentId, remarks) => {
//       setEditedAssignments((prev) => ({
//         ...prev,
//         [assignmentId]: {
//           ...prev[assignmentId],
//           remarks,
//         },
//       }));
//     };
  
//     const handleFileChange = (assignmentId, file) => {
//       setEditedAssignments((prev) => ({
//         ...prev,
//         [assignmentId]: {
//           ...prev[assignmentId],
//           file,
//         },
//       }));
//     };
//     const handleCorrectedDateChange = (assignmentId, date) => {
//       setEditedAssignments((prev) => ({
//         ...prev,
//         [assignmentId]: {
//           ...prev[assignmentId],
//           correctedDate: date,
//         },
//       }));
//     };
//     const handleSubmitCorrection = async (assignmentId) => {
//       const editedData = editedAssignments[assignmentId];
//       const assignment = assignments.find(a => a.assignmentId === assignmentId);

//       if (!editedData.score && !editedData.file) {
//         setAlert({
//           open: true,
//           message: 'Please provide at least a score or a correction file',
//           severity: 'warning',
//         });
//         return;
//       }
//   // Validate score against max score
//   if (editedData.score && assignment.subconcept && assignment.subconcept.subconceptMaxscore) {
//     const maxScore = assignment.subconcept.subconceptMaxscore;
//     if (parseInt(editedData.score, 10) > maxScore)  {
//       setAlert({
//         open: true,
//         message: `Score cannot exceed the maximum score of ${maxScore}`,
//         severity: 'error',
//       });
//       return;
//     }
//   }

//   // Validate correction date
//   if (editedData.correctedDate && assignment.submittedDate) {
//     const correctedDate = new Date(editedData.correctedDate);
//     const submittedDate = new Date(assignment.submittedDate);
//     if (correctedDate < submittedDate) {
//       setAlert({
//         open: true,
//         message: 'Correction date cannot be earlier than submission date',
//         severity: 'error',
//       });
//       return;
//     }
//   }
//       setUpdating(true);
//       const formData = new FormData();
  
//       if (editedData.file) {
//         formData.append('file', editedData.file);
//       }
  
//       formData.append('score', editedData.score);
//       formData.append('remarks', editedData.remarks);
//       if (editedData.correctedDate) {
//         const correctedDateTime = new Date(editedData.correctedDate).toISOString();
//         formData.append('correctedDate', correctedDateTime);
//       }
      
//       try {
//         const response = await axios.post(
//           `${apiUrl}/assignments/${assignmentId}/correct`,
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//         );
  
//         // Update the local state with the corrected assignment
//         setAssignments((prev) =>
//           prev.map((assignment) =>
//             assignment.assignmentId === assignmentId ? response.data : assignment
//           )
//         );
  
//         setAlert({
//           open: true,
//           message: 'Assignment successfully corrected',
//           severity: 'success',
//         });
//       } catch (error) {
//         console.error('Error correcting assignment:', error);
//         setAlert({
//           open: true,
//           message: 'Failed to correct assignment',
//           severity: 'error',
//         });
//       } finally {
//         setUpdating(false);
//       }
//     };
  
//     const formatDateTime = (timestamp) => {
//       if (!timestamp) return '-';
//       // Convert timestamp to Date object
//       const date = new Date(timestamp * 1000);
//       return format(date, 'yyyy-MM-dd HH:mm:ss');
//     };
  
//     return (
//       <Box>
//         <Typography variant="h5" gutterBottom>
//           Assignments for Cohort: {cohortId}
//         </Typography>
  
//         {loading ? (
//           <Box display="flex" justifyContent="center" my={4}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <TableContainer component={Paper} sx={{ mt: 2, overflow: 'auto' }}>
//             <Table size="small">
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Assignment ID</TableCell>
//                   <TableCell>User</TableCell>
//               {/*     <TableCell>Program</TableCell>
//                   <TableCell>Stage</TableCell>
//                   <TableCell>Unit</TableCell> */}
//                   <TableCell>Assignment Q</TableCell>
//                   <TableCell>Max Score</TableCell>
//                   <TableCell>Submitted Date</TableCell>
//                   <TableCell>Submitted File</TableCell>
//                   <TableCell>Score</TableCell>
//                   <TableCell>Remarks</TableCell>
//                   <TableCell>Correction File</TableCell>
//                   <TableCell>Corrected Date</TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {assignments.map((assignment) => (
//                   <TableRow key={assignment.assignmentId}
//                   sx={{
//                     backgroundColor: assignment.correctedDate ? LIGHT_TEAL : 'inherit',
//                     color: assignment.correctedDate ? 'black' : 'inherit',
//                   }}
//                   >
//                     <TableCell>{assignment.assignmentId}</TableCell>
//                     <TableCell>{assignment.user.userName} ({assignment.user.userId})</TableCell>
//                 {/*   <TableCell>{assignment.program.programName}</TableCell>
//                     <TableCell>{assignment.stage.stageId}</TableCell>
//                     <TableCell>{assignment.unit.unitId}</TableCell> */}
//                     <TableCell> {assignment.subconcept.subconceptLink ? (
//     <a href={assignment.subconcept.subconceptLink}
//       target="_blank"
//       rel="noopener noreferrer"
//       style={{ color: '#0066cc', textDecoration: 'underline' }} >
//       {assignment.subconcept.subconceptId}
//     </a>
//   ) : (
//     assignment.subconcept.subconceptId
//   )}
// </TableCell>
//                     <TableCell>{assignment.subconcept.subconceptMaxscore}</TableCell>
//                     <TableCell>{formatDateTime(assignment.submittedDate)}</TableCell>
//                     <TableCell>
//                       {assignment.submittedFile && (
// <a href={assignment.submittedFile.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }} >
//     View File
//                         </a>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         type="number"
//                         size="small"
//                         value={editedAssignments[assignment.assignmentId]?.score || ''}
//                         onChange={(e) => handleScoreChange(assignment.assignmentId, e.target.value)}
//                         inputProps={{
//                           min: 0,
//                           max: assignment.subconcept.subconceptMaxscore,
//                           style: { width: '60px' },
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         size="small"
//                         multiline
//                         maxRows={3}
//                         value={editedAssignments[assignment.assignmentId]?.remarks || ''}
//                         onChange={(e) => handleRemarksChange(assignment.assignmentId, e.target.value)}
//                         inputProps={{ style: { width: '150px' } }}
//                       />
//                     </TableCell>
//                     <TableCell>
//                     <label htmlFor={`correction-file-${assignment.assignmentId}`}>
//   <input
//     accept="*/*"
//     id={`correction-file-${assignment.assignmentId}`}
//     type="file"
//     style={{ display: 'none' }}
//     onChange={(e) => handleFileChange(assignment.assignmentId, e.target.files[0])}
//   />
//   <IconButton component="span" color="primary">
//     <CloudUploadIcon />
//   </IconButton>
// </label>
// {editedAssignments[assignment.assignmentId]?.file?.name ||
//           (assignment.correctedFile  ? (
//           <a
//           href={assignment.correctedFile.downloadUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ color: '#0066cc', textDecoration: 'underline' }}
//           >
//           View File
//           </a>
//           ) : '')}
// </TableCell>
// <TableCell>
// {assignment.correctedDate ? (
// formatDateTime(assignment.correctedDate)
// ) : (
//       <TextField
//         type="date"
//         size="small"
//         value={editedAssignments[assignment.assignmentId]?.correctedDate || ''}
//         onChange={(e) => handleCorrectedDateChange(assignment.assignmentId, e.target.value)}
//       />
//     )}
//   </TableCell>
//                     <TableCell>
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         size="small"
//                         onClick={() => handleSubmitCorrection(assignment.assignmentId)}
//                         disabled={updating}
//                       >
//                         {updating ? 'Saving...' : 'Save'}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
  
//         {/* Alert message */}
//         <Snackbar
//           open={alert.open}
//           autoHideDuration={6000}
//           onClose={() => setAlert({ ...alert, open: false })}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setAlert({ ...alert, open: false })}
//             severity={alert.severity}
//           >
//             {alert.message}
//           </Alert>
//         </Snackbar>
//       </Box>
//     );
//   };
  
//   export default AssignmentsTable;