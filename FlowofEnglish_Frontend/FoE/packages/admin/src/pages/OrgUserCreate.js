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
  getUserCohortMapping,
  updateUser
} from '../api';

// Constants
const TABLE_HEAD = [
  { id: 'userName', label: 'User Name', alignRight: false },
  { id: 'userId', label: 'UserId', alignRight: false },
  { id: 'cohortName', label: 'Cohort Name', alignRight: false },
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
      const users = await getOrgUsers(formData.organizationId);
      if (users) {
        const usersWithCohorts = await Promise.all(
          users.map(async (user) => {
            try {
              const userCohortMapping = await getUserCohortMapping(user.userId);
              return {
                ...user,
                cohort: userCohortMapping?.cohort || null,
              };
            } catch (error) {
              console.error(`Error fetching cohort mapping for user ${user.userId}:`, error);
              return { ...user, cohort: null };
            }
          })
        );
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
    try {
      const updatedUser = {
        ...formData,
        organization: { organizationId: formData.organizationId }
      };
      await updateUser(formData.userId, updatedUser);
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
                      <TableCell>{row.cohort?.cohortName || 'No Cohort'}</TableCell>
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
            Create User
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
              Export Users
            </Button>
          </CSVLink>
        </Stack>

        {renderTable()}
        {renderActionMenu()}

        {/* Dialogs */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {Object.keys(formData).map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleFormChange(field)}
                  fullWidth
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
          <DialogTitle>Update User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {Object.keys(formData).map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleFormChange(field)}
                  fullWidth
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} variant="contained">Update</Button>
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