import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AssignmentsTable = ({ cohortId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editedAssignments, setEditedAssignments] = useState({});
  const LIGHT_TEAL = "#e6f5f5";
  useEffect(() => {
    fetchAssignments();
  }, [cohortId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assignments/cohort/${cohortId}`
      );
      const sortedAssignments = response.data.sort((a, b) =>
        a.correctedDate ? 1 : -1
      );
      setAssignments(sortedAssignments);
      // Initialize editedAssignments with current values
      const initialEdits = {};
      response.data.forEach((assignment) => {
        initialEdits[assignment.assignmentId] = {
          score: assignment.score || "",
          remarks: assignment.remarks || "",
          file: null,
        };
      });
      setEditedAssignments(initialEdits);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAlert({
        open: true,
        message: "Failed to load assignments",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (assignmentId, score) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        score,
      },
    }));
  };

  const handleRemarksChange = (assignmentId, remarks) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        remarks,
      },
    }));
  };

  const handleFileChange = (assignmentId, file) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file,
      },
    }));
  };
  const handleCorrectedDateChange = (assignmentId, date) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        correctedDate: date,
      },
    }));
  };
  const handleSubmitCorrection = async (assignmentId) => {
    const editedData = editedAssignments[assignmentId];
    const assignment = assignments.find((a) => a.assignmentId === assignmentId);

    if (!editedData.score && !editedData.file) {
      setAlert({
        open: true,
        message: "Please provide at least a score or a correction file",
        severity: "warning",
      });
      return;
    }
    // Validate score against max score
    if (
      editedData.score &&
      assignment.subconcept &&
      assignment.subconcept.subconceptMaxscore
    ) {
      const maxScore = assignment.subconcept.subconceptMaxscore;
      if (parseInt(editedData.score, 10) > maxScore) {
        setAlert({
          open: true,
          message: `Score cannot exceed the maximum score of ${maxScore}`,
          severity: "error",
        });
        return;
      }
    }

    // Validate correction date
    if (editedData.correctedDate && assignment.submittedDate) {
      const correctedDate = new Date(editedData.correctedDate);
      const submittedDate = new Date(assignment.submittedDate);
      if (correctedDate < submittedDate) {
        setAlert({
          open: true,
          message: "Correction date cannot be earlier than submission date",
          severity: "error",
        });
        return;
      }
    }
    setUpdating(true);
    const formData = new FormData();

    if (editedData.file) {
      formData.append("file", editedData.file);
    }

    formData.append("score", editedData.score);
    formData.append("remarks", editedData.remarks);
    if (editedData.correctedDate) {
      const correctedDateTime = new Date(
        editedData.correctedDate
      ).toISOString();
      formData.append("correctedDate", correctedDateTime);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/assignments/${assignmentId}/correct`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the local state with the corrected assignment
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.assignmentId === assignmentId ? response.data : assignment
        )
      );

      setAlert({
        open: true,
        message: "Assignment successfully corrected",
        severity: "success",
      });
    } catch (error) {
      console.error("Error correcting assignment:", error);
      setAlert({
        open: true,
        message: "Failed to correct assignment",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    // Convert timestamp to Date object
    const date = new Date(timestamp * 1000);
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Assignments for Cohort: {cohortId}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2, overflow: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Assignment ID</TableCell>
                <TableCell>User</TableCell>
                {/*     <TableCell>Program</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Unit</TableCell> */}
                <TableCell>Assignment Q</TableCell>
                <TableCell>Max Score</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Submitted File</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Correction File</TableCell>
                <TableCell>Corrected Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow
                  key={assignment.assignmentId}
                  sx={{
                    backgroundColor: assignment.correctedDate
                      ? LIGHT_TEAL
                      : "inherit",
                    color: assignment.correctedDate ? "black" : "inherit",
                  }}
                >
                  <TableCell>{assignment.assignmentId}</TableCell>
                  <TableCell>
                    {assignment.user.userName} ({assignment.user.userId})
                  </TableCell>
                  {/*   <TableCell>{assignment.program.programName}</TableCell>
                    <TableCell>{assignment.stage.stageId}</TableCell>
                    <TableCell>{assignment.unit.unitId}</TableCell> */}
                  <TableCell>
                    {" "}
                    {assignment.subconcept.subconceptLink ? (
                      <a
                        href={assignment.subconcept.subconceptLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0066cc",
                          textDecoration: "underline",
                        }}
                      >
                        {assignment.subconcept.subconceptId}
                      </a>
                    ) : (
                      assignment.subconcept.subconceptId
                    )}
                  </TableCell>
                  <TableCell>
                    {assignment.subconcept.subconceptMaxscore}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(assignment.submittedDate)}
                  </TableCell>
                  <TableCell>
                    {assignment.submittedFile && (
                      <a
                        href={assignment.submittedFile.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0066cc",
                          textDecoration: "underline",
                        }}
                      >
                        View File
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={
                        editedAssignments[assignment.assignmentId]?.score || ""
                      }
                      onChange={(e) =>
                        handleScoreChange(
                          assignment.assignmentId,
                          e.target.value
                        )
                      }
                      inputProps={{
                        min: 0,
                        max: assignment.subconcept.subconceptMaxscore,
                        style: { width: "60px" },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      multiline
                      maxRows={3}
                      value={
                        editedAssignments[assignment.assignmentId]?.remarks ||
                        ""
                      }
                      onChange={(e) =>
                        handleRemarksChange(
                          assignment.assignmentId,
                          e.target.value
                        )
                      }
                      inputProps={{ style: { width: "150px" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <label
                      htmlFor={`correction-file-${assignment.assignmentId}`}
                    >
                      <input
                        accept="*/*"
                        id={`correction-file-${assignment.assignmentId}`}
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleFileChange(
                            assignment.assignmentId,
                            e.target.files[0]
                          )
                        }
                      />
                      <IconButton component="span" color="primary">
                        <CloudUploadIcon />
                      </IconButton>
                    </label>
                    {editedAssignments[assignment.assignmentId]?.file?.name ||
                      (assignment.correctedFile ? (
                        <a
                          href={assignment.correctedFile.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#0066cc",
                            textDecoration: "underline",
                          }}
                        >
                          View File
                        </a>
                      ) : (
                        ""
                      ))}
                  </TableCell>
                  <TableCell>
                    {assignment.correctedDate ? (
                      formatDateTime(assignment.correctedDate)
                    ) : (
                      <TextField
                        type="date"
                        size="small"
                        value={
                          editedAssignments[assignment.assignmentId]
                            ?.correctedDate || ""
                        }
                        onChange={(e) =>
                          handleCorrectedDateChange(
                            assignment.assignmentId,
                            e.target.value
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() =>
                        handleSubmitCorrection(assignment.assignmentId)
                      }
                      disabled={updating}
                    >
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Alert message */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentsTable;
