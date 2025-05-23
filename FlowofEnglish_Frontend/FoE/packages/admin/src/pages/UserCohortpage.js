import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CSVLink } from 'react-csv';
import { filter } from 'lodash';
import axios from 'axios';

import { Table, Button, TextField, Checkbox, Modal, Snackbar, Box, Typography, Paper, Grid, Card, TableBody, TableCell, TableHead, TableRow,
  TableSortLabel, CircularProgress, IconButton, Menu, MenuItem, Stack, TablePagination, TableContainer, Container, FormControl, InputLabel,
  Select, FormHelperText, } from '@mui/material';

import { styled } from '@mui/material/styles';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

// Custom Components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

import { getOrgUsers, getCohortMapping, createUserCohortMapping, updateUserCohortMapping, deleteUserCohortMapping, importUserCohortMappings,
  downloadAllAssignments, } from '../api';
import BulkUploadCorrectedAssignments from './BulkUploadCorrectedAssignments';
import AssignmentsTable from './AssignmentsTable';

const apiUrl = process.env.REACT_APP_API_URL;
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'learnerId', label: 'Learner Id', alignRight: false },
  { id: 'learnerName', label: 'Learner Name', alignRight: false },
  { id: 'leaderboardScore', label: 'Leaderboard Score', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true },
];

// -----------------------------------------------------------------------

// Styled Components
const StyledCard = styled(Card)({
  width: '40%',
  margin: '10px auto',
  padding: '20px',
  Button: {
    marginTop: '10px',
  },
});

const StyledSearchBar = styled(TextField)({
  marginBottom: '20px',
  '& .MuiInputBase-root': {
    backgroundColor: '#fff',
  },
});

// Helper Functions
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const applySortFilter = (array, comparator, query) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (query) {
    return filter(array, (_user) => _user.userName.toLowerCase().includes(query.toLowerCase()));
  }
  return stabilizedThis.map((el) => el[0]);
};

const UserCohortPage = () => {
  const { cohortId } = useParams();
  const location = useLocation();
  const { organizationId } = useParams();
  const orgId = organizationId || location.state?.organizationId || 'defaultOrgId';
  
  const [orgUsers, setOrgUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [userCohortData, setUserCohortData] = useState([]);
  const [cohortName, setCohortName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('cohortId');
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [showAssignmentsTable, setShowAssignmentsTable] = useState(false);
  const [formValues, setFormValues] = useState({
    userId: '',
    cohortId: '',
    leaderboardScore: '',
  });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormValues, setUpdateFormValues] = useState({
    status: 'ACTIVE',
    leaderboardScore: '',
    deactivatedReason: '',
  });
  useEffect(() => {
  //  console.log('Organization ID from useLocation or default:', orgId);
    if (orgId) {
      fetchOrgUsers();
    } else {
  //    console.warn('Organization ID is not defined. Unable to fetch organization users.');
    }
  }, [orgId]);
  
  const fetchOrgUsers = async () => {
    if (!orgId) {
      showSnackbar('Organization ID is missing', 'error');
    //  console.error('fetchOrgUsers: Organization ID is undefined or invalid.');
      return;
    }
  
   // console.log('Fetching organization users for Organization ID:', orgId);
    try {
      const users = await getOrgUsers(orgId);
      if (users) {
     //   console.log('Fetched Organization Users:', users);
        setOrgUsers(users);
      } else {
    //    console.warn('No users found for Organization ID:', orgId);
        showSnackbar('No users found for this organization', 'warning');
      }
    } catch (error) {
      console.error('Error fetching organization users:', error);
      showSnackbar('Failed to fetch organization users', 'error');
    }
  };
  
  
  useEffect(() => {
    if (cohortId) {
      fetchUserCohortData(cohortId);
    }
  }, [cohortId]);

  
  const fetchUserCohortData = async (cohortId) => {
    setLoading(true);
    try {
      const data = await getCohortMapping(cohortId);
      setUserCohortData(data);
      setCohortName(data[0]?.cohortName || '');
    } catch (error) {
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormValues({
      userId: '',
      cohortId,
      leaderboardScore: '',
    });
    setCurrentRecord(null);
  };
const resetUpdateForm = () => {
    setUpdateFormValues({
      status: 'ACTIVE',
      leaderboardScore: '',
      deactivatedReason: '',
    });
  };
    const handleCreate = async () => {
    try {
      await createUserCohortMapping({
        ...formValues,
        cohortId,
      });
      showSnackbar('Learner added to cohort successfully');
      fetchUserCohortData(cohortId);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar('Error adding learner to cohort', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      // Validation for deactivation reason
      if (updateFormValues.status === 'DISABLED' && 
          (!updateFormValues.deactivatedReason || updateFormValues.deactivatedReason.trim() === '')) {
        showSnackbar('Deactivation reason is required when disabling a user', 'error');
        return;
      }

      // Prepare update payload
      const updatePayload = {
        status: updateFormValues.status,
        leaderboardScore: updateFormValues.leaderboardScore !== '' ? 
                          parseFloat(updateFormValues.leaderboardScore) : 
                          currentRecord.leaderboardScore,
        deactivatedReason: updateFormValues.status === 'DISABLED' ? 
                          updateFormValues.deactivatedReason : 
                          null
      };

      await updateUserCohortMapping(currentRecord.userId, currentRecord.cohortId, updatePayload);

      showSnackbar('Learner updated successfully');
      fetchUserCohortData(cohortId);
      setIsUpdateModalOpen(false);
      resetUpdateForm();
    } catch (error) {
      console.error('Error updating learner:', error);
      showSnackbar('Error updating learner', 'error');
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = userCohortData.map((n) => n.userId);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (userId) => {
    const selectedIndex = selected.indexOf(userId);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, userId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const response = await importUserCohortMappings(file);
    setResponse(response);
  };

  const handleDownloadAssignmentsCSV = async () => {
    try {
      setIsEmailSending(true);
      showSnackbar('Processing assignments and preparing email...', 'info');
      
      const response = await axios.get(`${apiUrl}/assignments/send-csv-report`, {
        params: { cohortId }
      });
      
      if (response.status === 200) {
        showSnackbar('Assignment report has been sent to mentor\'s email', 'success');
      } else {
        showSnackbar('Something went wrong when sending the report', 'warning');
      }
    } catch (error) {
      console.error('Error sending CSV report:', error);
      const errorMessage = error.response?.data || 'Failed to send assignment report';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleDownloadAssignments = async () => {
    try {
      setIsEmailSending(true);
      showSnackbar('Processing assignments and preparing email...', 'info');
      
      try {
        await axios.get(`${apiUrl}/assignments/bulk-download`, {
          params: { cohortId }
        });
        
        try {
          const emailResponse = await axios.get(`${apiUrl}/assignments/bulk-download-send`, {
            params: { cohortId }
          });
          
          if (emailResponse.status === 200) {
            showSnackbar('Assignments downloaded and email sent to mentor', 'success');
          } else {
            showSnackbar('Assignments downloaded but email status unknown', 'warning');
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          showSnackbar('Assignments downloaded but failed to send email', 'warning');
        }
      } catch (downloadError) {
        console.error('Error downloading assignments:', downloadError);
        showSnackbar('Failed to download assignments', 'error');
      }
    } catch (error) {
      console.error('General error:', error);
      showSnackbar('An unexpected error occurred', 'error');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleOpenUpdateModal = (record) => {
    setCurrentRecord(record);
    setUpdateFormValues({
      status: record.status || 'ACTIVE',
      leaderboardScore: record.leaderboardScore || '',
      deactivatedReason: record.deactivatedReason || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    resetUpdateForm();
    setIsUpdateModalOpen(false);
    setCurrentRecord(null);
  };

  const openMenu = (event, userCohortId) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(userCohortId);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  // Toggle function for assignments table view
  const toggleAssignmentsTable = () => {
    setShowAssignmentsTable(!showAssignmentsTable);
  };

  const filteredUserCohortData = applySortFilter(userCohortData, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUserCohortData.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Cohort | ChipperSage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            {cohortName}
          </Typography>
          {showAssignmentsTable && (
            <Button 
              variant="outlined" 
              onClick={toggleAssignmentsTable}
              sx={{
                color: '#5bc3cd',
                borderColor: '#5bc3cd',
                '&:hover': { bgcolor: '#f0f9fa', borderColor: '#DB5788' },
              }}
            >
              Back to Learners
            </Button>
          )}
        </Stack>
        {showAssignmentsTable ? (
          <Box sx={{ mt: 3 }}>
            <AssignmentsTable cohortId={cohortId} />
          </Box>
        ) : (
          <>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Button
                variant="contained"
                onClick={handleOpenModal}
                startIcon={<Iconify icon="eva:plus-fill" />}
                sx={{
                  bgcolor: '#5bc3cd',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#DB5788',
                  },
                  py: 1.5,
                  px: 2,
                  borderRadius: '8px',
                }}
              >
                Add Learner to Cohort
              </Button>

              <Button
                variant="contained"
                component="label"
                style={{ marginRight: '10px' }}
                startIcon={<Iconify icon="eva:upload-fill" />}
                sx={{
                  bgcolor: '#5bc3cd',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#DB5788',
                  },
                  py: 1.5,
                  px: 2,
                  borderRadius: '8px',
                }}
              >
                Upload CSV
                <input type="file" hidden onChange={(e) => importUserCohortMappings(e.target.files[0])} />
              </Button>
              
              <Button 
                variant="contained" 
                onClick={handleDownloadAssignmentsCSV}
                startIcon={isEmailSending ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:archive-fill" />}
                disabled={isEmailSending}
                sx={{
                  bgcolor: '#5bc3cd',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#DB5788',
                  },
                  py: 1.5,
                  px: 2,
                  borderRadius: '8px',
                }}
              >
                {isEmailSending ? 'Sending email...' : 'Download Assignments CSV'}
              </Button>
              <Button
                variant="contained"
                onClick={toggleAssignmentsTable}
                sx={{
                  bgcolor: '#5bc3cd',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#DB5788' },
                  py: 1.5,
                  px: 2,
                  borderRadius: '8px',
                }}
              >
                View Assignments
              </Button>
              <CSVLink data={userCohortData} filename="users.csv" className="btn btn-primary">
                <Button variant="contained" startIcon={<Iconify icon="eva:download-fill" />}
                  sx={{
                    bgcolor: '#5bc3cd',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#DB5788',
                    },
                    py: 1.5,
                    px: 2,
                    borderRadius: '8px',
                  }}>
                  Export Learners
                </Button>
              </CSVLink>
            </Stack>
            <Card>
              <UserListToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={(e) => setFilterName(e.target.value)}
              />

              <Scrollbar>
                {loading && <CircularProgress />}
                <TableContainer sx={{ minWidth: 800 }}>
                  <Table>
                    <UserListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={userCohortData.length}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllClick={handleSelectAllClick}
                    />
                    <TableBody>
                      {applySortFilter(userCohortData, getComparator(order, orderBy), filterName)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => {
                          const { userId } = row;
                          const selectedUser = selected.indexOf(userId) !== -1;
                          return (
                            <TableRow hover key={row.userId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              <TableCell padding="checkbox">
                                <Checkbox checked={selected.includes(row.userId)} onChange={() => handleClick(row.userId)} />
                              </TableCell>
                              <TableCell>{row.userId}</TableCell>
                              <TableCell>{row.userName}</TableCell>
                              <TableCell>{row.leaderboardScore}</TableCell>
                              <TableCell>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{
                                    color: row.status === 'ACTIVE' ? 'green' : 'red',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {row.status || 'ACTIVE'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="large" 
                                  color="inherit" 
                                  onClick={() => handleOpenUpdateModal(row)}
                                >
                                  <Iconify icon="eva:edit-fill" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>

                    {isNotFound && (
                      <TableBody>
                        <TableRow>
                          <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            <Paper sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" paragraph>
                                Not found
                              </Typography>
                              <Typography variant="body2">
                                No results found for &quot;{filterName}&quot;. Try checking for typos or using complete
                                words.
                              </Typography>
                            </Paper>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
              </Scrollbar>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUserCohortData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </Card>
          </>
        )}
      </Container>

      {/* Add Learner Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            padding: 3,
            borderRadius: 1,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add Learner to Cohort
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Learner</InputLabel>
              <Select
                value={formValues.userId}
                onChange={(e) => setFormValues({ ...formValues, userId: e.target.value })}
                required
              >
                {Array.isArray(orgUsers) &&
                  orgUsers
                    .filter(user => !userCohortData?.some(
                      cohortUser => cohortUser.userId === user.userId
                    ))
                    .map(user => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.userName} ({user.userId})
                      </MenuItem>
                    ))
                }
              </Select>
            </FormControl>
            <TextField
              label="Cohort ID"
              value={cohortId}
              fullWidth
              margin="normal"
              disabled
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{
                bgcolor: '#5bc3cd', 
                color: 'white', 
                fontWeight: 'bold', 
                '&:hover': { bgcolor: '#DB5788' },
                py: 1.5, 
                px: 2, 
                borderRadius: '8px', 
                mt: 2, 
              }}
            >
              Create
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Update Learner Modal */}
      <Modal open={isUpdateModalOpen} onClose={handleCloseUpdateModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            padding: 3,
            borderRadius: 1,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Update Learner: {currentRecord?.userName}
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
          >
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={updateFormValues.status}
                onChange={(e) => setUpdateFormValues({ ...updateFormValues, status: e.target.value })}
                required
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="DISABLED">DISABLED</MenuItem>
              </Select>
            </FormControl>
            
            {updateFormValues.status === 'DISABLED' && (
              <TextField
                label="Deactivation Reason"
                value={updateFormValues.deactivatedReason}
                onChange={(e) => setUpdateFormValues({ ...updateFormValues, deactivatedReason: e.target.value })}
                fullWidth
                margin="normal"
                required
                error={updateFormValues.status === 'DISABLED' && !updateFormValues.deactivatedReason}
                helperText={updateFormValues.status === 'DISABLED' && !updateFormValues.deactivatedReason ? 
                  "Deactivation reason is required" : ""}
              />
            )}
            
            <TextField
              label="Leaderboard Score"
              type="number"
              value={updateFormValues.leaderboardScore}
              onChange={(e) => setUpdateFormValues({ ...updateFormValues, leaderboardScore: e.target.value })}
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <FormHelperText sx={{ mb: 2 }}>
              Note: User ID, Cohort ID, Organization ID, and creation date cannot be modified.
            </FormHelperText>
            
            <Button 
              type="submit" 
              variant="contained"
              fullWidth 
              sx={{
                bgcolor: '#5bc3cd', 
                color: 'white', 
                fontWeight: 'bold', 
                '&:hover': { bgcolor: '#DB5788' },
                py: 1.5, 
                px: 2, 
                borderRadius: '8px', 
                mt: 2, 
              }}
            >
              Update
            </Button>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default UserCohortPage;