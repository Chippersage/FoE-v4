/* eslint-disable */
import { styled } from '@mui/material/styles';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { filter } from 'lodash';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { format, formatISO } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
// @mui
import {
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Modal,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import {
  createOrg,
  deleteOrg,
  deleteOrgs,
  getOrgUsers,
  getOrgs,
  updateOrg,
  getPrograms,
  createSubscription,
} from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'organizationId', label: 'ID', alignRight: false },
  { id: 'organizationName', label: 'Name', alignRight: false },
  { id: 'organizationAdminName', label: 'Admin Name', alignRight: false },
  { id: 'organizationAdminPhone', label: 'Phone', alignRight: false },
  { id: 'createdAt', label: 'Date Joined', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true },
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
  // console.log(array);
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_organization) => _organization.organizationName.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orgs, setOrgs] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const navigate = useNavigate();
  // Update the initial form data structure
  const initialFormData = {
    organizationId: '',
    organizationName: '',
    organizationAdminName: '',
    organizationAdminEmail: '',
    organizationAdminPhone: '',
    orgPassword: '',
    deletedAt: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [showOrgPassword, setShowOrgPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subscriptionForm, setSubscriptionForm] = useState({
    program: {
      programId: '',
    },
    organization: {
      organizationId: '',
    },
    maxCohorts: '',
    startDate: '',
    endDate: '',
    transactionId: '',
    transactionType: '',
    transactionDate: '',
    amountPaid: '',
  });
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email); // Validate proper email format
  const [countryCode, setCountryCode] = useState('91'); // For storing country code
  const csvLinkRef = useRef(null);

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, organizationAdminEmail: value }));
  };

  useEffect(() => {
    // Fetch organizations and programs data
    const fetchData = async () => {
      try {
        console.log('Fetching organizations and programs data...');
        const orgsResponse = await getOrgs();
        console.log('Organizations data fetched:', orgsResponse);

        const programsResponse = await getPrograms();
        console.log('Programs data fetched:', programsResponse);

        setOrganizations(orgsResponse);
        setPrograms(programsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const openSubscriptionDialog = () => {
    setSubscriptionForm({ organizationId: '', programId: '', maxCohorts: '' });
    setIsSubscriptionDialogOpen(true);
  };

  const closeSubscriptionDialog = () => {
    setIsSubscriptionDialogOpen(false);
  };

  const handleSubscriptionFormChange = (event) => {
    const { name, value } = event.target;

    if (name === 'organizationId') {
      setSubscriptionForm((prev) => ({
        ...prev,
        organization: {
          ...prev.organization,
          organizationId: value,
        },
      }));
    } else if (name === 'programId') {
      setSubscriptionForm((prev) => ({
        ...prev,
        program: {
          ...prev.program,
          programId: value,
        },
      }));
    } else {
      setSubscriptionForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const response = await createSubscription(subscriptionForm); // Replace with actual API call
      if (response.status === 201) {
        alert('Subscription created successfully!');
        closeSubscriptionDialog();
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.organizationAdminName.trim()) {
      errors.organizationAdminName = 'Organization AdminName is required';
    }
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.length < 4) {
      errors.organizationName = 'Organization name must be at least 4 characters';
    }
    if (!formData.organizationAdminEmail) {
      errors.organizationAdminEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.organizationAdminEmail)) {
      errors.organizationAdminEmail = 'Please enter a valid email address';
    }
    // Phone validation
    if (!formData.organizationAdminPhone) {
      errors.organizationAdminPhone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.organizationAdminPhone)) {
      errors.organizationAdminPhone = 'Phone number must be 10 digits';
    }
    // Additional validations if needed
    return errors;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setCountryCode('91');
  };

  // Enhanced Create Dialog handlers
  const openCreateDialog = () => {
    resetForm(); // Reset to initial state when opening create dialog
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    resetForm(); // Reset form when closing
    setIsCreateDialogOpen(false);
  };

  // Open Update Dialog
  const openUpdateDialog = (organization) => {
    console.log('Organization to update:', organization); // Debugging
    if (!organization) return;

    const phoneWithCode = organization.organizationAdminPhone || '';
    const countryCode = phoneWithCode.substring(0, 2); // Assuming country code is 2 digits

    setFormData({
      organizationId: organization.organizationId || '',
      organizationName: organization.organizationName || '',
      organizationAdminName: organization.organizationAdminName || '',
      organizationAdminEmail: organization.organizationAdminEmail || '',
      organizationAdminPhone: organization.organizationAdminPhone || '',
      orgPassword: organization.orgPassword || '',
    });

    setCountryCode(countryCode || '91'); // Default to '91' for India
    setSelectedOrganization(organization);
    setIsUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    resetForm();
    setSelectedOrganization(null);
    setIsUpdateDialogOpen(false);
  };

  // Enhanced form change handler with validation
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enhanced phone change handler
  const handlePhoneChange = (value, data) => {
    const rawPhone = value.replace(/[^0-9]/g, '');
    const strippedPhone = rawPhone.slice(data.dialCode.length);
    setCountryCode(data.dialCode);
    setFormData((prev) => ({
      ...prev,
      organizationAdminPhone: strippedPhone,
    }));

    // Clear phone error when being edited
    if (formErrors.organizationAdminPhone) {
      setFormErrors((prev) => ({
        ...prev,
        organizationAdminPhone: '',
      }));
    }
  };

  // Enhanced submit handlers with validation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const response = await createOrg(JSON.stringify(formData));
        setLoading(false);
        if (response.status === 201) {
          setOrgs(await getOrgs());
          closeCreateDialog();
          setSuccessMessage('Organization created successfully!');
          setTimeout(() => setSuccessMessage(''), 3000); // Show success message for 3 seconds
        } else if (response.status === 400) {
          setFormErrors((prev) => ({
            ...prev,
            organizationAdminEmail: response.data.message || 'Email already exists',
          }));
        }
      } catch (error) {
        console.error('Error creating organization:', error);
        setLoading(false);
        setErrorMessage('Failed to create organization. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000); // Show error message for 3 seconds
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const response = await updateOrg(formData.organizationId, formData);
        setLoading(false);
        if (response.status === 200) {
          // Check for successful update response (status 200)
          setOrgs(await getOrgs()); // Reload the organization list
          closeUpdateDialog(); // Close the update dialog
          setSuccessMessage('Organization updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000); // Show success message for 3 seconds
        } else if (response.status === 400) {
          // Handle error response (e.g., organization not found)
          setErrorMessage('Failed to update organization. Organization not found.');
          setTimeout(() => setErrorMessage(''), 3000); // Show error message for 3 seconds
        }
      } catch (error) {
        console.error('Error updating organization:', error);
        setErrorMessage('Failed to update organization. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000); // Show error message for 3 seconds
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleDelete = async () => {
    try {
      const { organizationId } = selectedRow;
      const response = await deleteOrg(organizationId);

      if (response) {
        // Reload the organization list after successful deletion
        const orgs = await getOrgs();
        setOrgs(orgs);

        // Show success message
        setSuccessMessage('Organization deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000); // Show success message for 3 seconds

        // Close the delete dialog
        closeDeleteDialog();
      } else {
        // Handle failure (if no response is returned or deletion failed)
        setErrorMessage('Failed to delete organization. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000); // Show error message for 3 seconds
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      setErrorMessage('Failed to delete organization. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000); // Show error message for 3 seconds
    }
  };

  const handleSelectedDelete = async () => {
    try {
      const ids = selectedRow;
      await deleteOrgs();
      getOrgs(selectedRow).then((res) => {
        // console.log(res);
        setOrgs(res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      handleCloseMenu();
      const orgId = selectedRow?.organizationId;
      if (!orgId) {
        console.error('No organization selected. Please select an organization to export.');
        return;
      }

      console.log('Fetching users for Organization ID:', orgId);
      const data = await getOrgUsers(orgId);

      if (data && Array.isArray(data)) {
        const formattedData = formatUserDataForExport(data); // Format the user data
        const csvContent = convertToCSV(formattedData); // Convert to CSV
        downloadCSV(csvContent, `users_${orgId}.csv`);
        setCsvData(formattedData); // Set the formatted data for export
        setIsDataReady(true);
      } else {
        console.error('Error fetching users for export:', data);
      }
    } catch (error) {
      console.error('Error in handleExport:', error);
    }
  };
  // Convert JSON data to CSV
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return headers + rows;
  };
  // Trigger CSV download
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const formatUserDataForExport = (users) => {
    return users.map((user) => ({
      userId: user.userId || '',
      userName: user.userName || '',
      userPhoneNumber: user.userPhoneNumber || '',
      userAddress: user.userAddress || '',
      userType: user.userType || '',
      userEmail: user.userEmail || '',
      organizationId: user.organization?.organizationId || '',
      cohortId: user.cohort?.cohortId || '',
      cohortName: user.cohort?.cohortName || '',
      programId: user.program?.programId || '',
      programName: user.program?.programName || '',
    }));
  };

  useEffect(() => {
    // Fetch organization details on component mount
    getOrgs().then((res) => {
      // console.log(res);
      setOrgs(res);
    });
  }, []);

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Select all rows
      const newSelected = orgs.map((org) => org.organizationId);
      setSelected(newSelected);
    } else {
      // Deselect all rows
      setSelected([]);
    }
  };

  const handleClick = (event, organizationId) => {
    const selectedIndex = selected.indexOf(organizationId);
    let newSelected = [];

    if (selectedIndex === -1) {
      // Add the row to the selection
      newSelected = newSelected.concat(selected, organizationId);
    } else if (selectedIndex === 0) {
      // Remove the first selected row
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      // Remove the last selected row
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      // Remove a middle row
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  // Helper function to check if a row is selected
  const isRowSelected = (organizationId) => selected.indexOf(organizationId) !== -1;

  // Helper function to check if all rows are selected
  const isAllSelected = selected.length === orgs.length;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orgs.length) : 0;
  const filteredUsers = applySortFilter(orgs, getComparator(order, orderBy), filterName).sort((a, b) =>
    a.deletedAt && !b.deletedAt ? 1 : !a.deletedAt && b.deletedAt ? -1 : 0
  );
  const isNotFound = !filteredUsers.length && !!filterName;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      <Helmet>
        <title> Organization | ChipperSage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Organizations
          </Typography>
        </Stack>

        {/* <div style={{ padding: '20px' }}> */}
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button
            variant="contained"
            onClick={openCreateDialog}
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
              alignSelf: 'flex-start',
            }}
          >
            New Organization
          </Button>
          <Button
            variant="contained"
            onClick={openSubscriptionDialog}
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
              alignSelf: 'flex-start',
            }}
          >
            Assign Program-Org
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            deleteOrgs={deleteOrgs}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orgs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      organizationId,
                      organizationName,
                      organizationAdminName,
                      organizationAdminPhone,
                      createdAt,
                      deletedAt,
                    } = row;
                    const isRowChecked = isRowSelected(organizationId);

                    const isDeleted = !!deletedAt; // Check if the organization is deleted

                    return (
                      <TableRow
                        hover={!isDeleted} // Disable hover effect if deleted
                        key={organizationId}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isRowChecked}
                        style={{
                          backgroundColor: isDeleted ? '#f5f5f5' : 'inherit', // Gray background for deleted rows
                          pointerEvents: isDeleted ? 'none' : 'auto', // Disable interactions
                          opacity: isDeleted ? 0.5 : 1, // Dim deleted rows
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isRowChecked}
                            onChange={(event) => handleClick(event, organizationId)}
                            disabled={isDeleted} // Disable checkbox if deleted
                          />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {isDeleted ? (
                                <span>{organizationId}</span> // Display plain text for deleted organizations
                              ) : (
                                <Link href={`/org-dashboard/${organizationId}/app`} color="inherit" underline="hover">
                                  {organizationId}
                                </Link>
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{organizationName}</TableCell>
                        <TableCell align="left">{organizationAdminName}</TableCell>
                        <TableCell align="left">{organizationAdminPhone}</TableCell>
                        <TableCell align="left">
                          {createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {!isDeleted && (
                            <IconButton size="large" color="inherit" onClick={(event) => handleOpenMenu(event, row)}>
                              <Iconify icon={'eva:more-vertical-fill'} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                          <>
                            {successMessage && (
                              <Typography variant="body1" color="success">
                                {successMessage}
                              </Typography>
                            )}
                            {errorMessage && (
                              <Typography variant="body1" color="error">
                                {errorMessage}
                              </Typography>
                            )}
                            <Container>{/* Rest of your component */}</Container>
                          </>
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
            count={orgs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        {/* </div> */}
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={() => openUpdateDialog(selectedRow)}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(
              `/org-dashboard/${selectedRow.organizationId}/cohorts/organization/${selectedRow.organizationId}`,
              { replace: true }
            );
          }}
        >
          <Iconify icon={'eva:people-outline'} sx={{ mr: 2 }} />
          Cohorts
        </MenuItem>
        <MenuItem onClick={() => handleExport(selectedRow)}>
          <Iconify icon={'eva:cloud-download-outline'} sx={{ mr: 2 }} />
          Export Users
        </MenuItem>
        {isDataReady && (
          <CSVLink
            ref={csvLinkRef}
            data={csvData}
            filename={`users_${selectedRow.organizationId}.csv`} // Unique filename based on organization ID
            onClick={() => setIsDataReady(false)} // Reset after download
            style={{ display: 'none' }} // Hide the link in the UI
          >
            Download CSV
          </CSVLink>
        )}

        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setIsConfirmOpen(true);
            handleCloseMenu();
          }}
        >
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* Create Organizations Dialog */}
      {isCreateDialogOpen && (
        <Dialog
          open={isCreateDialogOpen}
          onClose={closeCreateDialog}
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: 'sm', // Reduces overall dialog width
              '& .MuiDialogContent-root': { pt: 2 },
            }, // Adds space after title
          }}
        >
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            {/* Display Spinner when loading */}
            {loading && (
              <div className="spinner" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Creating Organization...
              </div>
            )}

            {/* Hide form when loading */}
            {!loading && (
              <div className="flex flex-col gap-6 pt-2">
                <TextField
                  name="organizationName"
                  label="Organization Name"
                  value={formData.organizationName}
                  onChange={handleFormChange}
                  variant="outlined"
                  error={!!formErrors.organizationName}
                  helperText={formErrors.organizationName}
                  fullWidth
                  required
                  size="small" // Reduces the height of text fields
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '45px', // Consistent height for all text fields
                    },
                  }}
                />
                <TextField
                  name="organizationAdminName"
                  label="Admin Name"
                  value={formData.organizationAdminName}
                  onChange={handleFormChange}
                  variant="outlined"
                  error={!!formErrors.organizationAdminName}
                  helperText={formErrors.organizationAdminName}
                  fullWidth
                  required
                  size="small" // Reduces the height of text fields
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '45px', // Consistent height for all text fields
                    },
                  }}
                />
                <div className="flex flex-col">
                  <ReactPhoneInput
                    country={'in'}
                    enableSearch
                    value={`${countryCode}${formData.organizationAdminPhone}`}
                    onChange={handlePhoneChange}
                    inputStyle={{ width: '100%', height: '45px' }}
                  />
                  {formErrors.organizationAdminPhone && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                      {formErrors.organizationAdminPhone}
                    </Typography>
                  )}
                </div>
                <TextField
                  name="organizationAdminEmail"
                  label="Admin Email"
                  value={formData.organizationAdminEmail}
                  onChange={handleFormChange}
                  variant="outlined"
                  error={!!formErrors.organizationAdminEmail}
                  helperText={formErrors.organizationAdminEmail}
                  fullWidth
                  size="small" // Reduces the height of text fields
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '45px', // Consistent height for all text fields
                    },
                  }}
                  required
                />
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            {!loading && (
              <>
                <Button
                  onClick={closeCreateDialog}
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
                  onClick={handleCreateSubmit}
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
              </>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Update Organizations Dialog */}
      {isUpdateDialogOpen && (
        <Dialog
          open={isUpdateDialogOpen}
          onClose={closeUpdateDialog}
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: 'sm', // Reduces overall dialog width
              '& .MuiDialogContent-root': { pt: 2 },
            }, // Adds space after title
          }}
        >
          <DialogTitle>Update Organization</DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            <div className="flex flex-col gap-6 pt-2">
              <TextField
                name="organizationId"
                label="Organization ID"
                value={formData.organizationId}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                required
                disabled
                size="small" // Reduces the height of text fields
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '45px', // Consistent height for all text fields
                  },
                }}
              />
              <TextField
                name="organizationName"
                label="Organization Name"
                value={formData.organizationName}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                required
                size="small" // Reduces the height of text fields
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '45px', // Consistent height for all text fields
                  },
                }}
              />
              <TextField
                name="organizationAdminName"
                label="Admin Name"
                value={formData.organizationAdminName}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                required
                size="small" // Reduces the height of text fields
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '45px', // Consistent height for all text fields
                  },
                }}
              />
              <ReactPhoneInput
                country={'in'}
                enableSearch
                value={`${countryCode}${formData.organizationAdminPhone}`}
                onChange={handlePhoneChange}
                inputStyle={{ width: '100%' }}
                style={{ marginBottom: '10px' }}
              />
              {formErrors.organizationAdminPhone && (
                <Typography color="error" variant="caption">
                  {formErrors.organizationAdminPhone}
                </Typography>
              )}
              <TextField
                name="organizationAdminEmail"
                label="Admin Email"
                value={formData.organizationAdminEmail}
                onChange={handleFormChange}
                variant="outlined"
                fullWidth
                style={{ marginBottom: '10px' }}
                required
                disabled
                size="small" // Reduces the height of text fields
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '45px', // Consistent height for all text fields
                  },
                }}
              />
              {/* <div style={{ position: 'relative', marginBottom: '10px' }}>
  <TextField
    name="orgPassword"
    label="Password"
    value={formData.orgPassword}
    onChange={handleFormChange}
    variant="outlined"
    error={!!formErrors.orgPassword}
    helperText={formErrors.orgPassword}
    fullWidth
    required
    type={showOrgPassword ? "text" : "password"}
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
    onClick={() => setShowOrgPassword(!showOrgPassword)}
    aria-label={showOrgPassword ? "Hide password" : "Show password"}
  >
    {showOrgPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div> */}

              {/* <TextField
name="created at"
label="Created At"
type="date"
InputLabelProps={{ shrink: true }}
value={formData.createdAt ? formData.createdAt.slice(0, 19) : ''}
onChange={handleFormChange}
variant="outlined"
fullWidth
required
size="small" // Reduces the height of text fields
          sx={{ 
            '& .MuiOutlinedInput-root': {
              height: '45px' // Consistent height for all text fields
            }
          }}
/>
<TextField
name="updatedAt"
label="Updated At"
type="date"
InputLabelProps={{ shrink: true }}
value={formData.updatedAt }
onChange={handleFormChange}
variant="outlined"
fullWidth
required
size="small" // Reduces the height of text fields
          sx={{ 
            '& .MuiOutlinedInput-root': {
              height: '45px' // Consistent height for all text fields
            }
          }}
/>
<TextField
name="deleted At"
label="Deleted At"
type="date"
InputLabelProps={{ shrink: true }}
value={formData.deletedAt ? formData.deletedAt.slice(0, 19) : ''}
onChange={handleFormChange}
variant="outlined"
error={!!formErrors.deletedAt}
helperText={formErrors.deletedAt}
fullWidth
required
size="small" // Reduces the height of text fields
          sx={{ 
            '& .MuiOutlinedInput-root': {
              height: '45px' // Consistent height for all text fields
            }
          }}
/> */}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeUpdateDialog}
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
              onClick={handleUpdateSubmit}
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
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onClose={closeSubscriptionDialog}>
        <DialogTitle>Create Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Organization</InputLabel>
            <Select
              name="organizationId"
              value={subscriptionForm.organization?.organizationId || ''}
              onChange={handleSubscriptionFormChange}
            >
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <MenuItem key={org.organizationId} value={org.organizationId}>
                    {org.organizationName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No organizations available</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Program</InputLabel>
            <Select
              name="programId"
              value={subscriptionForm.program?.programId || ''}
              onChange={handleSubscriptionFormChange}
            >
              {programs.length > 0 ? (
                programs.map((program) => (
                  <MenuItem key={program.programId} value={program.programId}>
                    {program.programName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No programs available</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Start Date"
            type="date"
            name="Start Date"
            InputLabelProps={{ shrink: true }}
            value={subscriptionForm.startDate}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="End Date"
            type="date"
            name="EndDate"
            InputLabelProps={{ shrink: true }}
            value={subscriptionForm.endDate}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Max Cohorts"
            name="maxCohorts"
            value={subscriptionForm.maxCohorts}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Transaction Id"
            name="Transaction Id"
            value={subscriptionForm.transactionId}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Transaction Type"
            name="Transaction Type"
            value={subscriptionForm.transactionType}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Transaction Date"
            type="date"
            name="Transaction Date"
            InputLabelProps={{ shrink: true }}
            value={subscriptionForm.transactionDate}
            onChange={handleSubscriptionFormChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Amount Paid"
            name="Amount Paid"
            value={subscriptionForm.amountPaid}
            onChange={handleSubscriptionFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSubscriptionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateSubscription} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete Organization?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the organization {selectedRow?.organizationId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
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
              borderRadius: '4px', // Border radius
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete();
              setIsConfirmOpen(false);
            }}
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
            {' '}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
/* eslint-enable */
