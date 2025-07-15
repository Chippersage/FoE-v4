import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import {
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  Stack,
} from '@mui/material';

// Custom Components
import Scrollbar from '../components/scrollbar';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// API Functions
import { getPrograms } from '../api';

// Constants
const TABLE_HEAD = [
  { id: 'programId', label: 'Program Id', alignRight: false },
  { id: 'programName', label: 'Program Name', alignRight: false },
  { id: 'stages', label: 'Stages', alignRight: false },
  { id: 'units', label: 'Units', alignRight: true },
];

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
    return array.filter((program) => program.programName.toLowerCase().includes(query.toLowerCase()));
  }
  return stabilizedThis.map((el) => el[0]);
};

const ProgramPage = () => {
  const { id } = useParams();
  const [programs, setPrograms] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('programId');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [id]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = programs.map((program) => program.programName);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, programName) => {
    const selectedIndex = selected.indexOf(programName);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = [...selected, programName];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else {
      newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPrograms = applySortFilter(programs, getComparator(order, orderBy), filterName);
  const isProgramNotFound = filteredPrograms.length === 0;

  return (
    <>
      <Helmet>
        <title>Programs | Chipper Sage</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Programs
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={(e) => setFilterName(e.target.value)}
          />
          <Scrollbar>
            {loading ? (
              <CircularProgress sx={{ m: 3 }} />
            ) : (
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <UserListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={programs.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredPrograms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { programId, programName, stages, unitCount } = row;
                      const isItemSelected = selected.indexOf(programName) !== -1;
                      return (
                        <TableRow hover key={programId} role="checkbox" selected={isItemSelected} tabIndex={-1}>
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, programName)} />
                          </TableCell>
                          <TableCell>{programId}</TableCell>
                          <TableCell>
                            <Link href={`/dashboard/program/${programId}`} color="inherit" underline="hover">
                              {programName}
                            </Link>
                          </TableCell>
                          <TableCell>{stages}</TableCell>
                          <TableCell align="right">{unitCount}</TableCell>
                        </TableRow>
                      );
                    })}
                    {isProgramNotFound && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="subtitle1">No programs found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Scrollbar>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={programs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
};

export default ProgramPage;
