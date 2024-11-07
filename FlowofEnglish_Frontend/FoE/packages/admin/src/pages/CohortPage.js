import { styled } from '@mui/material/styles';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import {Card, Table, Stack, Paper, Avatar,  Button, Popover, Checkbox, TableRow, MenuItem, TableBody, TableCell, Container,
  Typography,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody, TableCell,
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
import { createCohort, deleteCohort, getOrgCohorts, updateCohort } from '../api';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'level', label: 'CohortName', alignRight: false },
  { id: 'organization', label: 'Organization', alignRight: false },
  { id: 'cohortStartDate', label: 'Created Date', alignRight: false },
  { id: 'cohortEndDate', label: 'End Date', alignRight: false}

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
    return filter(array, (_cohort) => _cohort.cohort.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function CohortPage() {
  const { organizationId } = useParams();

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('cohort');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [cohorts, setCohorts] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    cohortName: '',
    cohortStartDate: '',
    cohortEndDate: '',
    organization: { organizationId },
  });
  

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.cohortName.trim()) {
      errors.cohortName = 'Cohort name is required';
    }
    return errors;
  };
  

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsEditMode(false);
    setFormData({ id: '', cohort: '', cohortEndDate: '', organization: { organizationId } });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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
        handleClose();
  
        const res = await getOrgCohorts(organizationId);
        setCohorts(res);
      } catch (error) {
        console.error("Error creating/updating cohort:", error.response?.data || error.message);
      }
    } else {
      setFormErrors(errors);
    }
  };
  

const handleDelete = async () => {
  try {
    await deleteCohort(selectedRow.id);
    getOrgCohorts(organizationId).then((res) => {
      setCohorts(res);
    });
  } catch (error) {
    console.error(error);
  }
};

  const handleEdit = () => {
    setIsEditMode(true);
    setIsOpen(true);
    setFormData({
        id: selectedRow.cohortId,
        cohortName: selectedRow.cohortName,
        organization: selectedRow.organization,
    });
};

useEffect(() => {
  getOrgCohorts(organizationId).then((res) => {
    console.log("Fetched cohorts:", res); // Check if cohorts data is being retrieved
    setCohorts(res);
  }).catch(error => console.error("Error fetching cohorts:", error));
}, [organizationId]);


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
      const newSelecteds = cohorts.map((c) => c.cohort);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - cohorts.length) : 0;

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
          <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Cohort
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

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
                    const { id, cohort, cohortStartDate } = row;
                    const selectedCohort = selected.indexOf(cohort) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedCohort}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedCohort} onChange={(event) => handleClick(event, cohort)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {cohort}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{row.organization.organizationId}</TableCell>

                        <TableCell align="left">{cohortStartDate}</TableCell>

                        {/*  <TableCell align="left">{role}</TableCell> */}

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
            count={cohorts.length}
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
            <h2>{isEditMode ? 'Edit Cohort' : 'Add Cohort'}</h2>
            <form noValidate>
            
              <TextField
                name="cohort"
                label="Cohort Name"
                value={formData.cohortName}
                onChange={handleFormChange}
                variant="outlined"
                error={!!formErrors.cohort}
                helperText={formErrors.cohort}
                fullWidth
              />
              <TextField
              name="cohortId"
              label="Cohort ID"
              value={formData.cohortId}
              onChange={handleFormChange}
              variant="outlined"
              error={!!formErrors.cohortId}
              helperText={formErrors.cohortId}
              fullWidth
              />
              <TextField
              name="OrganizationId"
              label="Organization ID"
              value={formData.OrganizationId}
              onChange={handleFormChange}
              variant="outlined"
              error={!!formErrors.OrganizationId}
              helperText={formErrors.OrganizationId}
              fullWidth
              />
              <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                {isEditMode ? 'Save' : 'Add'}
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
        <DialogTitle id="alert-dialog-title">{'Delete cohort?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the cohort {selectedRow?.cohort}?
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
