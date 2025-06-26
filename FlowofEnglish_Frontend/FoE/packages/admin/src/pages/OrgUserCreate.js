import { styled } from '@mui/material/styles';
import { filter } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet-async';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { useParams } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

// Material UI Imports
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Box,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

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
  getOrgCohorts,
  getOrgUsers,
  updateUser,
  getUserStatusOptions,
} from '../api';

// Constants
const TABLE_HEAD = [
  { id: 'learner Id', label: 'Learner Id', alignRight: false },
  { id: 'learnerName', label: 'Learner Name', alignRight: false },
  { id: 'cohortId', label: 'CohortIds', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true },
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

// Button Styles
const buttonStyles = {
  bgcolor: '#5bc3cd',
  color: 'white',
  fontWeight: 'bold',
  '&:hover': { bgcolor: '#DB5788' },
  py: 1.5,
  px: 2,
  borderRadius: '8px',
};
// Status Chip Styles
const StatusChip = styled('div')(({ status }) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  backgroundColor: status === 'ACTIVE' ? '#4caf50' : '#f44336',
  color: 'white',
}));

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
  const [cohorts, setCohorts] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('userName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [bulkCreateResponse, setBulkCreateResponse] = useState({
    summary: {
      createdUserCount: 0,
      createdUserCohortMappingCount: 0,
      warningCount: 0,
      errorCount: 0,
    },
    warnings: [],
    errors: [],
  });

  const [userId, setUserId] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userPhoneNumber, setUserPhoneNumber] = React.useState('');
  const [countryCode, setCountryCode] = useState('');
  const [userAddress, setUserAddress] = React.useState('');
  const [userType, setUserType] = React.useState('');
  const [userPassword, setUserPassword] = useState('');
  const [organizationId, setOrganizationId] = React.useState(id);
  const [userStatus, setUserStatus] = useState('ACTIVE');
  const [deactivatedReason, setDeactivatedReason] = useState('');
  const [cohortId, setCohortId] = React.useState('');
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const summaryRef = useRef(null);
  const [statusOptions] = useState(getUserStatusOptions());

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  // API Handlers
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getOrgUsers(organizationId);
      if (response) {
        const usersWithCohorts = response.map((user) => ({
          ...user,
          allCohorts: user.allCohorts || [],
        }));
        setUsers(usersWithCohorts);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Validate form fields
  React.useEffect(() => {
    const isValid = userId.trim() && userName.trim() && userType.trim() && organizationId.trim() && cohortId.trim();
    setIsFormValid(isValid);
  }, [userId, userName, userType, organizationId, cohortId]);

  // Validate Phone Number (10 digits without country code)
  const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

  // Validate Email
  const validateEmail = (email) => {
    // Allow null or empty values, or validate proper email format
    return !email || /\S+@\S+\.\S+/.test(email);
  };
  // Handle Phone Number Change
  const handlePhoneNumberChange = (value, data) => {
    const rawPhone = value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
    const strippedPhone = rawPhone.slice(data.dialCode.length); // Remove the country code
    setCountryCode(data.dialCode);
    setUserPhoneNumber(strippedPhone);
  };

  // Handle Email Change
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setUserEmail(value);
  };

  const resetFormState = () => {
    setUserId('');
    setUserName('');
    setUserEmail('');
    setUserPhoneNumber('');
    setUserAddress('');
    setUserType('');
    setCohortId('');
    setUserStatus('ACTIVE');
    setDeactivatedReason('');
    setSelectedUserId(null);
  };

  const handleCreateUser = async () => {
    // Validate phone number
    if (!validatePhoneNumber(userPhoneNumber)) {
      setSnackbarMessage('Invalid phone number. Please enter a 10-digit number.');
      setOpenSnackbar(true);
      return;
    }

    // Validate email if provided
    if (userEmail && !validateEmail(userEmail)) {
      setSnackbarMessage('Invalid email address. Please enter a valid email or leave it blank.');
      setOpenSnackbar(true);
      return;
    }
    const newUser = {
      user: {
        userId,
        userName,
        userEmail: userEmail || null, // Allow null value if email is not provided
        userType,
        userPhoneNumber,
        status: 'ACTIVE', // New users are always active
        userAddress,
        organization: { organizationId },
      },
      cohortId,
    };
    try {
      const response = await createUser(newUser);
      if (response.success) {
        showNotification('User created successfully');
        fetchUsers();
        resetFormState();
        setOpenCreateDialog(false);
      } else {
        showNotification(`Error creating user: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      showNotification('Error creating user. Please try again later.');
      console.error(error);
    }
  };

  const handleOpenCreateDialog = () => {
    resetFormState();
    setSelectedUserId(null);
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    resetFormState(); // Reset form state when closing dialog
    setSelectedUserId(null);
    setOpenCreateDialog(false);
  };
  // Fetch cohorts when component mounts or organization ID changes
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const response = await getOrgCohorts(organizationId);
        if (response) {
          setCohorts(response);
        }
      } catch (error) {
        console.error('Error fetching cohorts:', error);
        showNotification('Error fetching cohorts');
      }
    };

    if (organizationId) {
      fetchCohorts();
    }
  }, [organizationId]);

  // Handle Status Change with validation for deactivation reason
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setUserStatus(newStatus);

    // Reset deactivation reason when changing to ACTIVE
    if (newStatus === 'ACTIVE') {
      setDeactivatedReason('');
    }
  };

  // Use the ID from URL params to set organization ID initially
  useEffect(() => {
    if (id) {
      setOrganizationId(id);
    }
  }, [id]);

  const handleUpdateUser = async () => {
    // Validate phone number
    if (userPhoneNumber && !validatePhoneNumber(userPhoneNumber)) {
      setSnackbarMessage('Invalid phone number. Please enter a 10-digit number.');
      setOpenSnackbar(true);
      return;
    }

    // Validate email if it's provided (only if it's updated)
    if (userEmail && !validateEmail(userEmail)) {
      setSnackbarMessage('Invalid email address. Please enter a valid email or leave it blank.');
      setOpenSnackbar(true);
      return;
    }

    // Validate deactivation reason when disabling a user
    if (userStatus === 'DISABLED' && (!deactivatedReason || deactivatedReason.trim() === '')) {
      setSnackbarMessage('Deactivation reason is required when disabling a user');
      setOpenSnackbar(true);
      return;
    }
    const updatedUser = {
      userId: selectedUserId,
      userName,
      userEmail,
      userPhoneNumber,
      userAddress,
      userPassword,
      userType,
      status: userStatus,
      deactivatedReason: userStatus === 'DISABLED' ? deactivatedReason : null,
      organization: { organizationId },
    };
    try {
      const response = await updateUser(selectedUserId, updatedUser);
      if (response && response.success) {
        setSnackbarMessage('User updated successfully');
        fetchUsers();
        resetFormState();
        setOpenUpdateDialog(false);
      } else {
        setSnackbarMessage(response?.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error in handleUpdateUser:', error);
      setSnackbarMessage('Error updating user. Please try again.');
    } finally {
      setOpenSnackbar(true);
    }
  };

  // Open Update Dialog and pre-fill user data
  const handleOpenUpdateDialog = (user) => {
    setSelectedUserId(user.userId);
    setUserId(user.userId);
    setUserName(user.userName);
    setUserEmail(user.userEmail);
    setUserPhoneNumber(user.userPhoneNumber);
    setUserAddress(user.userAddress);
    setUserType(user.userType);
    setUserStatus(user.status || 'ACTIVE');
    setDeactivatedReason(user.deactivatedReason || '');
    setUserPassword(''); // Don't pre-fill password for security reasons
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    resetFormState();
    setOpenUpdateDialog(false);
  };

  const openMenu = (event, user) => {
    resetFormState();
    setSelectedUserId(user.userId);
    setUserId(user.userId);
    setUserName(user.userName);
    setUserEmail(user.userEmail);
    setUserType(user.userType);
    setUserPassword(user.userPassword);
    setUserPhoneNumber(user.userPhoneNumber);
    setUserAddress(user.userAddress);
    setOrganizationId(user.organization?.organizationId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Create a separate component for the CSV upload response
  const CSVUploadResponse = ({ response, onDownload }) => (
    <Card className="mt-4 p-6">
      <Typography variant="h6" className="mb-4">
        Learners CSV Summary
      </Typography>
      <div className="space-y-2">
        <p>{response.summary.createdUserCount}Learners created successfully.</p>
        <p>{response.summary.createdUserCohortMappingCount} Learner-cohort mappings created.</p>
        <p>{response.summary.warningCount} warnings.</p>
        <p>{response.summary.errorCount} errors.</p>

        {/* Warnings Section */}
        {response.warnings.length > 0 && (
          <div className="mt-4">
            <Typography variant="h6" className="text-yellow-600">
              Warnings
            </Typography>
            <ul className="list-disc pl-6 mt-2">
              {response.warnings.map((warning) => (
                <li key={warning.id} className="text-yellow-700">
                  {warning.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors Section */}
        {response.errors.length > 0 && (
          <div className="mt-4">
            <Typography variant="h6" className="text-red-600">
              Errors
            </Typography>
            <ul className="list-disc pl-6 mt-2">
              {response.errors.map((error) => (
                <li key={error.id} className="text-red-700">
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Download Report Button */}
        <div className="mt-4">
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={onDownload}
            className="bg-[#5bc3cd] text-white font-bold hover:bg-[#DB5788] py-1.5 px-2 rounded-lg"
          >
            Download Report
          </Button>
        </div>
      </div>
    </Card>
  );
  const handleBulkCreate = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Invalid file type. Please upload a CSV file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setIsFileUploaded(false); // Reset upload status before processing
      const response = await createUsers(formData);

      const { createdUserCount, createdUserCohortMappingCount, warningCount, warnings, errorCount, errors } = response;

      // Set summary information
      const summaryMessage = `
      ${createdUserCount} users created successfully.
      ${createdUserCohortMappingCount} user-cohort mappings created.
      ${warningCount} warnings, ${errorCount} errors.
    `;
      setSnackbarMessage(summaryMessage);
      setOpenSnackbar(true);

      // Update the UI state to show response details
      setBulkCreateResponse({
        summary: { createdUserCount, createdUserCohortMappingCount, warningCount, errorCount },
        warnings: formatWarnings(warnings),
        errors: formatErrors(errors),
      });
      setIsFileUploaded(true); // Mark file upload as successful
      fetchUsers(); // Refresh the user list

      // Scroll to response after a short delay to ensure component is rendered
      setTimeout(() => {
        if (summaryRef.current) {
          summaryRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    } catch (error) {
      console.error('Bulk create failed:', error);
      setSnackbarMessage('Error bulk creating users');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Format Warnings for Better Readability
  const formatWarnings = (warnings) => {
    return warnings.map((warning, index) => {
      return {
        id: index,
        message: warning,
      };
    });
  };

  // Format Errors for Better Readability
  const formatErrors = (errors) => {
    return errors.map((error, index) => {
      return {
        id: index,
        message: error,
      };
    });
  };
  // DownloadReport after bulk users response
  const downloadReport = () => {
    const reportContent = `
    Users Created: ${bulkCreateResponse.summary.createdUserCount}
    User-Cohort Mappings Created: ${bulkCreateResponse.summary.createdUserCohortMappingCount}
    Warnings: ${bulkCreateResponse.summary.warningCount}
    Errors: ${bulkCreateResponse.summary.errorCount}
    
    Warnings:
    ${bulkCreateResponse.warnings.map((w) => w.message).join('\n')}
    
    Errors:
    ${bulkCreateResponse.errors.map((e) => e.message).join('\n')}
  `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_creation_report.txt';
    link.click();
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      showNotification('User deleted successfully');
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (error) {
      showNotification('Error deleting user');
    }
  };

  const handleBulkDelete = async () => {
    const userIds = selectedUsers.map((user) => user.userId);
    try {
      const resultMessage = await deleteUsers(userIds);
      setSnackbarMessage(resultMessage); // Display backend message on success
      setOpenSnackbar(true);
      fetchUsers(); // Refresh the listnm start
    } catch (error) {
      setSnackbarMessage(`Error bulk deleting users: ${error.message}`);
      setOpenSnackbar(true);
    }
  };

  const handleDeleteDialogOpen = (userId) => {
    setSelectedUserId(userId);
  };

  const confirmDelete = async () => {
    await handleDeleteUser(selectedUserId);
  };

  // UI Handlers
  const handleOpenActionMenu = (event, user) => {
    openMenu(event, user);
    setSelectedRow(user);
  };

  const handleCloseActionMenu = () => setActionAnchorEl(null);

  const showNotification = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const formatUserDataForExport = (users) => {
    return users.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      userPhoneNumber: user.userPhoneNumber || '',
      userAddress: user.userAddress,
      userType: user.userType,
      userEmail: user.userEmail || '',
      organizationId: user.organization?.organizationId || '',
      cohortId: user.cohort?.cohortId || '',
      cohortName: user.cohort?.cohortName || '',
      programId: user.program?.programId || '',
      programName: user.program?.programName || '',
    }));
  };

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;

  // Render Methods
  const renderActionMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem
        onClick={() => {
          setOpenUpdateDialog(true);
          handleMenuClose();
        }}
      >
        <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
        Update
      </MenuItem>
      <MenuItem
        onClick={() => {
          setIsConfirmOpen(true);
          handleMenuClose();
        }}
      >
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
                  setSelected(users.map((n) => n.userId));
                } else {
                  setSelected([]);
                }
              }}
            />
            <TableBody>
              {applySortFilter(users, getComparator(order, orderBy), filterName)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const selectedUser = selected.indexOf(row.userId) !== -1;
                  const cohortIds = row.allCohorts?.map((cohort) => cohort.cohortId).join(', ') || 'No Cohorts';
                  return (
                    <TableRow hover key={row.userId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUser}
                          onChange={() => {
                            const selectedIndex = selected.indexOf(row.userId);
                            let newSelected = [];
                            if (selectedIndex === -1) {
                              newSelected = [...selected, row.userId];
                            } else {
                              newSelected = selected.filter((name) => name !== row.userId);
                            }
                            setSelected(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {/* <Link href={`/dashboard/user-cohort/${row.userId}`} color="inherit" underline="hover">
                          {row.userId}
                        </Link> */}
                        {row.userId}
                      </TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>
                        <Tooltip title={cohortIds} placement="top">
                          <Typography
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cohortIds}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={row.status}>{row.status || 'ACTIVE'}</StatusChip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton aria-label="Open action menu" onClick={(event) => handleOpenActionMenu(event, row)}>
                          <MoreVertIcon />
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
        <title>Learners | ChipperSage</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Learners
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button
            variant="contained"
            onClick={() => setOpenCreateDialog(true)}
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
            Create Learner
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<Iconify icon="eva:upload-fill" />}
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
            <input type="file" hidden onChange={(e) => handleBulkCreate(e.target.files[0])} />
          </Button>
          <CSVLink data={formatUserDataForExport(users)} filename="users.csv">
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:download-fill" />}
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
              Export Learners
            </Button>
          </CSVLink>
        </Stack>

        {renderTable()}
        {/* CSV Upload Response Section */}
        {isFileUploaded && bulkCreateResponse && (
          <div ref={summaryRef}>
            <CSVUploadResponse response={bulkCreateResponse} onDownload={downloadReport} />
          </div>
        )}
        {renderActionMenu()}

        {/* Create User Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
          <DialogTitle>Create Learner</DialogTitle>
          <DialogContent>
            <TextField
              label="Learner ID"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ marginBottom: '10px' }}
              required
            />
            <TextField
              label="Learner Name"
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ marginBottom: '10px' }}
              required
            />
            <TextField
              label="Learner Email"
              fullWidth
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            {/* <TextField label="Learner Phone Number" fullWidth value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} style={{ marginBottom: '10px' }}  /> */}
            {/* Phone Input */}
            <ReactPhoneInput
              country={'in'}
              enableSearch
              value={`${countryCode}${userPhoneNumber}`}
              onChange={handlePhoneNumberChange}
              inputStyle={{ width: '100%' }}
              style={{ marginBottom: '10px' }}
            />
            {!validatePhoneNumber(userPhoneNumber) && (
              <Typography color="error" variant="caption">
                Please enter a valid phone number.
              </Typography>
            )}
            <TextField
              label="Learner Address"
              fullWidth
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <TextField
              select
              label="Learner Type"
              fullWidth
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{ marginBottom: '10px' }}
              required
            >
              <MenuItem value="Mentor">Mentor</MenuItem>
              <MenuItem value="Learner">Learner</MenuItem>
            </TextField>
            <TextField
              label="Organization ID"
              name="Organization ID"
              fullWidth
              value={organizationId}
              style={{ marginBottom: '10px' }}
              required
              disabled
            />
            <TextField
              select
              label="Cohort ID"
              fullWidth
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              style={{ marginBottom: '10px' }}
              required
            >
              {cohorts.map((cohort) => (
                <MenuItem key={cohort.cohortId} value={cohort.cohortId}>
                  {cohort.cohortName} ({cohort.cohortId})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseCreateDialog}
              color="primary"
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              color="primary"
              disabled={!isFormValid}
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
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update User Dialog */}
        <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog}>
          <DialogTitle>Update Learner</DialogTitle>
          <DialogContent>
            <TextField
              label="Learner ID"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ marginBottom: '10px' }}
              disabled
            />
            <TextField
              label="Learner Name"
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <TextField
              label="Learner Email"
              fullWidth
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <TextField
              label="Learner Phone Number"
              fullWidth
              value={userPhoneNumber}
              onChange={(e) => setUserPhoneNumber(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <TextField
              label="Learner Address"
              fullWidth
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <TextField
              select
              label="Learner Type"
              fullWidth
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{ marginBottom: '10px' }}
            >
              <MenuItem value="Mentor">Mentor</MenuItem>
              <MenuItem value="Learner">Learner</MenuItem>
            </TextField>
            <FormControl fullWidth style={{ marginBottom: '10px' }}>
              <InputLabel>Status</InputLabel>
              <Select value={userStatus} onChange={handleStatusChange} label="Status">
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Deactivation reason field - only shown when status is DISABLED */}
            {userStatus === 'DISABLED' && (
              <TextField
                label="Deactivation Reason"
                fullWidth
                value={deactivatedReason}
                onChange={(e) => setDeactivatedReason(e.target.value)}
                required
                error={userStatus === 'DISABLED' && !deactivatedReason}
                helperText={userStatus === 'DISABLED' && !deactivatedReason ? 'Deactivation reason is required' : ''}
                style={{ marginBottom: '10px' }}
              />
            )}
            {/* <TextField label="Learner Password" fullWidth value={userPassword} onChange={ (e) => setUserPassword(e.target.value)} style={{ marginBottom: '10px' }} /> */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <TextField
                label="Learner Password"
                fullWidth
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                }}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <TextField
              label="Organization ID"
              name="Organization ID"
              fullWidth
              value={organizationId}
              style={{ marginBottom: '10px' }}
              disabled
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseUpdateDialog}
              sx={{
                bgcolor: '#5bc3cd', // Default background color
                color: 'white', // Text color
                fontWeight: 'bold', // Font weight
                '&:hover': {
                  bgcolor: '#DB5788', // Hover background color
                },
                py: 0.5, // Padding Y
                px: 1, // Padding X
                borderRadius: '4px',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={!userName || (userStatus === 'DISABLED' && !deactivatedReason)}
              sx={{
                bgcolor: '#5bc3cd', // Default background color
                color: 'white', // Text color
                fontWeight: 'bold', // Font weight
                '&:hover': {
                  bgcolor: '#DB5788', // Hover background color
                },
                py: 0.5, // Padding Y
                px: 1, // Padding X
                borderRadius: '4px',
              }}
            >
              Update
            </Button>
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
                onClick={() => handleDeleteUser(selectedRow.userId)}
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
              >
                Delete
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsConfirmOpen(false)}
                sx={{
                  bgcolor: '#5bc3cd', // Default background color
                  color: 'white', // Text color
                  fontWeight: 'bold', // Font weight
                  '&:hover': {
                    bgcolor: '#DB5788', // Hover background color
                  },
                  py: 0.5, // Padding Y
                  px: 1, // Padding X
                  borderRadius: '4px',
                }}
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
