import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { CSVLink } from "react-csv";
import { useParams } from 'react-router-dom';

// Material UI Imports
import {
  Card,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  Container,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Tooltip,
  TablePagination,
  TableRow,
  TextField,
  Checkbox,
  IconButton,
  Link,
  Modal,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Custom Components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// API Functions
import {
  createUser,
  createUsers,
  deleteUser,
  deleteUsers,
  getOrgUsers,
  updateUser
} from '../api';

// Constants
const TABLE_HEAD = [
  { id: 'learnerName', label: 'Learner Name', alignRight: false },
  { id: 'learnerId', label: 'LearnerId', alignRight: false },
  { id: 'cohortId', label: 'CohortIds', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true }
];

// Styled Components
const StyledCard = styled(Card)({
  width: '40%',
  margin: '10px auto',
  padding: '20px',
  Button: {
    marginTop: '10px',
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

const OrgUserCreate = () => {
  // State Management
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('cohortName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [organizationId, setOrganizationId] = useState(id);
  const [cohortId, setCohortId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    userType: '',
    userPhoneNumber: '',
    userPassword: '',
    userAddress: '',
    organizationId: id,
    cohortId: ''
  });

  // Notification State
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [id]);

  // API Handlers
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getOrgUsers(formData.organizationId);
    if (response) {
      const usersWithCohorts = response.map((user) => ({
        ...user,
        allCohorts: user.allCohorts || [],
      }));

      setUsers(usersWithCohorts);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    showNotification('Error fetching users');
  } finally {
    setLoading(false);
  }
};

  const handleCreateUser = async () => {
    try {
      const newUser = {
        user: {
          ...formData,
          organization: { organizationId: formData.organizationId }
        },
        cohortId: formData.cohortId
      };
      await createUser(newUser);
      showNotification('User created successfully');
      setOpenCreateDialog(false);
      fetchUsers();
    } catch (error) {
      showNotification('Error creating user');
    }
  };

  const handleUpdateUser = async () => {
    const updatedUser = {
        userId: selectedUserId,
        userName,
        userEmail,
        userPhoneNumber,
        userAddress,
        userPassword,
        userType,
        organization: { organizationId }
    };
    try {
      await updateUser(selectedUserId, updatedUser);
      showNotification('User updated successfully');
      setOpenUpdateDialog(false);
      fetchUsers();
    } catch (error) {
      showNotification('Error updating user');
    }
  };

  const handleBulkCreate = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        setLoading(true);
        const response = await createUsers(formData);

        // Success message: Show how many users were created
        setSnackbarMessage(`${response.createdUsersCount} users created successfully!`);

        // Error message: If there are errors, show them
        if (response.errors && response.errors.length > 0) {
            setSnackbarMessage(`${response.errors.length} errors occurred: ${response.errors.join(', ')}`);
        }

        // Optionally show cohort summary if available
        if (response.cohortSummary && Object.keys(response.cohortSummary).length > 0) {
            const cohortSummaryMessage = Object.entries(response.cohortSummary)
                .map(([cohortId, count]) => `Cohort ${cohortId}: ${count} users`)
                .join(', ');
            setSnackbarMessage(prevMessage => `${prevMessage} Cohorts Summary: ${cohortSummaryMessage}`);
        }
        setOpenSnackbar(true);
        fetchUsers();

    } catch (error) {
        console.error('Bulk create failed:', error);
        setSnackbarMessage('Error bulk creating users');
        setOpenSnackbar(true);
    } finally {
        setLoading(false);
    }
};

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      showNotification('User deleted successfully');
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (error) {
      showNotification('Error deleting user');
    }
  };

  // UI Handlers
  const handleOpenActionMenu = (event, row) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedRow(row);
    setFormData(row);
  };

  const handleCloseActionMenu = () => setActionAnchorEl(null);

  const showNotification = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleFormChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  // Render Methods
  const renderActionMenu = () => (
    <Menu
      anchorEl={actionAnchorEl}
      open={Boolean(actionAnchorEl)}
      onClose={handleCloseActionMenu}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={() => {
        setOpenUpdateDialog(true);
        handleCloseActionMenu();
      }}>
        <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
        Update
      </MenuItem>
      <MenuItem onClick={() => {
        setIsConfirmOpen(true);
        handleCloseActionMenu();
      }}>
        <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
        Delete
      </MenuItem>
    </Menu>
  );

  const renderTable = () => (
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
              rowCount={users.length}
              numSelected={selected.length}
              onRequestSort={(event, property) => {
                const isAsc = orderBy === property && order === 'asc';
                setOrder(isAsc ? 'desc' : 'asc');
                setOrderBy(property);
              }}
              onSelectAllClick={(event) => {
                if (event.target.checked) {
                  setSelected(users.map(n => n.userName));
                } else {
                  setSelected([]);
                }
              }}
            />
            <TableBody>
              {applySortFilter(users, getComparator(order, orderBy), filterName)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const selectedUser = selected.indexOf(row.userName) !== -1;
                  const cohortIds = row.allCohorts?.map(cohort => cohort.cohortId).join(', ') || 'No Cohorts';
                  return (
                    <TableRow
                      hover
                      key={row.userId}
                      tabIndex={-1}
                      role="checkbox"
                      selected={selectedUser}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUser}
                          onChange={() => {
                            const selectedIndex = selected.indexOf(row.userName);
                            let newSelected = [];
                            if (selectedIndex === -1) {
                              newSelected = [...selected, row.userName];
                            } else {
                              newSelected = selected.filter(name => name !== row.userName);
                            }
                            setSelected(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/dashboard/user-cohort/${row.userId}`} color="inherit" underline="hover">
                          {row.userName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.userId}</TableCell>
                      <TableCell>
                        <Tooltip title={cohortIds} placement="top">
                          <Typography
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {cohortIds}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleOpenActionMenu(e, row)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
      />
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Learners | Chipper Sage</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Learners
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button
            variant="contained"
            onClick={() => setOpenCreateDialog(true)}
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Create Learner
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<Iconify icon="eva:upload-fill" />}
          >
            Upload CSV
            <input type="file" hidden onChange={(e) => handleBulkCreate(e.target.files[0])} />
          </Button>
          <CSVLink data={users} filename="users.csv">
            <Button variant="contained" startIcon={<Iconify icon="eva:download-fill" />}>
              Export Learners
            </Button>
          </CSVLink>
        </Stack>

        {renderTable()}
        {renderActionMenu()}

        {/* Create User Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create Learner</DialogTitle>
                <DialogContent>
                    <TextField
                    label="User ID *"
                    fullWidth
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ marginBottom: '10px' }}
                    error={!userId}
                    helperText={!userId && "This field is required"}
                    />
                    <TextField
                    label="User Name *"
                    fullWidth
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                    error={!userName}
                    helperText={!userName && "This field is required"}
                    />
                    <TextField
                      label="User Email"
                      fullWidth
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      />
                      <TextField
                      label="User Phone Number"
                      fullWidth
                      value={userPhoneNumber}
                      onChange={(e) => setUserPhoneNumber(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      />
                      <TextField
                      label="User Address"
                      fullWidth
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      />
                      <TextField
                      label="User Type *"
                      fullWidth
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      error={!userType}
                      helperText={!userType && "This field is required"}
                      />
                      <TextField
                      label="Organization ID *"
                      fullWidth
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      error={!organizationId}
                      helperText={!organizationId && "This field is required"}
                      />
                      <TextField
                      label="Cohort ID *"
                      fullWidth
                      value={cohortId}
                      onChange={(e) => setCohortId(e.target.value)}
                      style={{ marginBottom: '10px' }}
                      error={!cohortId}
                      helperText={!cohortId && "This field is required"}
                      />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleCreateUser} color="primary"
                    disabled={!userId || !userName || !userType || !organizationId || !cohortId}
                    >Create</Button>
                </DialogActions>
            </Dialog>

        {/* Update User Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
                <DialogTitle>Update Learner</DialogTitle>
                <DialogContent>
                    <TextField label="User ID" fullWidth value={userId} onChange={(e) => setUserId(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Name" fullWidth value={userName} onChange={(e) => setUserName(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Email" fullWidth value={userEmail} onChange={(e) => setUserEmail(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Phone Number" fullWidth value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Address" fullWidth value={userAddress} onChange={(e) => setUserAddress(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Type" fullWidth value={userType} onChange={(e) => setUserType(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Password" fullWidth value={userPassword} onChange={ (e) => setUserPassword(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="Organization ID" fullWidth value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} style={{ marginBottom: '10px' }} />
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setOpenUpdateDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleUpdateUser} color="primary">Update</Button>
                </DialogActions>
            </Dialog>

        <Modal open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <StyledCard>
            <Typography variant="h6" gutterBottom>
              Are you sure you want to delete this Learner?
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteUser(selectedRow?.userId)}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </Button>
            </Stack>
          </StyledCard>
        </Modal>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
        />
      </Container>
    </>
  );
};

export default OrgUserCreate;