import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { FormControl, Select, Box, Stack, Typography, Container, Card, TableContainer, Table, MenuItem } from '@mui/material';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
import { getOrgUsers, getOrgCohorts, deleteUser } from '../api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'created_at', label: 'Created Date', alignRight: false },
  { id: '' },
];

const StyledCard = styled(Card)({
  width: '40%',
  margin: '10px auto',
  padding: '20px',
});

// Sorting and filtering helpers
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedArray = array.map((el, index) => [el, index]);
  stabilizedArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (user) => user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedArray.map((el) => el[0]);
}

export default function UsersPage() {
  const { id } = useParams();
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleSelectLevel = (event) => {
    setSelectedLevel(event.target.value);
    fetchUsers();
  };

  const handleSelectProgram = (event) => {
    setSelectedProgram(event.target.value);
    fetchUsers();
  };

  const fetchUsers = () => {
    getOrgUsers(id, selectedProgram, selectedLevel).then((res) => setUsers(res));
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedProgram, selectedLevel]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  return (
    <>
      <Helmet>
        <title> Users Details | Chipper Sage </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>Users</Typography>
          <Stack direction="row" alignItems="center" justifyContent="right">
            <FormControl variant="outlined">
              <Select
                labelId="level-select-label"
                id="level-select"
                value={selectedLevel}
                onChange={handleSelectLevel}
                sx={{ width: '280px', marginRight: '10px' }}
              >
                {levels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>{level.level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined">
              <Select
                labelId="program-select-label"
                id="program-select"
                value={selectedProgram}
                onChange={handleSelectProgram}
                sx={{ width: '280px', marginRight: '10px' }}
              >
                {programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>{program.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            deleteUser={deleteUser}
          />
          <TableContainer>
            <Table>
              <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
              />
              {/* Other table components */}
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </>
  );
}
