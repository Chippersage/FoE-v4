/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';

import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
import { getPrograms, createProgram, updateProgram, deleteProgram, deletePrograms } from '../api';

// ----------------------------------------------------------------------
const StyledFormRow = styled('div')({
  display: 'flex',
  gap: '16px',
  marginTop: '16px', // Add margin-top between fields
});
const TABLE_HEAD = [
  { id: 'Program_name', label: 'Name', alignRight: false },
  { id: 'levels', label: 'Levels', alignRight: false },
  { id: 'created_at', label: 'Created Date', alignRight: false },
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
    return filter(array, (_user) => _user.Program_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ProgramPage() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [Programs, setPrograms] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const initialFormData = {
    id: '',
    Program_name: '',
    lesson_interval: {},
    quiz_reminder: {},
    created_at: '',
    updated_at: '',
    deleted_at: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const initialFormErrors = { lesson_interval: {}, quiz_reminder: {} };
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const validateForm = () => {
    const errors = { lesson_interval: {}, quiz_reminder: {} };
    if (!formData.Program_name.trim()) {
      errors.Program_name = 'Program name is required';
    }
    if (!formData.lesson_interval?.days && formData.lesson_interval?.days !== 0) {
      errors.lesson_interval.days = 'Please select day';
    }
    if (!formData.lesson_interval?.hours && formData.lesson_interval?.hours !== 0) {
      errors.lesson_interval.hours = 'Please select hours';
    }
    if (!formData.lesson_interval?.minutes && formData.lesson_interval?.minutes !== 0) {
      errors.lesson_interval.minutes = 'Please select minutes';
    }
    if (!formData.quiz_reminder?.days && formData.quiz_reminder?.days !== 0) {
      errors.quiz_reminder.days = 'Please select day';
    }
    if (!formData.quiz_reminder?.hours && formData.quiz_reminder?.hours !== 0) {
      errors.quiz_reminder.hours = 'Please select hours';
    }
    if (!formData.quiz_reminder?.minutes && formData.quiz_reminder?.minutes !== 0) {
      errors.quiz_reminder.minutes = 'Please select minutes';
    }
    return errors;
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setFormData(initialFormData);
    setFormErrors(initialFormErrors);
    setIsOpen(true);
    setIsEditMode(false);
    setSelectedRow(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('lesson_interval')) {
      const updatedLessonInterval = formData.lesson_interval;
      const intervalField = name.match(/\.(.+)/)[1];
      updatedLessonInterval[intervalField] = value;
      setFormData((prevFormData) => ({ ...prevFormData, lesson_interval: updatedLessonInterval }));
    } else if (name.startsWith('quiz_reminder')) {
      const updatedQuizReminder = formData.quiz_reminder;
      const quizReminderField = name.match(/\.(.+)/)[1];
      updatedQuizReminder[quizReminderField] = value;
      setFormData((prevFormData) => ({ ...prevFormData, quiz_reminder: updatedQuizReminder }));
    } else {
      setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (
      Object.keys(errors).length === 2 &&
      Object.keys(errors.lesson_interval).length === 0 &&
      Object.keys(errors.quiz_reminder).length === 0
    ) {
      if (isEditMode) {
        try {
          await updateProgram(formData.id, formData);
          handleClose();
          getPrograms().then((res) => {
            // console.log(res);
            setPrograms(res);
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await createProgram(formData);
          handleClose();
          getPrograms().then((res) => {
            // console.log(res);
            setPrograms(res);
          });
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleDelete = async () => {
    try {
      const { id } = selectedRow;
      await deleteProgram(id);
      getPrograms().then((res) => {
        // console.log(res);
        setPrograms(res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectedDelete = async () => {
    try {
      const ids = selectedRow;
      await deletePrograms();
      getPrograms(selectedRow).then((res) => {
        // console.log(res);
        setPrograms(res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = () => {
    handleCloseMenu();
    setIsEditMode(true);
    setIsOpen(true);
    setFormData({
      id: selectedRow.id,
      Program_name: selectedRow.Program_name,
      lesson_interval: selectedRow.lesson_interval,
      quiz_reminder: selectedRow.quiz_reminder,
      created_at: selectedRow.created_at,
      updated_at: selectedRow.updated_at,
      deleted_at: selectedRow.deleted_at,
    });
  };

  useEffect(() => {
    // Fetch Program_name details on component mount
    getPrograms().then((res) => {
      // console.log(res);
      setPrograms(res);
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
      const newSelecteds = Programs.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - Programs.length) : 0;

  const filteredUsers = applySortFilter(Programs, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Programs | Chipper Sage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            All Programs
          </Typography>
          <Button id="new_Program" variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Program
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            deletePrograms={deletePrograms}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={Programs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, Program_name, created_at, avatarUrl } = row;
                    const selectedUser = selected.indexOf(Program_name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, Program_name)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={Program_name} src={avatarUrl} />
                            <Typography variant="subtitle2" noWrap>
                              <Link href={`/admin/dashboard/contents/${id}`} color="primary" underline="hover">
                                {Program_name}
                              </Link>
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">
                          <Link href={`/admin/dashboard/levels/${id}`} color="primary" underline="hover">
                            {row.levels.map((level) => level.level).join(', ')}
                          </Link>
                        </TableCell>

                        <TableCell align="left">{created_at}</TableCell>
                        {/*
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
            count={Programs.length}
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
            // console.log(`admin/dashboard/levels/${selectedRow.id}`)
            navigate(`/dashboard/levels/${selectedRow.id}`, { replace: true });
          }}
        >
          <Iconify icon={'eva:arrowhead-up-outline'} sx={{ mr: 2 }} />
          Levels
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
            <h2>{isEditMode ? 'Edit Program' : 'Add Program'}</h2>
            <form noValidate>
              <TextField
                name="Program_name"
                label="Program Name"
                value={formData.Program_name}
                onChange={handleFormChange}
                variant="outlined"
                error={!!formErrors.Program_name}
                helperText={formErrors.Program_name}
                fullWidth
              />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Lesson Interval
              </Typography>
              <StyledFormRow sx={{ marginBottom: '16px' }}>
                <FormControl fullWidth variant="outlined" error={!!formErrors.lesson_interval.days}>
                  <InputLabel id="lesson-interval-days-select-label">Days</InputLabel>
                  <Select
                    labelId="lesson-interval-days-select-label"
                    id="lesson-interval-days-select"
                    name="lesson_interval.days"
                    value={formData.lesson_interval.days}
                    onChange={handleFormChange}
                    label="Days"
                    error={!!formErrors.lesson_interval.days}
                    helperText={formErrors.lesson_interval.days}
                  >
                    {Array.from({ length: 6 }, (_, day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" error={!!formErrors.lesson_interval.hours}>
                  <InputLabel id="lesson-interval-hours-select-label">Hours</InputLabel>
                  <Select
                    labelId="lesson-interval-hours-select-label"
                    id="lesson-interval-hours-select"
                    name="lesson_interval.hours"
                    value={formData.lesson_interval.hours}
                    onChange={handleFormChange}
                    label="Hours"
                    error={!!formErrors.lesson_interval.hours}
                    helperText={formErrors.lesson_interval.hours}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <MenuItem key={hour} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" error={!!formErrors.lesson_interval.minutes}>
                  <InputLabel id="lesson-interval-minutes-select-label">Minutes</InputLabel>
                  <Select
                    labelId="lesson-interval-minutes-select-label"
                    id="lesson-interval-minutes-select"
                    name="lesson_interval.minutes"
                    value={formData.lesson_interval.minutes}
                    onChange={handleFormChange}
                    label="Minutes"
                    error={!!formErrors.lesson_interval.minutes}
                    helperText={formErrors.lesson_interval.minutes}
                  >
                    {Array.from({ length: 60 }, (_, min) => (
                      <MenuItem key={min} value={min}>
                        {min}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </StyledFormRow>
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Quiz Reminder
              </Typography>
              <StyledFormRow sx={{ marginBottom: '16px' }}>
                <FormControl fullWidth variant="outlined" error={!!formErrors.quiz_reminder.days}>
                  <InputLabel id="quiz-reminder-days-select-label">Days</InputLabel>
                  <Select
                    labelId="quiz-reminder-days-select-label"
                    id="quiz-reminder-days-select"
                    name="quiz_reminder.days"
                    value={formData.quiz_reminder.days}
                    onChange={handleFormChange}
                    label="Days"
                    error={!!formErrors.quiz_reminder.days}
                    helperText={formErrors.quiz_reminder.days}
                  >
                    {Array.from({ length: 6 }, (_, day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" error={!!formErrors.quiz_reminder.hours}>
                  <InputLabel id="quiz-reminder-hours-select-label">Hours</InputLabel>
                  <Select
                    labelId="quiz-reminder-hours-select-label"
                    id="quiz-reminder-hours-select"
                    name="quiz_reminder.hours"
                    value={formData.quiz_reminder.hours}
                    onChange={handleFormChange}
                    label="Hours"
                    error={!!formErrors.quiz_reminder.hours}
                    helperText={formErrors.quiz_reminder.hours}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <MenuItem key={hour} value={hour}>
                        {hour}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" error={!!formErrors.quiz_reminder.minutes}>
                  <InputLabel id="quiz-reminder-minutes-select-label">Minutes</InputLabel>
                  <Select
                    labelId="quiz-reminder-minutes-select-label"
                    id="quiz-reminder-minutes-select"
                    name="quiz_reminder.minutes"
                    value={formData.quiz_reminder.minutes}
                    onChange={handleFormChange}
                    label="Minutes"
                    error={!!formErrors.quiz_reminder.minutes}
                    helperText={formErrors.quiz_reminder.minutes}
                  >
                    {Array.from({ length: 60 }, (_, min) => (
                      <MenuItem key={min} value={min}>
                        {min}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </StyledFormRow>
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
        <DialogTitle id="alert-dialog-title">{'Delete Program?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the Program {selectedRow?.Program_name}?
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
