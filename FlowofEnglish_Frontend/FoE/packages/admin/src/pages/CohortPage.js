import { styled } from '@mui/material/styles';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import {
  Card, Table, Stack, Paper, Button, Popover, Checkbox, TableRow, Menu, MenuItem, TableBody, TableCell, Container,
  Typography, IconButton, Modal, TableContainer, TablePagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { createCohort, deleteCohort, getOrgCohorts, updateCohort } from '../api';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cohortName', label: 'Cohort Name', alignRight: false },
  { id: 'organizationName', label: 'Organization Name', alignRight: false },
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


function CohortPage() {
  const { organizationId } = useParams();
  const [open, setOpen] = useState(null);
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

  const [formData, setFormData] = useState({
    cohortId: '',
    cohortName: '',
    cohortStartDate: '',
    cohortEndDate: '',
    organization: { organizationId },
  });
  const [formErrors, setFormErrors] = useState({});
  
  const validateForm = () => {
    const errors = {};
    if (!formData.cohortName.trim()) errors.cohortName = 'Cohort name is required';
    if (!formData.cohortId.trim()) errors.cohortId = 'Cohort Id is Required';
    if (!formData.organizationId.trim()) errors.organizationId = 'OrganizationId is Required';
    return errors;
  };

  useEffect(() => {
    fetchCohorts();
  }, [organizationId]);

  const fetchCohorts = async () => {
    try {
      const res = await getOrgCohorts(organizationId);
      setCohorts(res);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch cohorts';
      setErrorMsg(message);
    }
  };
  
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        if (isEditMode) {
          await updateCohort(formData.cohortId, formData);
        } else {
          await createCohort(formData);
        }
        fetchCohorts();
        handleClose();
      } catch (error) {
        console.error("Error creating/updating cohort:", error);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleEdit = (row) => {
    setIsEditMode(true);
    setFormData({
      cohortId: row.cohortId,
      cohortName: row.cohortName,
      cohortStartDate: row.cohortStartDate,
      cohortEndDate: row.cohortEndDate,
      organization: row.organization,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCohort(id);
      fetchCohorts();
    } catch (error) {
      console.error("Error deleting cohort:", error);
    }
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

  const handleClose = () => setOpen(false);

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
          <Button variant="contained" onClick={() => setOpen(true)} startIcon={<Iconify icon="eva:plus-fill" />}>
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
                    const { cohortName, organizationName, cohortStartDate, cohortEndDate } = row;
                    const selectedCohort = selected.indexOf(cohortName) !== -1;

                    return (
                      <TableRow hover key={row.cohortName} tabIndex={-1} role="checkbox" selected={selectedCohort}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedCohort} onChange={() => handleClick(cohortName)} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Typography variant="subtitle2" noWrap>
                            {cohortName}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{row.organization.organizationName}</TableCell>
                        <TableCell align="left">{cohortStartDate}</TableCell>
                        <TableCell align="left">{cohortEndDate}</TableCell>
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
          <TextField
            margin="normal"
            label="OrganizationId"
            name="organizationId"
            value={formData.organizationId}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.organizationId}
            helperText={formErrors.organizationId}
          />
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
    </>
  );
}

export default CohortPage;
