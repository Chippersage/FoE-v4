import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
  Snackbar, Alert, IconButton, Card, Chip, Tooltip, NoSsr, Accordion,
  AccordionSummary, AccordionDetails, Divider, Dialog, DialogContent,
  DialogTitle, DialogActions, TablePagination, InputAdornment
} from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmptyStateIcon from '@mui/icons-material/FolderOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { format } from 'date-fns';
import { filter } from 'lodash';

const apiUrl = process.env.REACT_APP_API_URL;

// Table header definitions for sorting
const TABLE_HEAD = [
  { id: 'assignmentId', label: 'Assignment ID', alignRight: false },
  { id: 'userName', label: 'User', alignRight: false },
  { id: 'subconceptId', label: 'Assignment Q', alignRight: false },
  { id: 'dependencies', label: 'Reference', alignRight: false },
  { id: 'maxScore', label: 'Max Score', alignRight: true },
  { id: 'submittedDate', label: 'Submitted Date', alignRight: false },
  { id: 'submittedFile', label: 'Submitted File', alignRight: false },
  { id: 'score', label: 'Score', alignRight: false },
  { id: 'remarks', label: 'Remarks', alignRight: false },
  { id: 'correctionFile', label: 'Correction File', alignRight: false },
  { id: 'correctedDate', label: 'Corrected Date', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];

// Component for the search toolbar
const UserListToolbar = ({ filterName, onFilterName, filterConcept, onFilterConcept }) => {
  return (
    <Box sx={{ py: 1, px: 1, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search user..."
          value={filterName}
          onChange={onFilterName}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { height: '36px' } }}
        />
        <TextField
          fullWidth
          placeholder="Search by concept..."
          value={filterConcept}
          onChange={onFilterConcept}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon sx={{ color: 'text.disabled', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { height: '36px' } }}
        />
      </Box>
    </Box>
  );
};

// Sort comparator function
function descendingComparator(a, b, orderBy) {
  if (orderBy === 'userName') {
    return b.user.userName.localeCompare(a.user.userName);
  }
  if (orderBy === 'subconceptId') {
    return b.subconcept.subconceptId.localeCompare(a.subconcept.subconceptId);
  }
  if (orderBy === 'maxScore') {
    return b.subconcept.subconceptMaxscore - a.subconcept.subconceptMaxscore;
  }
  if (orderBy === 'submittedDate' || orderBy === 'correctedDate') {
    const aValue = a[orderBy] || 0;
    const bValue = b[orderBy] || 0;
    return bValue - aValue;
  }
  
  const bValue = b[orderBy] === null ? '' : b[orderBy];
  const aValue = a[orderBy] === null ? '' : a[orderBy];
  
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Filter and sort function
const applySortFilter = (array, comparator, queryName, queryConcept) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  
  let filteredArray = array;
  
  if (queryName || queryConcept) {
    filteredArray = filter(
      array, 
      (item) => {
        const nameMatch = queryName ? item.user.userName.toLowerCase().includes(queryName.toLowerCase()) : true;
        const conceptMatch = queryConcept ? item.subconcept.subconceptId.toLowerCase().includes(queryConcept.toLowerCase()) : true;
        return nameMatch && conceptMatch;
      }
    );
    return filteredArray;
  }
  
  return stabilizedThis.map((el) => el[0]);
};

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
    link: '',
    type: ''
  });
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level (1 = 100%)

  // Pagination and sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('submittedDate');
  const [filterName, setFilterName] = useState('');
  const [filterConcept, setFilterConcept] = useState('');

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

  const handleOpenContent = (title, content, link, type) => {
    setContentDialog({
      open: true,
      title,
      content,
      link,
      type
    });
  };

  const handleCloseContent = () => {
    setContentDialog({
      ...contentDialog,
      open: false
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter handlers
  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleFilterByConcept = (event) => {
    setFilterConcept(event.target.value);
    setPage(0);
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

  // Not found state component when filtering returns no results
  const NotFoundState = () => (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={12} sx={{ py: 3 }}>
          <Paper sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" paragraph>
              Not found
            </Typography>
            <Typography variant="body2">
              No results found for username &quot;{filterName}&quot; 
              {filterConcept && <> or concept &quot;{filterConcept}&quot;</>}. 
              Try checking for typos or using complete words.
            </Typography>
          </Paper>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  // Apply filtering and sorting
  const filteredAssignments = applySortFilter(
    assignments, 
    getComparator(order, orderBy), 
    filterName,
    filterConcept
  );

  const isNotFound = !filteredAssignments.length && (!!filterName || !!filterConcept);

  // Calculate pagination
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredAssignments.length) 
    : 0;

  const visibleRows = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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

      {/* Search and filter toolbar */}
      <UserListToolbar
        filterName={filterName}
        onFilterName={handleFilterByName}
        filterConcept={filterConcept}
        onFilterConcept={handleFilterByConcept}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.alignRight ? 'right' : 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {headCell.id !== 'actions' && headCell.id !== 'dependencies' && 
                      headCell.id !== 'submittedFile' && headCell.id !== 'correctionFile' ? (
                        <Box
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => handleRequestSort(headCell.id)}
                        >
                          {headCell.label}
                          {orderBy === headCell.id ? (
                            <Box component="span" sx={{ ml: 0.5 }}>
                              {order === 'desc' ? (
                                <ArrowDownwardIcon fontSize="small" />
                              ) : (
                                <ArrowUpwardIcon fontSize="small" />
                              )}
                            </Box>
                          ) : null}
                        </Box>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              
              {isNotFound ? (
                <NotFoundState />
              ) : (
                <TableBody>
                  {visibleRows.map((assignment) => (
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
                              assignment.subconcept.subconceptLink,
                              assignment.subconcept.subconceptType
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
                                  dep.subconceptLink,
                                  dep.subconceptType
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
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={12} />
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            component="div"
            count={filteredAssignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
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
                {contentDialog.type === "image" ||
                  contentDialog.type === "assignment_image" ? (
                    <img
                      src={contentDialog.link}
                      alt={contentDialog.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "400px",
                        objectFit: "contain",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                      }}
                    />
                  ) : contentDialog.type === "video" ||
                    contentDialog.type === "assignment_video" ? (
                      <video
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                      }}
                    >
                      <source src={contentDialog.link} type="video/mp4" />
                      <track 
                        kind="captions" 
                        src="" 
                        label="English" 
                        srcLang="en" 
                        default 
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={contentDialog.link}
                      title="Subconcept Content"
                      width="100%"
                      height="400px"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                      }}
                    />
                  )}
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