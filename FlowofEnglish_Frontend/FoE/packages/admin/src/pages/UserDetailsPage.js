import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
} from '@mui/material';

import { AppNewsUpdate, AppOrderTimeline } from '../sections/@dashboard/app';

// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
import { getUserWorklogs, getUserDetails } from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'direction', label: 'Msg Direction', alignRight: false },
  { id: 'workflow', label: 'Workflow ID', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'step', label: 'Step', alignRight: false },
  { id: 'created_at', label: 'Procesed At', alignRight: false },
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
    return filter(array, (_user) => _user.level.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserDetailsPage() {
  const { id, user_id } = useParams();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [users, setUser] = useState([]);
  const [userworklogs, setUserworklogs] = useState([]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    getUserDetails(user_id).then((res) => {
      // console.log('User', res);
      setUser(res);
    });
  }, []);

  useEffect(() => {
    getUserWorklogs(user_id).then((res) => {
      // console.log('User Worklogs', res);
      setUserworklogs(res);
    });
  }, []);

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
    setRowsPerPage(parseInt(event.target.value, 20));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userworklogs.length) : 0;

  const filteredUsers = applySortFilter(userworklogs, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> User | Chipper Sage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
        </Stack>

        <Card sx={{ padding: 2 }}>
          <Container ml={2}>
            <Grid item xs={12} md={6} lg={8}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h4" gutterBottom>
                  User Details
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={8}>
                  <Typography variant="body1" gutterBottom>
                    Name: {users.name}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    Phone: {users.phone_no}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Level: {users.user_course_info ? users.user_course_info[0]?.current_level : ''}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    Language : {users.user_course_info ? users.user_course_info[0]?.language?.language : ''}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Created At: {users.created_at}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Card>
        <br />

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userworklogs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  nocheckbox="true"
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => {
                    const { id, id_workflow, status, direction, workflow, created_at } = row;
                    const selectedUser = selected.indexOf(direction) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell component="td" scope="row" sx={{ padding: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap alignItems="center">
                              {sentenceCase(direction)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{id_workflow}</TableCell>
                        <TableCell align="left">{sentenceCase(status)}</TableCell>
                        <TableCell align="left">{workflow.step}</TableCell>

                        <TableCell align="left">{created_at}</TableCell>
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
            count={userworklogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
