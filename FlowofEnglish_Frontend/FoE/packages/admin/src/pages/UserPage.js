/* eslint-disable */
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { filter } from 'lodash';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Avatar,
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
  Typography
} from '@mui/material';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import { createOrg, deleteOrg, deleteOrgs, exportUsers, getOrgs, updateOrg } from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'organizationName', label: 'Name', alignRight: false },
  { id: 'createdAt', label: 'Joined Date', alignRight: false },
  { id: '' },
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
    return filter(array, (_user) => _user.organisation_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const initialFormData = {
    organizationId: '',  
    organizationName: '',
    organizationAdminName: '',
    organizationAdminEmail: '',
    organizationAdminPhone: '',
    orgpassword: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: '',
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.organizationAdminName.trim()) {
      errors.organizationAdminName = 'Organization AdminName is required';  
    }
    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required';
    }
    if (!formData.organizationAdminEmail.trim()) {
      errors.organizationAdminEmail = 'Admin email is required';
    }
    // Additional validations if needed
    return errors;
  };
  
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsEditMode(false);
    setSelectedRow(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const initializeForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    const errors = validateForm();
    setFormErrors((prev) => errors);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      if (isEditMode) {
        try {
          await updateOrg(formData.id, {
            organizationId: formData.organizationId,
            organizationName: formData.organizationName,
            organizationAdminName: formData.organizationAdminName,
            organizationAdminEmail: formData.organizationAdminEmail,
            organizationAdminPhone: formData.organizationAdminPhone,
            orgpassword: formData.orgpassword,
          });
          handleClose();
          setSuccessMessage("Organization updated successfully");
          getOrgs().then((res) => {
            setOrgs(res);
            initializeForm();
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const response = await createOrg({
            organizationId: formData.organizationId,
            organizationName: formData.organizationName,
            organizationAdminName: formData.organizationAdminName,
            organizationAdminEmail: formData.organizationAdminEmail,
            organizationAdminPhone: formData.organizationAdminPhone,
            orgpassword: formData.orgpassword,
          });
          if (response.status === 200) {
            setSuccessMessage("Organization created successfully");
          } else if (response.status === 409) {
            setErrorMessage("Email already exists");
          }
          handleClose();
          getOrgs().then((res) => {
            setOrgs(res);
            initializeForm();
          });
        } catch (error) {
          console.error(error);
          setErrorMessage("An error occurred while creating the organization");
        }
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleDelete = async () => {
    try {
      const { id } = selectedRow;
      await deleteOrg(id);
      getOrgs().then((res) => {
        // console.log(res);
        setOrgs(res);
      });
    } catch (error) {
      console.error(error);
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
        console.error("No organization selected. Please select an organization to export.");
        return;
      }
      console.log("Organization ID:", orgId);
      const data = await exportUsers(orgId);
  
      if (data && Array.isArray(data)) {
        setCsvData(data);
        setIsDataReady(true);
      } else {
        console.error("Export response error:", data);
      }
    } catch (error) {
      console.error("Error in handleExport:", error);
    }
  };
  
  
  const handleEdit = () => {
    handleCloseMenu();
    setIsEditMode(true);
    setIsOpen(true);
    setFormData({
      id: selectedRow.id,
      organizationName: selectedRow.organizationName,
      organizationAdminName: selectedRow.organizationAdminName,
      organizationAdminEmail: selectedRow.organizationAdminEmail,
      organizationAdminPhone: selectedRow.organizationAdminPhone,
      orgpassword: selectedRow.orgpassword, // Ensure this is handled correctly if needed
      createdAt: selectedRow.createdAt,
      updatedAt: selectedRow.updated_at,
      deletedAt: selectedRow.deleted_at,
    });
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
      const newSelecteds = orgs.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

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
  const filteredUsers = applySortFilter(orgs, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && !!filterName;
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <>
      <Helmet>
        <title> Organisation | Chippersage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Organisations
          </Typography>
          <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Organisation
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
                    const { organizationId, organizationName, createdAt, avatarUrl } = row;
                    const selectedUser = selected.indexOf(organizationName) !== -1;

                    return (
                      <TableRow hover key={organizationId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUser}
                            onChange={(event) => handleClick(event, organizationName)}
                          />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={organizationName} src={avatarUrl} />
                            <Typography variant="subtitle2" noWrap>
                              <Link href={`/admin/org-dashboard/${organizationId}/app`} color="inherit" underline="hover">
                                {organizationName}
                              </Link>
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{createdAt}</TableCell>
                        {/* <TableCell align="left">{company}</TableCell>

                        <TableCell align="left">{role}</TableCell> */}

                        {/* <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell> */}

                        {/* <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label>
                        </TableCell> */}

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(event) => handleOpenMenu(event, row)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
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
                            <Container>
                              {/* Rest of your component */}
                            </Container>
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
        <MenuItem onClick={handleEdit}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/dashboard/cohorts/organization/${selectedRow.organizationId}`, { replace: true });
          }}
        >
          <Iconify icon={'eva:people-outline'} sx={{ mr: 2 }} />
          Cohorts
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <Iconify icon={'eva:cloud-download-outline'} sx={{ mr: 2 }} />
          Export Users
        </MenuItem>
        {/* Conditionally render CSVLink after data is fetched */}
      {isDataReady && (
        <CSVLink
          data={csvData}
          filename={`users_${selectedRow.organizationName}.csv`} // Unique filename based on organization ID
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

            <Modal open={isOpen} onClose={handleClose}>
            <StyledCard>
            <div>
            <h2>{isEditMode ? 'Edit Organisation' : 'Add Organisation'}</h2>
            <form noValidate>
            {/* New field for organizationId */}
            <TextField
            name="organizationName"
            label="Organization Name"
            value={formData.organizationName}
            onChange={handleFormChange}
            variant="outlined"
            error={!!formErrors.organizationName}
            helperText={formErrors.organizationName}
            fullWidth
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
            />
            <TextField
            name="organizationAdminPhone"
            label="Admin Phone"
            value={formData.organizationAdminPhone}
            onChange={handleFormChange}
            variant="outlined"
            fullWidth
            />
            <TextField
            name="organizationAdminEmail"
            label="Admin Email"
            value={formData.organizationAdminEmail}
            onChange={handleFormChange}
            variant="outlined"
            error={!!formErrors.organizationAdminEmail}
            helperText={formErrors.organizationAdminEmail}
            fullWidth
            style={{ marginBottom: '1rem' }}
            />
            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
            {isEditMode ? 'Update Organisation' : 'Add Organisation'}
            </Button>
            </form>
            </div>
            </StyledCard>
            </Modal>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete Organization?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the organization {selectedRow?.organizationName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDelete();
              setIsConfirmOpen(false);
            }}
            autoFocus
            sx={{ color: 'error.main' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
/* eslint-enable */
