import React, { useState } from 'react';
import { Button, Typography, Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const BulkUploadCorrectedAssignments = ({ cohortId }) => {
    const [files, setFiles] = useState([]);
    const [scores, setScores] = useState([]);
    const [remarks, setRemarks] = useState([]);
    const [assignmentIds, setAssignmentIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (index, file) => {
        const newFiles = [...files];
        newFiles[index] = file;
        setFiles(newFiles);
    };

    const handleScoreChange = (index, score) => {
        const newScores = [...scores];
        newScores[index] = score;
        setScores(newScores);
    };

    const handleRemarkChange = (index, remark) => {
        const newRemarks = [...remarks];
        newRemarks[index] = remark;
        setRemarks(newRemarks);
    };

    const handleAssignmentIdChange = (index, assignmentId) => {
        const newAssignmentIds = [...assignmentIds];
        newAssignmentIds[index] = assignmentId;
        setAssignmentIds(newAssignmentIds);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files', file);
            formData.append('scores', scores[index]);
            formData.append('remarks', remarks[index]);
            formData.append('assignmentIds', assignmentIds[index]);
        });

        try {
            const response = await axios.post(`${apiUrl}/assignments/bulk-upload-corrected`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data);
        } catch (error) {
            console.error('Error uploading corrected assignments:', error);
            alert('Failed to upload corrected assignments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Bulk Upload Corrected Assignments
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Assignment ID</TableCell>
                            <TableCell>File</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Remark</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignmentIds.map((assignmentId, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        value={assignmentId}
                                        onChange={(e) => handleAssignmentIdChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={scores[index] || ''}
                                        onChange={(e) => handleScoreChange(index, parseInt(e.target.value, 10))}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={remarks[index] || ''}
                                        onChange={(e) => handleRemarkChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
                {loading ? 'Uploading...' : 'Upload Corrected Assignments'}
            </Button>
        </Box>
    );
};

export default BulkUploadCorrectedAssignments;