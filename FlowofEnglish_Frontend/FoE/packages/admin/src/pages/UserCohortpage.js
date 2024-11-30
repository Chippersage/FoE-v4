import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CSVLink } from 'react-csv';
import { filter } from 'lodash';

import { Table, Button, TextField, Checkbox, Modal, Snackbar, Box, Typography, Paper, Grid, Card, TableBody, TableCell, TableHead, TableRow,
  TableSortLabel, CircularProgress, IconButton, Menu, MenuItem, Stack, TablePagination, TableContainer, Container, FormControl, InputLabel,
  Select, } from '@mui/material';

import { styled } from '@mui/material/styles';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

// Custom Components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

import {
  getOrgUsers,
  getCohortMapping,
  createUserCohortMapping,
  updateUserCohortMapping,
  deleteUserCohortMapping,
  importUserCohortMappings,
} from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'learnerName', label: 'Learner Name', alignRight: false },
  { id: 'learnerId', label: 'Learner Id', alignRight: false },
  { id: 'leaderboardScore', label: 'Leaderboard Score', alignRight: false },
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [cohortName, setCohortName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [selectedRowsMessage, setSelectedRowsMessage] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('cohortId');
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);
  const [formValues, setFormValues] = useState({
    userId: '',
    cohortId: '',
    leaderboardScore: '',
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

  const handleCreateOrUpdate = async () => {
    try {
      if (currentRecord) {
        if (!formValues.leaderboardScore) {
          showSnackbar('Leaderboard score is required for updates', 'error');
          return;
        }
        await updateUserCohortMapping(currentRecord.userCohortId, {
          ...formValues,
          cohortId,
        });
        showSnackbar('Record updated successfully');
      } else {
        await createUserCohortMapping({
          ...formValues,
          cohortId,
        });
        showSnackbar('Record created successfully');
      }
      fetchUserCohortData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar('Error saving data', 'error');
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = userCohortData.map((n) => n.userName);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (userName) => {
    const selectedIndex = selected.indexOf(userName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, userName);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleClose = () => setOpen(false);

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

  const handleDelete = async (userCohortId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteUserCohortMapping(userCohortId);
        showSnackbar('Record deleted successfully');
        fetchUserCohortData();
      } catch (error) {
        showSnackbar('Error deleting data', 'error');
      }
    }
  };

  const handleEdit = (record) => {
    console.log(record);
    setCurrentRecord(record);
    setFormValues({
      userId: record.userId,
      cohortId,
      leaderboardScore: record.leaderboardScore || '',
    });
    setIsModalOpen(true);
  };

  const handleSearch = (query) => {
    const filteredData = userCohortData.filter(
      (row) =>
        row.userName.toLowerCase().includes(query.toLowerCase())
    );
    setUserCohortData(filteredData);
  };

  const handleSelectRow = (userCohortId) => {
    const updatedSelectedRows = selectedRows.includes(userCohortId)
      ? selectedRows.filter((id) => id !== userCohortId)
      : [...selectedRows, userCohortId];

    setSelectedRows(updatedSelectedRows);

    // Set the selected rows message
    if (updatedSelectedRows.length === 1) {
      const user = userCohortData.find((item) => item.userCohortId === userCohortId);
      setSelectedRowsMessage(`You have selected: ${user.userName}`);
    } else if (updatedSelectedRows.length > 1) {
      setSelectedRowsMessage(`You have selected ${updatedSelectedRows.length} users.`);
    } else {
      setSelectedRowsMessage(''); // Reset message when no rows are selected
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = userCohortData.map((item) => item.userCohortId);
      setSelectedRows(allIds);
      setSelectedRowsMessage(`You have selected ${allIds.length} users.`);
    } else {
      setSelectedRows([]);
      setSelectedRowsMessage('');
    }
  };

  const handleSort = (property) => {
    const isAscending = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({ key: property, direction: isAscending ? 'desc' : 'asc' });
    const sortedData = [...userCohortData].sort((a, b) =>
      isAscending ? (a[property] > b[property] ? -1 : 1) : a[property] < b[property] ? -1 : 1
    );
    setUserCohortData(sortedData);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const openMenu = (event, userCohortId) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(userCohortId);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveRowId(null);
  };

  const openCreateModal = () => {
    setCurrentRecord(null);
    setFormValues({ userId: '', cohortId: '', leaderboardScore: '' });
    setIsModalOpen(true);
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
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<Iconify icon="eva:plus-fill" />}
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
            }}
          >
            Add Learner to Cohort
          </Button>

          <Button
            variant="contained"
            component="label"
            style={{ marginRight: '10px' }}
            startIcon={<Iconify icon="eva:plus-fill" />}
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
            }}
          >
            Upload CSV
            <input type="file" hidden onChange={(e) => importUserCohortMappings(e.target.files[0])} />
          </Button>

          <CSVLink data={userCohortData} filename="users.csv" className="btn btn-primary">
          <Button variant="contained" startIcon={<Iconify icon="eva:download-fill" />}
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
            }}>Export Learners</Button>
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
          {applySortFilter( userCohortData, getComparator(order, orderBy), filterName ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
          const { userId } = row;
          const selectedUser = selected.indexOf(userId) !== -1;
          return (
          <TableRow hover key={row.userId} tabIndex={-1} role="checkbox" selected={selectedUser}>
          <TableCell padding="checkbox">
          <Checkbox checked={selected.includes(row.userId)} onChange={() => handleClick(row.userId)} />
          </TableCell>
          <TableCell>{row.userName}</TableCell>
          <TableCell>{row.userId}</TableCell>
          <TableCell>{row.leaderboardScore}</TableCell>
          <TableCell align="right">
          <IconButton onClick={(e) => openMenu(e, row.userCohortId)}>
          <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu} >
          {/* <MenuItem onClick={() => handleEdit(row)}>Update</MenuItem> */}
          <MenuItem onClick={() => handleDelete(row.userCohortId)}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
          </MenuItem>
          </Menu>
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
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Card>
      </Container>

      {/* Selected Rows Message */}
      {selectedRowsMessage && (
        <Snackbar
          open={selectedRowsMessage !== ''}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={selectedRowsMessage}
        />
      )}
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
            {currentRecord ? 'Update Learner' : 'Add Learner to Cohort'}
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrUpdate();
            }}
          >
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Learner</InputLabel>
              <Select
                value={formValues.userId}
                onChange={(e) => setFormValues({ ...formValues, userId: e.target.value })}
                required
                disabled={!!currentRecord}
              >
                {orgUsers
                .filter(user => !userCohortData.some(
                  cohortUser => cohortUser.userId === user.userId
                ))
                .map(user => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.userName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Cohort ID"
              value={cohortId}
              fullWidth
              margin="normal"
              disabled
            />
            
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{
bgcolor: '#5bc3cd', color: 'white', fontWeight: 'bold', '&:hover': { bgcolor: '#DB5788',},
py: 1.5, px: 2, borderRadius: '8px', mt: 2, }}>
              {currentRecord ? 'Update' : 'Create'}
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
