import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Card,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TablePagination,
  InputAdornment,
  TableSortLabel,
  Menu,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmptyStateIcon from "@mui/icons-material/FolderOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import { format } from "date-fns";
import { debounce } from "lodash"; // Add lodash for debouncing

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Memoized Assignment Row Component
const AssignmentRow = React.memo(
  ({
    assignment,
    editedAssignments,
    onScoreChange,
    onRemarksChange,
    onFileChange,
    onCorrectedDateChange,
    onSubmitCorrection,
    formatDateTime,
    handleOpenContent,
    updating,
    fieldErrors,
  }) => {
    const LIGHT_TEAL = "#e6f5f5";
    const DEPENDENCY_CHIP_COLOR = "#f0e6ff";
    const HOVER_COLOR = "#f5f5f5";

    // Debounced handlers to reduce state updates
    const debouncedScoreChange = useCallback(
      debounce((value) => {
        onScoreChange(assignment.assignmentId, value);
      }, 300),
      [assignment.assignmentId, onScoreChange]
    );

    const debouncedRemarksChange = useCallback(
      debounce((value) => {
        onRemarksChange(assignment.assignmentId, value);
      }, 300),
      [assignment.assignmentId, onRemarksChange]
    );

    // Local state for input values to make UI responsive
    const [localScore, setLocalScore] = useState(
      editedAssignments[assignment.assignmentId]?.score || ""
    );
    const [localRemarks, setLocalRemarks] = useState(
      editedAssignments[assignment.assignmentId]?.remarks || ""
    );

    // Handle local state changes
    const handleLocalScoreChange = (e) => {
      const value = e.target.value;
      setLocalScore(value);
      debouncedScoreChange(value);
    };

    const handleLocalRemarksChange = (e) => {
      // Limit input to 150 characters
      const input = e.target.value.slice(0, 150);
      setLocalRemarks(input);
      debouncedRemarksChange(input);
    };

    return (
      <TableRow
        sx={{
          backgroundColor: assignment.correctedDate ? LIGHT_TEAL : "inherit",
          color: assignment.correctedDate ? "black" : "inherit",
          transition: "background-color 0.2s ease",
        }}
      >
        <TableCell>
          <Tooltip title={`User name: ${assignment.user.userName}`}>
            <span>{assignment.user.userId}</span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ width: "25%" }}>
          <Tooltip
            title={assignment.subconcept.subconceptDesc}
            placement="top-start"
            arrow
            enterDelay={500}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                lineHeight: 1.3,
                maxHeight: "2.6em", // Approximately two lines
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2, // Limit to two lines
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
              data-tour-id="topic"
            >
              {assignment.subconcept.subconceptDesc}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell>
          {assignment.subconcept.dependencies &&
          assignment.subconcept.dependencies.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {assignment.subconcept.dependencies.map((dep, index) => (
                <Chip
                  key={index}
                  label={dep.subconceptId}
                  size="small"
                  sx={{
                    bgcolor: DEPENDENCY_CHIP_COLOR,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.8 },
                  }}
                  onClick={() =>
                    handleOpenContent(
                      dep.subconceptId,
                      dep.subconceptDesc,
                      dep.subconceptLink,
                      dep.subconceptType
                    )
                  }
                  data-tour-id="reference"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              None
            </Typography>
          )}
        </TableCell>
        <TableCell align="center">
          <Chip
            label={assignment.subconcept.subconceptMaxscore}
            size="small"
            color="primary"
            variant="outlined"
          />
        </TableCell>
        <TableCell>{formatDateTime(assignment.submittedDate)}</TableCell>
        <TableCell>
          {assignment.submittedFile && (
            <Button
              variant="outlined"
              size="small"
              data-tour-id="view-submitted-assignment-button"
              startIcon={<CloudUploadIcon />}
              href={assignment.submittedFile.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </Button>
          )}
        </TableCell>
        <TableCell>
          <TextField
            type="number"
            size="small"
            value={localScore}
            onChange={handleLocalScoreChange}
            error={fieldErrors?.score === true}
            helperText={fieldErrors?.score ? "Score is required" : ""}
            inputProps={{
              min: 0,
              max: assignment.subconcept.subconceptMaxscore,
              style: { width: "60px" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ position: "relative" }}>
            <TextField
              size="small"
              multiline
              maxRows={3}
              value={localRemarks}
              onChange={handleLocalRemarksChange}
              error={fieldErrors?.remarks === true}
              helperText={fieldErrors?.remarks ? "Remark is required" : ""}
              inputProps={{
                style: { width: "150px" },
                maxLength: 150, // HTML attribute for max length
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: "2px",
                right: "8px",
                fontSize: "0.7rem",
                color: "text.secondary",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: "0 2px",
                borderRadius: "2px",
              }}
            >
              {localRemarks.length}/150
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center">
            <label htmlFor={`correction-file-${assignment.assignmentId}`}>
              <input
                accept="*/*"
                id={`correction-file-${assignment.assignmentId}`}
                type="file"
                style={{ display: "none" }}
                onChange={(e) =>
                  onFileChange(assignment.assignmentId, e.target.files[0])
                }
              />
              <Tooltip title="Upload correction file">
                <IconButton component="span" color="primary" size="small">
                  <CloudUploadIcon />
                </IconButton>
              </Tooltip>
            </label>
            {editedAssignments[assignment.assignmentId]?.file?.name ? (
              <Typography
                variant="caption"
                noWrap
                sx={{ ml: 1, maxWidth: 100 }}
              >
                {editedAssignments[assignment.assignmentId].file.name}
              </Typography>
            ) : (
              assignment.correctedFile && (
                <Button
                  variant="text"
                  size="small"
                  href={assignment.correctedFile.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ml: 1, textTransform: "none" }}
                >
                  View File
                </Button>
              )
            )}
          </Box>
        </TableCell>
        <TableCell>
          {assignment.correctedDate ? (
            formatDateTime(assignment.correctedDate)
          ) : (
            <TextField
              type="date"
              size="small"
              value={
                editedAssignments[assignment.assignmentId]?.correctedDate || ""
              }
              onChange={(e) =>
                onCorrectedDateChange(assignment.assignmentId, e.target.value)
              }
              sx={{ width: 130 }}
            />
          )}
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onSubmitCorrection(assignment.assignmentId)}
            disabled={updating || assignment.correctedDate}
            sx={{
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
            data-tour-id="save"
          >
            {updating
              ? "Saving..."
              : assignment.correctedDate
              ? "Corrected"
              : "Save"}
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

const AssignmentsTable = ({ cohortId, onAssignmentsLoaded }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Sorting states
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("user.userId");
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);

  const [statistics, setStatistics] = useState({
    correctedAssignments: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    cohortUserCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editedAssignments, setEditedAssignments] = useState({});
  const [contentDialog, setContentDialog] = useState({
    open: false,
    title: "",
    content: "",
    link: "",
    type: "",
  });
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level (1 = 100%)
  const [fieldErrors, setFieldErrors] = useState({});


  // Theme colors
  const LIGHT_TEAL = "#e6f5f5";
  const LINK_COLOR = "#0066cc";
  const HOVER_COLOR = "#f5f5f5";
  const DEPENDENCY_CHIP_COLOR = "#f0e6ff";

  // Define sortable columns with their data paths and labels
  const sortableColumns = [
    {
      id: "user.userId",
      label: "User ID",
      path: (a) => a.user.userId.toLowerCase(),
    },
    {
      id: "subconcept.subconceptDesc",
      label: "Topic",
      path: (a) => a.subconcept.subconceptDesc.toLowerCase(),
    },
    {
      id: "subconcept.subconceptMaxscore",
      label: "Max Score",
      path: (a) => a.subconcept.subconceptMaxscore,
    },
    {
      id: "submittedDate",
      label: "Submitted Date",
      path: (a) => a.submittedDate,
    },
    { id: "score", label: "Score", path: (a) => a.score || 0 },
    {
      id: "correctedDate",
      label: "Date of Correction",
      path: (a) => a.correctedDate || 0,
    },
    {
      id: "status",
      label: "Status",
      path: (a) => (a.correctedDate ? "Corrected" : "Pending"),
    },
  ];

  useEffect(() => {
    fetchAssignments();
  }, [cohortId]);

  // Filter assignments based on search query
  useEffect(() => {
    if (assignments.length > 0) {
      const filtered = assignments.filter((assignment) => {
        const searchText = searchQuery.toLowerCase();
        return (
          assignment.user.userId.toLowerCase().includes(searchText) ||
          assignment.user.userName.toLowerCase().includes(searchText) ||
          assignment.subconcept.subconceptDesc
            .toLowerCase()
            .includes(searchText) ||
          assignment.subconcept.subconceptId.toLowerCase().includes(searchText)
        );
      });
      setFilteredAssignments(filtered);
      sortData(filtered, orderBy, order);
      setPage(0); // Reset to first page when search changes
    }
  }, [searchQuery, assignments]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assignments/cohort/${cohortId}`
      );
      // Handle the new response format with assignments and statistics
      const { assignments: fetchedAssignments, statistics: fetchedStatistics } =
        response.data;
      // Sort assignments with pending first
      const sortedAssignments = fetchedAssignments.sort((a, b) =>
        a.correctedDate ? 1 : -1
      );
      setAssignments(sortedAssignments);
      setFilteredAssignments(sortedAssignments);
      setStatistics(fetchedStatistics);

      // Initialize editedAssignments with current values
      const initialEdits = {};
      fetchedAssignments.forEach((assignment) => {
        initialEdits[assignment.assignmentId] = {
          score: assignment.score || "",
          remarks: assignment.remarks || "",
          file: null,
        };
      });
      setEditedAssignments(initialEdits);
      // Notify parent that assignments are loaded
      if (onAssignmentsLoaded && fetchedAssignments.length > 0) {
        onAssignmentsLoaded();
      }
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

  // Generic function to get a nested property value using a path like 'user.userId'
  const getNestedValue = (obj, path) => {
    const pathArray = path.split(".");
    return pathArray.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
      obj
    );
  };

  // Sorting function that handles nested properties
  const sortData = (data, property, sortOrder) => {
    const column = sortableColumns.find((col) => col.id === property);
    if (!column) return [...data]; // Return copy if no valid column found

    const sortedData = [...data].sort((a, b) => {
      const valueA = column.path(a);
      const valueB = column.path(b);

      // Handle nulls/undefined
      if (valueA === null || valueA === undefined)
        return sortOrder === "asc" ? -1 : 1;
      if (valueB === null || valueB === undefined)
        return sortOrder === "asc" ? 1 : -1;

      // Sort numbers
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      // Default string comparison
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredAssignments(sortedData);
    return sortedData;
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);
    sortData(filteredAssignments, property, newOrder);
    handleCloseSortMenu();
  };

  // Sort menu handlers
  const handleOpenSortMenu = (event) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortMenuAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Optimized handlers using useCallback to prevent recreation on each render
  const handleScoreChange = useCallback((assignmentId, score) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        score,
      },
    }));
  }, []);

  const handleRemarksChange = useCallback((assignmentId, remarks) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        remarks,
      },
    }));
  }, []);

  const handleFileChange = useCallback((assignmentId, file) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file,
      },
    }));
  }, []);

  const handleCorrectedDateChange = useCallback((assignmentId, date) => {
    setEditedAssignments((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        correctedDate: date,
      },
    }));
  }, []);

  const handleSubmitCorrection = async (assignmentId) => {
    const editedData = editedAssignments[assignmentId];
    const assignment = assignments.find((a) => a.assignmentId === assignmentId);
  
    const errors = {
      score: !editedData.score || editedData.score.toString().trim() === "",
      remarks: !editedData.remarks || editedData.remarks.trim() === "",
    };
  
    if (!editedData.score || editedData.score.toString().trim() === "") {
      errors.score = true;
    }
  
    if (!editedData.remarks || editedData.remarks.trim() === "") {
      errors.remarks = true;
    }
  
    // Set visual error states
    setFieldErrors((prev) => ({
      ...prev,
      [assignmentId]: errors,
    }));
  
    // If any errors found, show alert and return
    if (errors.score || errors.remarks) {
      setAlert({
        open: true,
        message: "Please fill in both Score and Remarks before submitting.",
        severity: "error",
      });
      return;
    }
  
    // Validate file or score (optional but already in your code)
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
      const submittedDate = new Date(assignment.submittedDate * 1000);
      if (correctedDate < submittedDate) {
        setAlert({
          open: true,
          message: "Correction date cannot be earlier than submission date",
          severity: "error",
        });
        return;
      }
    }
  
    // Continue with submission
    setUpdating(true);
    const formData = new FormData();
  
    if (editedData.file) {
      formData.append("file", editedData.file);
    }
  
    formData.append("score", editedData.score);
    formData.append("remarks", editedData.remarks);
    if (editedData.correctedDate) {
      const correctedDateTime = new Date(editedData.correctedDate).toISOString();
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
  
      // Update local state
      const updatedAssignments = assignments.map((assignment) =>
        assignment.assignmentId === assignmentId ? response.data : assignment
      );
  
      setAssignments(updatedAssignments);
  
      const updatedFiltered = filteredAssignments.map((assignment) =>
        assignment.assignmentId === assignmentId ? response.data : assignment
      );
      sortData(updatedFiltered, orderBy, order);
  
      setStatistics((prevStats) => ({
        ...prevStats,
        correctedAssignments: prevStats.correctedAssignments + 1,
        pendingAssignments: prevStats.pendingAssignments - 1,
      }));
  
      setAlert({
        open: true,
        message: "Assignment successfully corrected",
        severity: "success",
      });
  
      // Clear error state after success
      setFieldErrors((prev) => ({
        ...prev,
        [assignmentId]: {},
      }));
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

  const handleOpenContent = useCallback((title, content, link, type) => {
    setContentDialog({
      open: true,
      title,
      content,
      link,
      type,
    });
  }, []);

  const handleCloseContent = () => {
    setContentDialog({
      ...contentDialog,
      open: false,
    });
  };

  // Empty state component
  const EmptyState = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      my={8}
      p={4}
      sx={{
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <EmptyStateIcon sx={{ fontSize: 80, color: "#999", mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No Assignments Found
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center">
        There are no assignments available for this cohort.
      </Typography>
    </Box>
  );

  // Get current page of assignments
  const currentAssignments = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate number of assignments that match the search query
  const filteredCount = filteredAssignments.length;

  // Memoize important callback functions to avoid recreations
  const memoizedFormatDateTime = useCallback(formatDateTime, []);
  const memoizedHandleOpenContent = useCallback(handleOpenContent, []);
  const memoizedHandleSubmitCorrection = useCallback(handleSubmitCorrection, [
    assignments,
    editedAssignments,
  ]);

  // Get current sort column name for display
  const getCurrentSortColumnName = () => {
    const column = sortableColumns.find((col) => col.id === orderBy);
    return column ? column.label : "";
  };

  return (
    <Card sx={{ p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1, color: "#1976d2" }} />
          <Typography variant="h5" component="div">
            Assignments for {assignments[0]?.program?.programName}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Chip
            label={`Total: ${statistics.totalAssignments}`}
            color="default"
            variant="outlined"
          />
          <Chip
            label={`Pending: ${statistics.pendingAssignments}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`Corrected: ${statistics.correctedAssignments}`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Users: ${statistics.cohortUserCount}`}
            color="info"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Search and Sort Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          size="small"
          label="Search assignments by user, topic, or reference"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "50%",
            minWidth: "300px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

        <Box>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleOpenSortMenu}
            size="medium"
            sx={{
              textTransform: "none",
              mr: 1,
              borderRadius: "8px",
            }}
          >
            Sort by: {getCurrentSortColumnName()} (
            {order === "asc" ? "Ascending" : "Descending"})
          </Button>
          <Menu
            anchorEl={sortMenuAnchorEl}
            open={Boolean(sortMenuAnchorEl)}
            onClose={handleCloseSortMenu}
            PaperProps={{
              style: {
                maxHeight: 48 * 7.5,
                width: "250px",
              },
            }}
          >
            {sortableColumns.map((column) => (
              <MenuItem
                key={column.id}
                onClick={() => handleRequestSort(column.id)}
                selected={orderBy === column.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {column.label}
                {orderBy === column.id && (
                  <Box component="span" sx={{ color: "primary.main", ml: 2 }}>
                    {order === "asc" ? "↑" : "↓"}
                  </Box>
                )}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              onClick={() => {
                handleRequestSort(orderBy); // Toggle current sort direction
              }}
            >
              Toggle Order ({order === "asc" ? "Descending" : "Ascending"})
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {searchQuery && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Showing {filteredCount} results matching "{searchQuery}"
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
              overflow: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              "& .MuiTableRow-root:hover": {
                backgroundColor: HOVER_COLOR,
              },
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f0f8ff" }}>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "user.userId"}
                      direction={orderBy === "user.userId" ? order : "asc"}
                      onClick={() => handleRequestSort("user.userId")}
                    >
                      User ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ width: "25%" }}>
                    <TableSortLabel
                      active={orderBy === "subconcept.subconceptDesc"}
                      direction={
                        orderBy === "subconcept.subconceptDesc" ? order : "asc"
                      }
                      onClick={() =>
                        handleRequestSort("subconcept.subconceptDesc")
                      }
                    >
                      Topic
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>References</TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === "subconcept.subconceptMaxscore"}
                      direction={
                        orderBy === "subconcept.subconceptMaxscore"
                          ? order
                          : "asc"
                      }
                      onClick={() =>
                        handleRequestSort("subconcept.subconceptMaxscore")
                      }
                    >
                      Max Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "submittedDate"}
                      direction={orderBy === "submittedDate" ? order : "asc"}
                      onClick={() => handleRequestSort("submittedDate")}
                    >
                      Submitted Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Submitted File</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "score"}
                      direction={orderBy === "score" ? order : "asc"}
                      onClick={() => handleRequestSort("score")}
                    >
                      <span>
                        Score <span style={{ color: "red" }}>*</span>
                      </span>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <span>
                      Remarks <span style={{ color: "red" }}>*</span>
                    </span>
                  </TableCell>
                  <TableCell>Correction File</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "correctedDate"}
                      direction={orderBy === "correctedDate" ? order : "asc"}
                      onClick={() => handleRequestSort("correctedDate")}
                    >
                      Date of Correction
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentAssignments.map((assignment) => (
                  <AssignmentRow
                    key={assignment.assignmentId}
                    assignment={assignment}
                    editedAssignments={editedAssignments}
                    onScoreChange={handleScoreChange}
                    onRemarksChange={handleRemarksChange}
                    onFileChange={handleFileChange}
                    onCorrectedDateChange={handleCorrectedDateChange}
                    onSubmitCorrection={memoizedHandleSubmitCorrection}
                    formatDateTime={memoizedFormatDateTime}
                    handleOpenContent={memoizedHandleOpenContent}
                    updating={updating}
                    fieldErrors={fieldErrors[assignment.assignmentId] || {}}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={filteredAssignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  m: 0,
                },
            }}
          />
        </>
      )}

      {/* Content Dialog */}
      <Dialog
        open={contentDialog.open}
        onClose={handleCloseContent}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" component="span">
              {contentDialog.title}
            </Typography>
            {contentDialog.link && (
              <Tooltip title="Open resource link">
                <IconButton
                  component="a"
                  href={contentDialog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="body1"
            component="div"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {contentDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContent} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AssignmentsTable;