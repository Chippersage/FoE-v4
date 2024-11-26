import { styled } from '@mui/material/styles';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { format, formatISO } from 'date-fns';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';



import {
  Card, Table, Stack, Paper, Button, Checkbox, TableRow, Menu, MenuItem, TableBody, TableCell, Container,Typography,
  IconButton, Modal, TableContainer, TablePagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Link} from '@mui/material';

import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

import { createCohort, deleteCohort, getOrgCohorts, updateCohort } from '../api';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cohortName', label: 'Cohort Name', alignRight: false },
  { id: 'cohortId', label: 'cohortId', alignRight: false },
  { id: 'cohortStartDate', label: 'Start Date', alignRight: false },
  { id: 'cohortEndDate', label: 'End Date', alignRight: false },
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

const INITIAL_FORM_STATE = {
  cohortId: '',
  cohortName: '',
  cohortStartDate: '',
  cohortEndDate: '',
  organization: { organizationId: '' }
};


function OrgCohort() {
  const { id: organizationId } = useParams();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('cohortName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [cohorts, setCohorts] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  // Fetch cohorts on component mount
  useEffect(() => {
    if (organizationId) {
      fetchCohorts();
    }
  }, [organizationId]);

  const fetchCohorts = async () => {
    try {
      const data = await getOrgCohorts(organizationId);
      setCohorts(data);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to fetch cohorts', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.cohortName.trim()) errors.cohortName = 'Cohort name is required';
    if (!formData.cohortId.trim()) errors.cohortId = 'Cohort ID is required';
    if (!formData.cohortStartDate) errors.cohortStartDate = 'Start date is required';
    return errors;
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handleCreateClick = () => {
    setIsEditMode(false);
    setFormData({
      ...INITIAL_FORM_STATE,
      organization: { organizationId }
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      try {
        const payload = {
          ...formData,
          cohortStartDate: formData.cohortStartDate ? formatISO(new Date(formData.cohortStartDate)) : null,
          cohortEndDate: formData.cohortEndDate ? formatISO(new Date(formData.cohortEndDate)) : null,
          organization: { organizationId }
        };

        if (isEditMode) {
          await updateCohort(formData.cohortId, payload);
          showNotification('Cohort updated successfully', 'success');
        } else {
          await createCohort(payload);
          showNotification('Cohort created successfully', 'success');
        }
        
        fetchCohorts();
        handleClose();
      } catch (error) {
        const message = error.response?.data?.message || 'Operation failed';
        const details = error.response?.data?.details || '';
        showNotification(`${message}: ${details}`, 'error');
      }
    } else {
      setFormErrors(errors);
      showNotification('Please fix the form errors', 'error');
    }
  };
  
  const handleEdit = (row) => {
    setIsEditMode(true);
    setFormData({
      cohortId: row.cohortId,
      cohortName: row.cohortName,
      cohortStartDate: row.cohortStartDate ? format(new Date(row.cohortStartDate), 'yyyy-MM-dd') : '',
      cohortEndDate: row.cohortEndDate ? format(new Date(row.cohortEndDate), 'yyyy-MM-dd') : '',
      organization: { organizationId },
    });
    setFormErrors({});
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCohort(selectedRow.cohortId);
      showNotification('Cohort deleted successfully');
      fetchCohorts();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete cohort', 'error');
    }
    setIsConfirmOpen(false);
  };

  // Reset form state
  const handleClose = () => {
    setOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
  };
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = cohorts.map((n) => n.cohortName);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (cohortName) => {
    const selectedIndex = selected.indexOf(cohortName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, cohortName);
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

  

  const handleOpenActionMenu = (event, row) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  
  const handleCloseActionMenu = () => setActionAnchorEl(null);

  const filteredCohorts = applySortFilter(cohorts, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredCohorts.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Cohorts | Chippersage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Cohorts
          </Typography>
          <Button variant="contained" onClick={handleCreateClick} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Cohort
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={(e) => setFilterName(e.target.value)} />

          <Scrollbar>
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
          const { cohortId, cohortName, cohortStartDate, cohortEndDate } = row;
          const selectedCohort = selected.indexOf(cohortName) !== -1;

              return (
              <TableRow hover key={row.cohortName} tabIndex={-1} role="checkbox" selected={selectedCohort} >
              <TableCell padding="checkbox">
                <Checkbox checked={selectedCohort} onChange={() => handleClick(cohortName)} />
              </TableCell>
              <TableCell component="th" scope="row" padding="none">
                <Typography variant="subtitle2" noWrap>
                <Link href ={`/admin/dashboard/user-cohort/${cohortId}`} color = "inherit" underline="hover" >
                {cohortName}
              </Link>
              
                </Typography>
              </TableCell>
              <TableCell align="left">{row.cohortId}</TableCell>
              <TableCell>
                            {format(new Date(row.cohortStartDate), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {row.cohortEndDate ? format(new Date(row.cohortEndDate), 'dd/MM/yyyy') : '-'}
                          </TableCell>
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
      </Container>

      {/* New/Edit Cohort Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Cohort' : 'Add New Cohort'}</DialogTitle>
        <DialogContent>
        <TextField
            margin="normal"
            label="CohortId"
            name="cohortId"
            value={formData.cohortId}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.cohortId}
            helperText={formErrors.cohortId}
          />
          <TextField
            margin="normal"
            label="Cohort Name"
            name="cohortName"
            value={formData.cohortName}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.cohortName}
            helperText={formErrors.cohortName}
          />
          <TextField
            margin="normal"
            label="Start Date"
            name="cohortStartDate"
            type="date"
            value={formData.cohortStartDate}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.cohortStartDate}
            helperText={formErrors.cohortStartDate}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            label="End Date"
            name="cohortEndDate"
            type="date"
            value={formData.cohortEndDate}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Organization ID" name="Organization ID" fullWidth value={organizationId} disabled />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseActionMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleEdit(selectedRow); handleCloseActionMenu(); }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setIsConfirmOpen(true); handleCloseActionMenu(); }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Confirm Delete Modal */}
      <Modal open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <StyledCard>
          <Typography variant="h6" gutterBottom>Are you sure you want to delete this cohort?</Typography>
          <Button variant="contained" color="primary" onClick={() => handleDelete(selectedRow.cohortId)}>
            Yes
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setIsConfirmOpen(false)}>
            No
          </Button>
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

export default OrgCohort;
