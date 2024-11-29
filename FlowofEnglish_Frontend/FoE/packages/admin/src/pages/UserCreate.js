import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography, 
    Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Checkbox, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CSVLink } from "react-csv";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Iconify from '../components/iconify';

import { createUser, createUsers, deleteUser, deleteUsers, getUsers, updateUser } from '../api';

const UserCreate = () => {
    const [users, setUsers] = useState([]);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userType, setUserType] = useState('');
    const [userPhoneNumber, setUserPhoneNumber] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [organizationId, setOrganizationId] = useState('');
    const [cohortId, setCohortId] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const usersData = await getUsers();
        if (usersData) {
            setUsers(usersData);
        } else {
            setSnackbarMessage('Error fetching users');
            setOpenSnackbar(true);
        }
        setLoading(false);
    };

    const handleCreateUser = async () => {
        const newUser = {
            user: {
                userId,
                userName,
                userEmail,
                userType,
                userPhoneNumber,
                userAddress,
                organization: { organizationId }
            },
            cohortId
        };

        try {
            await createUser(newUser);
            setSnackbarMessage('User created successfully');
            setOpenSnackbar(true);
            setOpenCreateDialog(false);
            fetchUsers();
        } catch (error) {
            setSnackbarMessage('Error creating user');
            setOpenSnackbar(true);
        }
    };

    const handleBulkCreate = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            setLoading(true);
            const response = await createUsers(formData);
    
            // Success message: Show how many users were created
            setSnackbarMessage(`${response.createdUsersCount} users created successfully!`);
    
            // Error message: If there are errors, show them
            if (response.errors && response.errors.length > 0) {
                setSnackbarMessage(`${response.errors.length} errors occurred: ${response.errors.join(', ')}`);
            }
    
            // Optionally show cohort summary if available
            if (response.cohortSummary && Object.keys(response.cohortSummary).length > 0) {
                const cohortSummaryMessage = Object.entries(response.cohortSummary)
                    .map(([cohortId, count]) => `Cohort ${cohortId}: ${count} users`)
                    .join(', ');
                setSnackbarMessage(prevMessage => `${prevMessage} Cohorts Summary: ${cohortSummaryMessage}`);
            }
            setOpenSnackbar(true);
            fetchUsers();
    
        } catch (error) {
            console.error('Bulk create failed:', error);
            setSnackbarMessage('Error bulk creating users');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id);
            setSnackbarMessage('User deleted successfully');
            setOpenSnackbar(true);
            fetchUsers();
        } catch (error) {
            setSnackbarMessage('Error deleting user');
            setOpenSnackbar(true);
        }
    };

    const handleBulkDelete = async () => {
        const userIds = selectedUsers.map(user => user.userId);
        try {
            const resultMessage = await deleteUsers(userIds);
            setSnackbarMessage(resultMessage); // Display backend message on success
            setOpenSnackbar(true);
            fetchUsers(); // Refresh the listnm start
        } catch (error) {
            setSnackbarMessage(`Error bulk deleting users: ${ error.message }`);
            setOpenSnackbar(true);
        }
    };
    
    const handleDeleteDialogOpen = (userId) => {
        setSelectedUserId(userId);
    };

    const confirmDelete = async () => {
        await handleDeleteUser(selectedUserId);
    };

    const handleCheckboxChange = (event, userId) => {
        if (event.target.checked) {
            setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, userId]);
        } else {
            setSelectedUsers(prevSelectedUsers => prevSelectedUsers.filter(id => id !== userId));
        }
    };

     const handleUpdateUser = async () => {
        const updatedUser = {
            userId: selectedUserId,
            userName,
            userEmail,
            userPhoneNumber,
            userAddress,
            userPassword,
            userType,
            organization: { organizationId }
        };
        try {
            await updateUser(selectedUserId, updatedUser);
            setSnackbarMessage('User updated successfully');
            setOpenSnackbar(true);
            setOpenUpdateDialog(false);
            fetchUsers();
        } catch (error) {
            setSnackbarMessage('Error updating user');
            setOpenSnackbar(true);
        }
    };

    const formatUserDataForExport = (users) => {
        return users.map(user => ({
          userId: user.userId,
          userName: user.userName,
          userPhoneNumber: user.userPhoneNumber || '', // Handle cases where phone number might be null/undefined
          userAddress: user.userAddress,
          userType: user.userType,
          userEmail: user.userEmail || '', // Handle cases where email might be null/undefined
          organizationId: user.organization?.organizationId || '', // Safely access organizationId
          cohortId: user.cohort?.cohortId || '', // Safely access cohortId
          programId: user.program?.programId || '', // Safely access programId
        }));
      };
      

    const openMenu = (event, user) => {
        setSelectedUserId(user.userId);
        setUserId(user.userId);
        setUserName(user.userName);
        setUserEmail(user.userEmail);
        setUserType(user.userType);
        setUserPassword(user.userPassword);
        setUserPhoneNumber(user.userPhoneNumber);
        setUserAddress(user.userAddress);
        setOrganizationId(user.organization?.organizationId);
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
       <>
      <Helmet>
        <title> Learners | Chipper Sage </title>
      </Helmet>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" gutterBottom>
          Learners
          </Typography>
          </Stack>
        <div style={{ padding: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)} style={{ marginRight: '10px' }}>
                Create User
            </Button>
            <Button variant="contained" color="secondary" onClick={handleBulkDelete} disabled={selectedUsers.length === 0} style={{ marginRight: '10px' }}>
                Bulk Delete Users
            </Button>

            <Button
            variant="contained"
            component="label"
            startIcon={<Iconify icon="eva:upload-fill" />}
          >
            Upload CSV
            <input type="file" hidden onChange={(e) => handleBulkCreate(e.target.files[0])} />
          </Button>

            <CSVLink data={formatUserDataForExport(users)} filename="users.csv">
            <Button variant="contained" startIcon={<Iconify icon="eva:download-fill" />}>
              Export Learners
            </Button>
          </CSVLink>

            {loading && <CircularProgress />}

            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell padding="checkbox"/>
                        
                        {/* </TableCell> */}
                            <TableCell>User ID</TableCell>
                            <TableCell>User Name</TableCell>
                            <TableCell>User Organazation</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedUsers.includes(user.userId)}
                                        onChange={(e) => handleCheckboxChange(e, user.userId)} />
                                    </TableCell>
                                <TableCell>{user.userId}</TableCell>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.organization?.organizationName}</TableCell>
                                <TableCell>
                                <IconButton onClick={(e) => openMenu(e, user)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                        <MenuItem onClick={() => setOpenUpdateDialog(true)}>Update User</MenuItem>
                                        <MenuItem onClick={() => handleDeleteUser(selectedUserId)}>Delete User</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create User</DialogTitle>
                <DialogContent>
                    <TextField label="User ID" fullWidth value={userId} onChange={(e) => setUserId(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Name" fullWidth value={userName} onChange={(e) => setUserName(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Email" fullWidth value={userEmail} onChange={(e) => setUserEmail(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Phone Number" fullWidth value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Address" fullWidth value={userAddress} onChange={(e) => setUserAddress(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Type" fullWidth value={userType} onChange={(e) => setUserType(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="Organization ID" fullWidth value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="Cohort ID" fullWidth value={cohortId} onChange={(e) => setCohortId(e.target.value)} style={{ marginBottom: '10px' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleCreateUser} color="primary">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Update User Dialog */}
      {/* Update User Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
                <DialogTitle>Update User</DialogTitle>
                <DialogContent>
                    <TextField label="User ID" fullWidth value={userId} onChange={(e) => setUserId(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Name" fullWidth value={userName} onChange={(e) => setUserName(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Email" fullWidth value={userEmail} onChange={(e) => setUserEmail(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Phone Number" fullWidth value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Address" fullWidth value={userAddress} onChange={(e) => setUserAddress(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Type" fullWidth value={userType} onChange={(e) => setUserType(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="User Password" fullWidth value={userPassword} onChange={ (e) => setUserPassword(e.target.value)} style={{ marginBottom: '10px' }} />
                    <TextField label="Organization ID" fullWidth value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} style={{ marginBottom: '10px' }} />
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setOpenUpdateDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleUpdateUser} color="primary">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
        </div>
        </>
    );
};

export default UserCreate;