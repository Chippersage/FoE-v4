import { styled } from '@mui/material/styles';
import { filter } from 'lodash';
import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';



import {
  Card, Table, Stack, Paper, Button, Checkbox, TableRow, Menu, MenuItem, TableBody, TableCell, Container,Typography,
  IconButton, Modal, TableContainer, TablePagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Link} from '@mui/material';

import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import { getCohortPrograms, getOrgCohorts, getOrgs, getOrgProgramSubscriptions, createCohortProgram, deleteCohortProgram } from '../api';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cohortId', label: 'Cohort Id', alignRight: false },
  { id: 'cohortName', label: 'Cohort Name', alignRight: false },
  { id: 'programId', label: 'Program Id', alignRight: false },
  { id: 'programName', label: 'Program Name', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true }
];

// ----------------------------------------------------------------------

const StyledCard = styled(Card)({
  width: '40%',
  margin: '10px auto',
  padding: '20px',
  Button: {
    marginTop: '10px',
  },
});

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_cohort) => _cohort.cohortName.toLowerCase().includes(query.toLowerCase()));
  }
  return stabilizedThis.map((el) => el[0]);
}

function CohortPrograms() {
  const [orgs, setOrgs] = useState([]); // Store organizations
  const [selectedOrg, setSelectedOrg] = useState(''); // Selected organization
  const [programs, setPrograms] = useState([]); // Store programs for selected organization
  const [cohorts, setCohorts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('cohortName');
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ organizationId: '', cohortId: '', programId: '' });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

// Fetch data
const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCohortPrograms();
    //  console.log ("program", data);
      if (!Array.isArray(data)) {
        console.error("API did not return an array.");
      }
      const formattedData = data.map(item => ({
        cohortId: item.cohort?.cohortId || '',
        cohortName: item.cohort?.cohortName || '',
        programId: item.program?.programId || '',
        programName: item.program?.programName || '',
      }));
      setCohorts(formattedData); 
    } catch (error) {
      console.error("Error during API call:", error);
      showNotification('Failed to load cohort programs.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrgsData = useCallback(async () => {
    try {
      const orgData = await getOrgs();
      setOrgs(orgData);
    } catch (error) {
      showNotification('Failed to load organizations.', 'error');
    }
  }, []);

  const fetchOrgDetails = useCallback(async (orgId) => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [programsData, cohortsData] = await Promise.all([
        getOrgProgramSubscriptions(orgId),
        getOrgCohorts(orgId)
      ]);
      // Extract program data from subscriptions
    const formattedPrograms = (programsData || []).map(item => ({
      programId: item.program?.programId || '',
      programName: item.program?.programName || ''
    }));
      setPrograms(formattedPrograms);
      setCohorts(cohortsData || []);
    } catch (error) {
      showNotification('Error fetching organization details.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchData();
    fetchOrgsData();
  }, [fetchData, fetchOrgsData]);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrgDetails(selectedOrg);
    }
  }, [selectedOrg, fetchOrgDetails]);

// Fetch data when the component mounts
useEffect(() => {
  fetchData();
}, []);

  useEffect(() => {
  //  console.log("Cohorts State Updated: ", cohorts);
  }, [cohorts]);
  

// Handlers
const handleRequestSort = (event, property) => {
  const isAsc = orderBy === property && order === 'asc';
  setOrder(isAsc ? 'desc' : 'asc');
  setOrderBy(property);
};

const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    setSelected(cohorts.map((n) => n.cohortId));
    return;
  }
  setSelected([]);
};

const handleClick = (cohortId) => {
  const selectedIndex = selected.indexOf(cohortId);
  let newSelected = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, cohortId);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(
      selected.slice(0, selectedIndex),
      selected.slice(selectedIndex + 1)
    );
  }
  setSelected(newSelected);
};

const handleSubmit = async () => {
  const errors = {};
  if (!formData.cohortId) errors.cohortId = 'Cohort is required';
  if (!formData.programId) errors.programId = 'Program is required';
  setFormErrors(errors);

  if (Object.keys(errors).length === 0) {
    try {
      showNotification('Waiting for backend response...', 'info');
      const payload = {
        cohort: { cohortId: formData.cohortId },
        program: { programId: formData.programId }
      };
      const response = await createCohortProgram(payload);
      if (response) {
        showNotification('Cohort program created successfully!', 'success');
        setIsCreateDialogOpen(false);
        fetchData();
      } else {
        showNotification('Failed to create cohort program.', 'error');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification(error.response.data, 'error');
      } else {
        showNotification('Failed to create cohort program.', 'error');
      }
    }
  }
};

const handleOpenCreateDialog = () => {
  setFormData({ organizationId: '', cohortId: '', programId: '' });
  setFormErrors({});
  setSelectedOrg(''); // Reset selected organization
  setPrograms([]); // Clear programs
  setCohorts([]); // Clear cohorts
  setIsCreateDialogOpen(true);
};

const handleOpenActionMenu = (event, row) => {
  setActionAnchorEl(event.currentTarget);
  setSelectedRow(row);
};

const handleCloseActionMenu = () => {
  setActionAnchorEl(null);
};

const handleFormChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

// // Fetch organizations
// useEffect(() => {
//   async function fetchOrgs() {
//     try {
//       const orgData = await getOrgs();
//       setOrgs(orgData); // Assuming orgData is an array of organizations
//     } catch (error) {
//       console.error('Error fetching organizations:', error);
//     }
//   }
//   fetchOrgs();
// }, []);

// // Fetch programs and cohorts when organization is selected
// useEffect(() => {
  
//     async function fetchDetails() {
//       setLoading(true);
//       try {
//         const [programsData, cohortsData] = await Promise.all([
//           getOrgProgramSubscriptions(selectedOrg),
//           getOrgCohorts(selectedOrg),
//         ]);
//         setPrograms(programsData || []);
//         setCohorts(cohortsData || []);
//       } catch (error) {
//         showNotification('Error fetching programs or cohorts.', 'error');
//       } finally {
//         setLoading(false);
//       }
//     }
  
//   if (selectedOrg) {
//   fetchDetails();
//   }
// }, [selectedOrg]);

// const handleSubmit = async () => {
//   const errors = {};
//   if (!formData.cohortId) errors.cohortId = 'Cohort ID is required';
//   if (!formData.programId) errors.programId = 'Program ID is required';
//   setFormErrors(errors);

//   if (Object.keys(errors).length === 0) {
//     const payload = {
//       cohort: { cohortId: formData.cohortId },
//       program: { programId: formData.programId },
//     };
//     try {
//       await createCohortProgram(payload);
//       showNotification('Cohort program created successfully!', 'success');
//       setIsCreateDialogOpen(false);
//       fetchData();
//     } catch (error) {
//       showNotification('Failed to create cohort program.', 'error');
//     }
//   }
// };

const handleDelete = async (cohortProgramId) => {
  try {
    await deleteCohortProgram(cohortProgramId);
    showNotification('Cohort program deleted successfully!', 'success');
    fetchData();
  } catch (error) {
    showNotification('Failed to delete cohort program.', 'error');
  }
};

const handleCloseDialogs = () => {
  setIsCreateDialogOpen(false);
  setIsUpdateDialogOpen(false);
};

const handleCloseNotification = () => {
  setNotification({ ...notification, open: false });
};

const showNotification = (message, type) => {
  setNotification({ open: true, message, type });
};

const filteredCohorts = applySortFilter(cohorts, getComparator(order, orderBy), filterName);
const isNotFound = !filteredCohorts.length && !!filterName;

return (
    <>
      <Helmet>
        <title> Program-Cohort Mapping | Chippersage </title>
      </Helmet>

      <Container>
       {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}> */}
       <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
          Program-Cohort Mapping
          </Typography>
          </Stack>

          {/* <div style={{ padding: '20px' }}> */}
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button variant="contained" onClick={handleOpenCreateDialog} startIcon={<Iconify icon="eva:plus-fill" />}
          sx={{
            bgcolor: '#5bc3cd', // Default background color
            color: 'white', // Text color
            fontWeight: 'bold', // Font weight
            '&:hover': {
              bgcolor: '#DB5788', // Hover background color
            },
            py: 1.5, // Padding Y
            px: 2, // Padding X
            borderRadius: '8px', // Border radius
          }}>
            New Program-Cohort Mapping
          </Button>
        </Stack>

        <Card >
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={(e) => setFilterName(e.target.value)} />

          <Scrollbar>
          {loading ? (
    <>
    <CircularProgress/>
      <Typography variant="h6" paragraph align="center">
        Loading ProgramCohorts...
      </Typography>
    </>
  ) : (
    <>
        <TableContainer sx={{ minWidth: 800 }}>
            <Table>
            <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={cohorts.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
            />
      <TableBody>
        {filteredCohorts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
          const { cohortId, cohortName, programId, programName } = row;
          const selectedCohort = selected.indexOf(cohortId) !== -1;

              return (
              <TableRow hover key={cohortId} tabIndex={-1} role="checkbox" selected={selectedCohort} >
              <TableCell padding="checkbox">
                <Checkbox checked={selectedCohort} onChange={() => handleClick(cohortId)} />
              </TableCell>
              {/* <TableCell component="th" scope="row" padding="none">
              </TableCell> */}
        <TableCell align="left">{cohortId}</TableCell>
        <TableCell align="left">{cohortName}</TableCell>
        <TableCell align="left">{programId}</TableCell>
        <TableCell align="left">{programName}</TableCell>
              <TableCell align="right">
                <IconButton size="large" color="inherit" onClick={(e) => handleOpenActionMenu(e, row)}>
                  <Iconify icon="eva:more-vertical-fill" />
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
                            No results found for &quot;{filterName}&quot;. Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
            </>
            )}
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCohorts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Card>
        {/* </div> */}
      </Container>

{/* Create Cohort Modal */}
<Dialog open={isCreateDialogOpen} onClose={handleCloseDialogs} fullWidth>
  <DialogTitle>Create Program-Cohort Mapping</DialogTitle>
  <DialogContent>
      <Stack spacing={3}>
        {/* Organization Dropdown */}
        <TextField
          select
          fullWidth
          label="Select Organization"
          value={formData.organizationId}
          onChange={(e) => {
            const orgId = e.target.value;
            setSelectedOrg(orgId);
            setFormData({ ...formData, organizationId: orgId, cohortId: '', programId: '' });
          }}
          helperText={formErrors.organizationId}
          error={!!formErrors.organizationId}
        >
          {orgs.map((org) => (
            <MenuItem key={org.organizationId} value={org.organizationId}>
              {org.organizationName}
            </MenuItem>
          ))}
        </TextField>

    <TextField
      select
      fullWidth
      margin="normal"
      label="Select Cohort"
      value={formData.cohortId}
    //  onChange={handleFormChange}
      onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
      disabled={!selectedOrg || cohorts.length === 0}
      error={!!formErrors.cohortId}
      helperText={formErrors.cohortId}
      required
      >
      {cohorts.map((cohort) => (
        <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
          {cohort.cohortName}
        </MenuItem>
      ))}
    </TextField>
    
    <TextField
      fullWidth
      select
      label="Select Program"
      value={formData.programId}
      // onChange={handleFormChange}
      onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
      disabled={!selectedOrg || programs.length === 0}
      error={!!formErrors.programId}
      helperText={formErrors.programId}
      required
    >
      {programs.map((program) => (
            <MenuItem key={program.programId} value={program.programId}>
              {program.programName}
            </MenuItem>
          ))}
        </TextField>
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialogs}
    sx={{
      bgcolor: '#5bc3cd', // Default background color
      color: 'white', // Text color
      fontWeight: 'bold', // Font weight
      '&:hover': {
      bgcolor: '#DB5788', // Hover background color
      },
      py: 0.5, // Padding Y
      px: 1, // Padding X
      borderRadius: '4px', // Border radius
      }}
    >Cancel</Button>
    <Button onClick={handleSubmit} color="primary" 
    sx={{
      bgcolor: '#5bc3cd', // Default background color
      color: 'white', // Text color
      fontWeight: 'bold', // Font weight
      '&:hover': {
      bgcolor: '#DB5788', // Hover background color
      },
      py: 0.5, // Padding Y
      px: 1, // Padding X
      borderRadius: '4px', // Border radius
      }}
    >Create</Button>
  </DialogActions>
</Dialog>

 {/* Update Cohort Modal
<Dialog open={isUpdateDialogOpen} onClose={handleCloseDialogs}>
  <DialogTitle>Update CohortProgram</DialogTitle>
  <DialogContent>
    <TextField
      fullWidth
      margin="normal"
      name="cohortId"
      label="Cohort ID"
      value={formData.cohortId}
      disabled
    />
    <TextField
      fullWidth
      margin="normal"
      name="Program Id"
      label="Program ID"
      value={programId}
      disabled
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialogs}>Cancel</Button>
    <Button onClick={handleSubmit} variant="contained">Update</Button>
  </DialogActions>
</Dialog> */}

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseActionMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* <MenuItem onClick={() => { handleOpenUpdateDialog(selectedRow); handleCloseActionMenu(); }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Update
        </MenuItem> */}
        <MenuItem onClick={() => { setIsConfirmOpen(true); handleCloseActionMenu(); }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <StyledCard>
          <Typography variant="h6" gutterBottom>Are you sure you want to delete this Program-Cohort Mapping?</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleDelete(selectedRow.cohortProgramId)}
          sx={{
            bgcolor: '#5bc3cd', // Default background color
            color: 'white', // Text color
            fontWeight: 'bold', // Font weight
            '&:hover': {
            bgcolor: '#DB5788', // Hover background color
            },
            py: 0.5, // Padding Y
            px: 1, // Padding X
            borderRadius: '4px', // Border radius
            }}
          >  Delete
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setIsConfirmOpen(false)}
          sx={{
            bgcolor: '#5bc3cd', // Default background color
            color: 'white', // Text color
            fontWeight: 'bold', // Font weight
            '&:hover': {
            bgcolor: '#DB5788', // Hover background color
            },
            py: 0.5, // Padding Y
            px: 1, // Padding X
            borderRadius: '4px', // Border radius
            }}
          >Cancel
          </Button>
          </Stack>
        </StyledCard>
      </Modal>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <MuiAlert
          onClose={handleCloseNotification}
          severity={notification.type}
          elevation={6}
          variant="filled"
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}

export default CohortPrograms;