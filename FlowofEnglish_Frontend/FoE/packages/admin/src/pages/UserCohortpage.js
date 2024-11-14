import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Table, Button, TextField, Checkbox, Modal, Snackbar, Box, Typography,
    Grid, Card, TableBody, TableCell, TableHead, TableRow, TableSortLabel,
    CircularProgress, IconButton, Menu, MenuItem,  Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { getCohortMapping, createUserCohortMapping, updateUserCohortMapping, deleteUserCohortMapping } from '../api';

const TABLE_HEAD = [
    { id: 'select', label: '', alignRight: false },
    { id: 'userName', label: 'User Name', alignRight: false },
    { id: 'userId', label: 'User Id', alignRight: false },
    { id: 'leaderboardScore', label: 'Leaderboard Score', alignRight: false },
    { id: 'actions', label: 'Actions', alignRight: true },
];

const UserCohortPage = () => {
    const { cohortId } = useParams();
    const [userCohortData, setUserCohortData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [cohortName, setCohortName] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeRowId, setActiveRowId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [selectedRowsMessage, setSelectedRowsMessage] = useState('');

    useEffect(() => {
        if (cohortId) {
            fetchUserCohortData(cohortId);
        }
    }, [cohortId]);

    const fetchUserCohortData = async (cohortId) => {
        setLoading(true);
        try {
            const data = await getCohortMapping(cohortId);
            setUserCohortData(data);
            setCohortName(data[0]?.cohortName || "");
        } catch (error) {
            showSnackbar('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };
    

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (currentRecord) {
                await updateUserCohortMapping(currentRecord.userCohortId, formValues);
                showSnackbar('Record updated successfully');
            } else {
                await createUserCohortMapping(formValues);
                showSnackbar('Record created successfully');
            }
            fetchUserCohortData(cohortId);
            setIsModalOpen(false);
        } catch (error) {
            showSnackbar('Error saving data', 'error');
        }
    };

    const handleDelete = async (userCohortId) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await deleteUserCohortMapping(userCohortId);
                showSnackbar('Record deleted successfully');
                fetchUserCohortData();
            } catch (error) {
                showSnackbar('Error deleting data', 'error');
            }
        }
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setFormValues({
            userId: record.userId,
            cohortId: record.cohortId,
            leaderboardScore: record.leaderboardScore,
        });
        setIsModalOpen(true);
    };

    const handleSearch = (query) => {
        const filteredData = userCohortData.filter(row =>
            row.userName.toLowerCase().includes(query.toLowerCase()) ||
            row.cohortName.toLowerCase().includes(query.toLowerCase())
        );
        setUserCohortData(filteredData);
    };

    const handleSelectRow = (userCohortId) => {
        const updatedSelectedRows = selectedRows.includes(userCohortId)
            ? selectedRows.filter((id) => id !== userCohortId)
            : [...selectedRows, userCohortId];

        setSelectedRows(updatedSelectedRows);

        // Set the selected rows message
        if (updatedSelectedRows.length === 1) {
            const user = userCohortData.find(item => item.userCohortId === userCohortId);
            setSelectedRowsMessage(`You have selected: ${user.userName}`);
        } else if (updatedSelectedRows.length > 1) {
            setSelectedRowsMessage(`You have selected ${updatedSelectedRows.length} users.`);
        } else {
            setSelectedRowsMessage(''); // Reset message when no rows are selected
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = userCohortData.map((item) => item.userCohortId);
            setSelectedRows(allIds);
            setSelectedRowsMessage(`You have selected ${allIds.length} users.`);
        } else {
            setSelectedRows([]);
            setSelectedRowsMessage('');
        }
    };

    const handleSort = (property) => {
        const isAscending = sortConfig.key === property && sortConfig.direction === 'asc';
        setSortConfig({ key: property, direction: isAscending ? 'desc' : 'asc' });
        const sortedData = [...userCohortData].sort((a, b) => (
            isAscending ? (a[property] > b[property] ? -1 : 1) : (a[property] < b[property] ? -1 : 1)
        ));
        setUserCohortData(sortedData);
    };

    const openMenu = (event, userCohortId) => {
        setAnchorEl(event.currentTarget);
        setActiveRowId(userCohortId);
    };

    const closeMenu = () => {
        setAnchorEl(null);
        setActiveRowId(null);
    };

    const openCreateModal = () => {
        setCurrentRecord(null);
        setFormValues({ userId: '', cohortId: '', leaderboardScore: '' });
        setIsModalOpen(true);
    };

    return (
    <>
    <Helmet>
    <title> Cohort | Chipper Sage </title>
    </Helmet>

    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" gutterBottom>
        {cohortName}
        </Typography>
    </Stack>

        <Box padding={3}>
            <Grid container justifyContent="space-between" alignItems="center" marginBottom={2}>
                <TextField
                    label="Search by User"
                    variant="outlined"
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
                Add Learner to Cohort
                </Button>
            </Grid>

            <Card>
                {loading ? (
                    <CircularProgress />
                ) : (
        <Table>
        <TableHead>
            <TableRow>
                {TABLE_HEAD.map((head) => (
                    <TableCell key={head.id} align={head.alignRight ? 'right' : 'left'}>
                        {head.id === 'select' ? (
                            <Checkbox
                            checked={selectedRows.length === userCohortData.length}
                            indeterminate={
                                selectedRows.length > 0 &&
                                selectedRows.length < userCohortData.length
                            }
                            onChange={handleSelectAll}
                        />
                        ) : (
                            <TableSortLabel
                                active={sortConfig.key === head.id}
                                direction={sortConfig.direction}
                                onClick={() => handleSort(head.id)}
                            >
                                {head.label}
                            </TableSortLabel>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
        <TableBody>
            {userCohortData.map((row) => (
                <TableRow key={row.userCohortId}>
                    <TableCell>
                        <Checkbox
                            checked={selectedRows.includes(row.userCohortId)}
                            onChange={() => handleSelectRow(row.userCohortId)}
                        />
                    </TableCell>
                    <TableCell>{row.userName}</TableCell>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell>{row.leaderboardScore}</TableCell>
                    <TableCell align="right">
                    <IconButton onClick={(e) => openMenu(e, row.userCohortId)}>
                            <MoreVertIcon />
                        </IconButton>
                        {activeRowId === row.userCohortId && (
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={closeMenu}
                            >
                                <MenuItem onClick={() => handleEdit(row)}>Update</MenuItem>
                                <MenuItem onClick={() => handleDelete(row.userCohortId)}>Delete</MenuItem>
                            </Menu>
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
        </Table>
        )}
        </Card>
        {/* Selected Rows Message */}
        {selectedRowsMessage && (
                <Snackbar
                    open={selectedRowsMessage !== ''}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    message={selectedRowsMessage}
                />
            )}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
        sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        padding: 3,
        borderRadius: 1,
        width: 400,
        }}
        >
        <Typography variant="h6" gutterBottom>
        {currentRecord ? 'Update Learner to Cohort' : 'Add Learner to Cohort'}
        </Typography>
        <form
        onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrUpdate();
        }}
        >
        <TextField
            label="User ID"
            value={formValues.userId || ''}
            onChange={(e) => setFormValues({ ...formValues, userId: e.target.value })}
            fullWidth
            margin="normal"
            required
        />
        <TextField
            label="Cohort ID"
            value={formValues.cohortId || ''}
            onChange={(e) => setFormValues({ ...formValues, cohortId: e.target.value })}
            fullWidth
            margin="normal"
            required
        />
        <TextField
            label="Leaderboard Score"
            value={formValues.leaderboardScore || ''}
            onChange={(e) => setFormValues({ ...formValues, leaderboardScore: e.target.value })}
            fullWidth
            margin="normal"
            required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            {currentRecord ? 'Update' : 'Create'}
        </Button>
        </form>
        </Box>
        </Modal>

        <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
        </Box>
        </>
        );
        };

        export default UserCohortPage;