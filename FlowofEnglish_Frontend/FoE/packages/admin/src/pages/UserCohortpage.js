import React, { useState, useEffect } from 'react';
import { Table, Button, TextField, Checkbox, Modal, Snackbar, Box, Card, Typography, Grid } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getUserCohortMappings, createUserCohortMapping, updateUserCohortMapping, deleteUserCohortMapping } from '../api';


const UserCohortPage = () => {
    const [userCohortData, setUserCohortData] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        fetchUserCohortData();
    }, []);

    const fetchUserCohortData = async () => {
        try {
            const response = await getUserCohortMappings();
            setUserCohortData(response);
        } catch (error) {
            handleSnackbar('Error fetching user-cohort data', 'error');
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (currentRecord) {
                // Update record
                await updateUserCohortMapping(currentRecord.userCohortId, formValues);
                handleSnackbar('User-Cohort Mapping updated successfully');
            } else {
                // Create new record
                await createUserCohortMapping(formValues);
                handleSnackbar('User-Cohort Mapping created successfully');
            }
            setIsModalVisible(false);
            fetchUserCohortData();
        } catch (error) {
            handleSnackbar('Error saving User-Cohort Mapping', 'error');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            try {
                await deleteUserCohortMapping(userId);
                handleSnackbar('User-Cohort Mapping deleted successfully');
                fetchUserCohortData();
            } catch (error) {
                handleSnackbar('Error deleting User-Cohort Mapping', 'error');
            }
        }
    };

    const handleSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setFormValues({
            userId: record.userId,
            cohortId: record.cohortId,
            leaderboardScore: record.leaderboardScore,
        });
        setIsModalVisible(true);
    };

    const handleSearch = async (value) => {
        try {
            const response = await getUserCohortMappings(value);
            setUserCohortData(response);
        } catch (error) {
            handleSnackbar('Error searching User-Cohort data', 'error');
        }
    };

    const onSelectChange = (userCohortId) => {
        const newSelectedRowKeys = [...selectedRowKeys];
        const index = newSelectedRowKeys.indexOf(userCohortId);
        if (index > -1) {
            newSelectedRowKeys.splice(index, 1);
        } else {
            newSelectedRowKeys.push(userCohortId);
        }
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSelectAllChange = (e) => {
        if (e.target.checked) {
            const newSelectedRowKeys = userCohortData.map((item) => item.userCohortId);
            setSelectedRowKeys(newSelectedRowKeys);
        } else {
            setSelectedRowKeys([]);
        }
    };

    const columns = [
        {
            title: <Checkbox onChange={onSelectAllChange} />,
            render: (text, record) => (
                <Checkbox
                    checked={selectedRowKeys.includes(record.userCohortId)}
                    onChange={() => onSelectChange(record.userCohortId)}
                />
            ),
        },
        {
            title: 'UserId',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'UserName',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Cohort Name',
            dataIndex: 'cohortName',
            key: 'cohortName',
        },
        {
            title: 'Leaderboard Score',
            dataIndex: 'leaderboardScore',
            key: 'leaderboardScore',
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <>
                    <Button
                        onClick={() => handleEdit(record)}
                        startIcon={<EditIcon />}
                        variant="contained"
                        color="primary"
                        style={{ marginRight: 10 }}
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={() => handleDelete(record.userId)}
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        color="secondary"
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Grid container spacing={2} direction="row" justifyContent="space-between">
                <Grid item>
                    <TextField
                        label="Search User or Cohort"
                        variant="outlined"
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setCurrentRecord(null);
                            setIsModalVisible(true);
                        }}
                    >
                        Create User-Cohort Mapping
                    </Button>
                </Grid>
            </Grid>

            <Card style={{ marginTop: 20, padding: 20 }}>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                    columns={columns}
                    dataSource={userCohortData}
                    rowKey="userCohortId"
                    pagination={false}
                />
            </Card>

            <Modal
                open={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                aria-labelledby="modal-title"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 24,
                        p: 4,
                        width: '400px',
                    }}
                >
                    <Typography variant="h6" id="modal-title" gutterBottom>
                        {currentRecord ? 'Edit User-Cohort Mapping' : 'Create User-Cohort Mapping'}
                    </Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateOrUpdate();
                        }}
                    >
                        <TextField
                            label="UserId"
                            value={formValues.userId || ''}
                            onChange={(e) => setFormValues({ ...formValues, userId: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="CohortId"
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
                            type="number"
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: 20 }}>
                            Submit
                        </Button>
                    </form>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                message={snackbarMessage}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                severity={snackbarSeverity}
            />
        </div>
    );
};

export default UserCohortPage;
