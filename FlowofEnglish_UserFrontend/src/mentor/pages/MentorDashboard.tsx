import React, { useEffect, useMemo, useState } from "react";
import { Container, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, 
  Box, CircularProgress, Alert, IconButton, Chip, Avatar, Stack, LinearProgress} from "@mui/material";
import { TrendingUp, Users, UserX, Clock, Search, RefreshCw, Play, Square, FileText, BarChart} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import { fetchMentorCohortProgress, fetchLearnerSessionActivity, fetchMentorCohorts } from '@/lib/mentor-api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Styled components for better UI - FIXED WIDTH
const StatCard = ({ title, value, subtitle, icon, color = "primary", progress }: any) => (
  <Card
    sx={{
      height: '100%',
      minHeight: '180px', // Fixed minimum height
      background: `linear-gradient(135deg, ${color}.light, ${color}.lighter)`,
      border: `1px solid ${color}.100`,
      borderRadius: 3,
      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
      }
    }}
  >
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ flex: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" fontWeight="bold" color={`${color}.dark`} sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Typography 
            variant="h6" 
            color={`${color}.dark`} 
            fontWeight="medium"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em' // Reserve space for 2 lines
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color={`${color}.main`} sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: `${color}.50`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: `${color}.main`,
                    borderRadius: 4
                  }
                }} 
              />
              <Typography variant="caption" color={`${color}.main`} sx={{ mt: 0.5, display: 'block' }}>
                {progress.toFixed(0)}% progress
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: `${color}.50`,
            color: `${color}.main`,
            flexShrink: 0
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const StatusChip = ({ status }: { status: string }) => (
  <Chip
    label={status}
    size="small"
    color={status === "ACTIVE" ? "success" : "error"}
    variant="filled"
    sx={{
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '0.75rem'
    }}
  />
);

const formatLastActivity = (timestamp?: string | null) => {
  if (!timestamp) return "Never logged in";
  const date = new Date(timestamp);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  const formattedTime = format(date, "hh:mm a");
  return `${relativeTime} at ${formattedTime}`;
};

// Calculate duration between start and end time
const calculateDuration = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return "—";
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs < 0) return "Invalid";
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  } catch (error) {
    return "—";
  }
};

const getLatestSessionForUser = (sessions?: any[]) => {
  if (!sessions || sessions.length === 0) return null;

  const valid = sessions
    .map((s) => ({
      ...s,
      endTs: s.sessionEndTimestamp ? new Date(s.sessionEndTimestamp) : null,
      startTs: s.sessionStartTimestamp ? new Date(s.sessionStartTimestamp) : null,
    }))
    .filter((s) => s.endTs || s.startTs);

  if (valid.length === 0) return null;

  valid.sort((a, b) => {
    const aTime = a.endTs ? a.endTs.getTime() : a.startTs.getTime();
    const bTime = b.endTs ? b.endTs.getTime() : b.startTs.getTime();
    return bTime - aTime;
  });

  return valid[0];
};

export default function MentorDashboardClean() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const { user } = useUserContext();
  const mentorId = user?.userId ?? "";
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [cohortMeta, setCohortMeta] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  
  // New state for cohort progress and assignments
  const [cohortProgress, setCohortProgress] = useState<any[]>([]);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [overallCohortProgress, setOverallCohortProgress] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [programId, setProgramId] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get programId from localStorage on component mount
  useEffect(() => {
    const getProgramIdFromStorage = () => {
      try {
        const selectedCohortStr = localStorage.getItem("selectedCohortWithProgram");
        if (selectedCohortStr) {
          const selectedCohort = JSON.parse(selectedCohortStr);
          if (selectedCohort?.program?.programId) {
            return selectedCohort.program.programId;
          }
        }
        
        if (cohortMeta?.program?.programId) {
          return cohortMeta.program.programId;
        }
        
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData?.selectedProgramId) {
            return userData.selectedProgramId;
          }
        }
        
        return "";
      } catch (error) {
        console.error("Error getting programId from storage:", error);
        return "";
      }
    };

    const programIdFromStorage = getProgramIdFromStorage();
    if (programIdFromStorage) {
      setProgramId(programIdFromStorage);
    }
  }, [cohortMeta]);

  useEffect(() => {
    if (!cohortId || !mentorId) {
      setError("Missing cohortId or mentorId. Please re-select your cohort.");
      return;
    }
    fetchData();
  }, [cohortId, mentorId]);

  useEffect(() => {
    if (programId && cohortId && mentorId) {
      fetchCohortProgress();
    }
  }, [programId, cohortId, mentorId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the existing API function from mentor-api.ts
      const sessionData = await fetchLearnerSessionActivity(cohortId!, mentorId);
      
      // Also fetch cohort metadata
      const resp = await fetch(
        `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(cohortId!)}/mentor/${encodeURIComponent(mentorId)}`,
        { credentials: "include" }
      );

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      setOrganization(data.organization ?? null);
      setCohortMeta(data.cohort ?? null);

      if (data.cohort?.program?.programId && !programId) {
        setProgramId(data.cohort.program.programId);
      }

      const fetchedUsers: any[] = Array.isArray(data.users) ? data.users : [];
      const mapped = fetchedUsers.map((u) => {
        const latest = getLatestSessionForUser(u.recentSessions);
        const latestTs =
          latest?.sessionEndTimestamp ?? latest?.sessionStartTimestamp ?? null;
        return {
          ...u,
          latestSession: latest ?? null,
          latestTimestamp: latestTs,
        };
      });

      // FIXED SORTING: Latest activity first, DISABLED users at bottom with light grey
      mapped.sort((a, b) => {
        const aStatus = (a.status ?? "").toUpperCase();
        const bStatus = (b.status ?? "").toUpperCase();
        
        // DISABLED users go to bottom
        if (aStatus === "DISABLED" && bStatus !== "DISABLED") return 1;
        if (bStatus === "DISABLED" && aStatus !== "DISABLED") return -1;
        
        // Within same status group, sort by latest activity
        if (!a.latestTimestamp && !b.latestTimestamp) return 0;
        if (!a.latestTimestamp) return 1;
        if (!b.latestTimestamp) return -1;
        return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
      });

      setUsers(mapped);
    } catch (err: any) {
      console.error("Mentor dashboard fetch error:", err);
      setError(err?.message ?? "Failed to load mentor cohort data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCohortProgress = async () => {
    if (!cohortId || !mentorId || !programId) {
      console.log("Missing required parameters for progress fetch:", { cohortId, mentorId, programId });
      return;
    }
    
    setLoadingProgress(true);
    try {
      // Use the existing API function from mentor-api.ts
      const progressData = await fetchMentorCohortProgress(mentorId, programId, cohortId!);
      setCohortProgress(progressData);
      
      // Calculate overall cohort progress
      if (progressData && progressData.length > 0) {
        const totalSubconcepts = progressData.reduce((sum: number, user: any) => sum + (user.totalSubconcepts || 0), 0);
        const completedSubconcepts = progressData.reduce((sum: number, user: any) => sum + (user.completedSubconcepts || 0), 0);
        
        const overallProgress = totalSubconcepts > 0 ? (completedSubconcepts / totalSubconcepts) * 100 : 0;
        
        setOverallCohortProgress(parseFloat(overallProgress.toFixed(1)));
      }
      
      // Fetch assignments count using the new API function
      const cohortsData = await fetchMentorCohorts(mentorId);
      if (cohortsData.assignmentStatistics?.cohortDetails?.[cohortId!]) {
        const pendingAssignments = cohortsData.assignmentStatistics.cohortDetails[cohortId!].pendingAssignments || 0;
        setAssignmentsCount(pendingAssignments);
      }
      
    } catch (err: any) {
      console.error("Error fetching cohort progress:", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    fetchCohortProgress();
  };

  // derived stats
  const totals = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status ?? "").toUpperCase() === "ACTIVE").length;
    const deactivated = total - active;
    return { total, active, deactivated };
  }, [users]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    return filtered;
  }, [users, searchTerm, statusFilter]);

  const paginated = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date function
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp * 1000);
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Cohort Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {cohortMeta?.cohortName || "Loading..."} • {formatDate(cohortMeta?.cohortStartDate)} - {formatDate(cohortMeta?.cohortEndDate)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle1" color="text.primary">
              {organization?.organizationName || "Organization"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Program: {cohortMeta?.program?.programName || programId || "Loading..."}
            </Typography>
          </Box>
          
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing || loadingProgress}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshCw className={refreshing || loadingProgress ? "animate-spin" : ""} size={20} />
          </IconButton>
        </Stack>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards - FIXED GRID */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Learners"
                value={totals.total}
                subtitle="All users in cohort"
                icon={<Users size={24} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Learners"
                value={totals.active}
                subtitle="Currently active"
                icon={<TrendingUp size={24} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Assignments for Review"
                value={assignmentsCount}
                subtitle="Pending assignments"
                icon={<FileText size={24} />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Cohort Progress"
                value={`${overallCohortProgress}%`}
                subtitle="Overall completion"
                icon={<BarChart size={24} />}
                color="info"
                progress={overallCohortProgress}
              />
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', flex: 1 }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search learners by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </Box>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '140px'
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </Stack>
          </Paper>

          {/* Learners Table */}
          <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Learners Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {paginated.length} of {filteredUsers.length} learners
              </Typography>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Learner</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Last Activity</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length > 0 ? (
                    paginated.map((u) => {
                      const latestSession = u.latestSession;
                      const duration = latestSession ?
                        calculateDuration(latestSession.sessionStartTimestamp, latestSession.sessionEndTimestamp) 
                        : "—";
                      
                      const isDisabled = (u.status ?? "").toUpperCase() === "DISABLED";
                      
                      return (
                        <TableRow 
                          key={u.userId}
                          sx={{ 
                            transition: 'all 0.2s ease',
                            opacity: isDisabled ? 0.5 : 1, // Light grey for DISABLED
                            '&:hover': {
                              backgroundColor: isDisabled ? 'grey.50' : 'grey.100',
                            }
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  bgcolor: u.status === "ACTIVE" ? 'success.main' : 'error.main',
                                  width: 40,
                                  height: 40,
                                  opacity: isDisabled ? 0.6 : 1
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold" color="white">
                                  {u.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </Typography>
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {u.userName || "—"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {u.userId}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={u.status || "UNKNOWN"} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Clock size={16} color="#6B7280" />
                              <Typography variant="body2">
                                {u.latestTimestamp
                                  ? formatLastActivity(u.latestTimestamp)
                                  : "Never logged in"}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {duration !== "—" ? (
                                <>
                                  <Play size={16} color="#10B981" />
                                  <Typography variant="body2" color="text.primary" fontWeight="medium">
                                    {duration}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Square size={16} color="#6B7280" />
                                  <Typography variant="body2" color="text.secondary">
                                    {duration}
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Users size={48} color="#9CA3AF" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                          No learners found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search or filters
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid',
                borderColor: 'grey.200',
                mt: 2
              }}
            />
          </Paper>
        </>
      )}
    </Container>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import { Container, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Paper, TablePagination, Box, CircularProgress, Alert, IconButton, Chip, Avatar, Stack
// } from "@mui/material";
// import { TrendingUp, Users, UserX, Clock, Search, RefreshCw, Play, Square} from "lucide-react";
// import axios from "axios";
// import { formatDistanceToNow, format } from "date-fns";
// import { useParams } from "react-router-dom";
// import { useUserContext } from "../../context/AuthContext";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// // Styled components for better UI
// const StatCard = ({ title, value, subtitle, icon, color = "primary" }: any) => (
//   <Card
//     sx={{
//       height: '100%',
//       background: `linear-gradient(135deg, ${color}.light, ${color}.lighter)`,
//       border: `1px solid ${color}.100`,
//       borderRadius: 3,
//       boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//       transition: 'all 0.3s ease-in-out',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
//       }
//     }}
//   >
//     <CardContent sx={{ p: 3 }}>
//       <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
//         <Box>
//           <Typography variant="h3" fontWeight="bold" color={`${color}.dark`}>
//             {value}
//           </Typography>
//           <Typography variant="h6" color={`${color}.dark`} fontWeight="medium">
//             {title}
//           </Typography>
//           {subtitle && (
//             <Typography variant="caption" color={`${color}.main`}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Box
//           sx={{
//             p: 2,
//             borderRadius: 3,
//             bgcolor: `${color}.50`,
//             color: `${color}.main`,
//           }}
//         >
//           {icon}
//         </Box>
//       </Stack>
//     </CardContent>
//   </Card>
// );

// const StatusChip = ({ status }: { status: string }) => (
//   <Chip
//     label={status}
//     size="small"
//     color={status === "ACTIVE" ? "success" : "error"}
//     variant="filled"
//     sx={{
//       fontWeight: 'bold',
//       textTransform: 'uppercase',
//       fontSize: '0.75rem'
//     }}
//   />
// );

// const formatLastActivity = (timestamp?: string | null) => {
//   if (!timestamp) return "Never logged in";
//   const date = new Date(timestamp);
//   const relativeTime = formatDistanceToNow(date, { addSuffix: true });
//   const formattedTime = format(date, "hh:mm a");
//   return `${relativeTime} at ${formattedTime}`;
// };

// // Calculate duration between start and end time
// const calculateDuration = (startTime?: string, endTime?: string) => {
//   if (!startTime || !endTime) return "—";
  
//   try {
//     const start = new Date(startTime);
//     const end = new Date(endTime);
//     const durationMs = end.getTime() - start.getTime();
    
//     if (durationMs < 0) return "Invalid";
    
//     const hours = Math.floor(durationMs / (1000 * 60 * 60));
//     const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${seconds}s`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${seconds}s`;
//     } else {
//       return `${seconds}s`;
//     }
//   } catch (error) {
//     return "—";
//   }
// };

// const getLatestSessionForUser = (sessions?: any[]) => {
//   if (!sessions || sessions.length === 0) return null;

//   const valid = sessions
//     .map((s) => ({
//       ...s,
//       endTs: s.sessionEndTimestamp ? new Date(s.sessionEndTimestamp) : null,
//       startTs: s.sessionStartTimestamp ? new Date(s.sessionStartTimestamp) : null,
//     }))
//     .filter((s) => s.endTs || s.startTs);

//   if (valid.length === 0) return null;

//   valid.sort((a, b) => {
//     const aTime = a.endTs ? a.endTs.getTime() : a.startTs.getTime();
//     const bTime = b.endTs ? b.endTs.getTime() : b.startTs.getTime();
//     return bTime - aTime;
//   });

//   return valid[0];
// };

// export default function MentorDashboardClean() {
//   const { cohortId } = useParams<{ cohortId: string }>();
//   const { user } = useUserContext();
//   const mentorId = user?.userId ?? "";
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [organization, setOrganization] = useState<any | null>(null);
//   const [cohortMeta, setCohortMeta] = useState<any | null>(null);
//   const [users, setUsers] = useState<any[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

//   // Pagination
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     if (!cohortId || !mentorId) {
//       setError("Missing cohortId or mentorId. Please re-select your cohort.");
//       return;
//     }
//     fetchData();
//   }, [cohortId, mentorId]);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await axios.get(
//         `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(
//           cohortId
//         )}/mentor/${encodeURIComponent(mentorId)}`,
//         { withCredentials: true }
//       );

//       const data = resp.data ?? {};
//       setOrganization(data.organization ?? null);
//       setCohortMeta(data.cohort ?? null);

//       const fetchedUsers: any[] = Array.isArray(data.users) ? data.users : [];
//       const mapped = fetchedUsers.map((u) => {
//         const latest = getLatestSessionForUser(u.recentSessions);
//         const latestTs =
//           latest?.sessionEndTimestamp ?? latest?.sessionStartTimestamp ?? null;
//         return {
//           ...u,
//           latestSession: latest ?? null,
//           latestTimestamp: latestTs,
//         };
//       });

//       mapped.sort((a, b) => {
//         if (!a.latestTimestamp && !b.latestTimestamp) return 0;
//         if (!a.latestTimestamp) return 1;
//         if (!b.latestTimestamp) return -1;
//         return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
//       });

//       setUsers(mapped);
//     } catch (err: any) {
//       console.error("Mentor dashboard fetch error:", err);
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load mentor cohort data."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   // derived stats
//   const totals = useMemo(() => {
//     const total = users.length;
//     const active = users.filter((u) => (u.status ?? "").toUpperCase() === "ACTIVE").length;
//     const deactivated = total - active;
//     return { total, active, deactivated };
//   }, [users]);

//   // Filter and search users
//   const filteredUsers = useMemo(() => {
//     let filtered = users.filter(user =>
//       user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (statusFilter !== "ALL") {
//       filtered = filtered.filter(user => user.status === statusFilter);
//     }

//     return filtered;
//   }, [users, searchTerm, statusFilter]);

//   const paginated = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handleChangePage = (_: any, newPage: number) => setPage(newPage);
//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" gutterBottom>
//               Cohort Dashboard
//             </Typography>
//             <Typography variant="h6" color="text.secondary">
//               {cohortMeta?.cohortName || "Loading..."} • {organization?.organizationName || ""}
//             </Typography>
//           </Box>
//           <IconButton
//             onClick={handleRefresh}
//             disabled={refreshing}
//             sx={{
//               bgcolor: 'primary.main',
//               color: 'white',
//               '&:hover': { bgcolor: 'primary.dark' },
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <RefreshCw className={refreshing ? "animate-spin" : ""} size={20} />
//           </IconButton>
//         </Stack>
//       </Box>

//       {loading && (
//         <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
//           <CircularProgress />
//         </Box>
//       )}

//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//       )}

//       {!loading && !error && (
//         <>
//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Total Learners"
//                 value={totals.total}
//                 subtitle="All users in cohort"
//                 icon={<Users size={24} />}
//                 color="primary"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Active Learners"
//                 value={totals.active}
//                 subtitle="Currently active"
//                 icon={<TrendingUp size={24} />}
//                 color="success"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Deactivated"
//                 value={totals.deactivated}
//                 subtitle="Disabled users"
//                 icon={<UserX size={24} />}
//                 color="error"
//               />
//             </Grid>
//           </Grid>

//           {/* Search and Filters */}
//           <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
//             <Stack direction="row" spacing={2} alignItems="center">
//               <Box sx={{ position: 'relative', flex: 1 }}>
//                 <Search
//                   size={20}
//                   style={{
//                     position: 'absolute',
//                     left: 12,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     color: '#6B7280'
//                   }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search learners by name or ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '12px 12px 12px 40px',
//                     border: '1px solid #E5E7EB',
//                     borderRadius: '8px',
//                     fontSize: '14px',
//                     outline: 'none',
//                     transition: 'all 0.3s ease',
//                     ':focus': {
//                       borderColor: '#3B82F6',
//                       boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
//                     }
//                   }}
//                 />
//               </Box>
              
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 style={{
//                   padding: '12px 16px',
//                   border: '1px solid #E5E7EB',
//                   borderRadius: '8px',
//                   fontSize: '14px',
//                   outline: 'none',
//                   minWidth: '140px'
//                 }}
//               >
//                 <option value="ALL">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="DISABLED">Disabled</option>
//               </select>
//             </Stack>
//           </Paper>

//           {/* Learners Table */}
//           <Paper 
//             sx={{ 
//               p: 3, 
//               borderRadius: 3,
//               boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
//               <Typography variant="h6" fontWeight="bold">
//                 Learners Activity
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Showing {paginated.length} of {filteredUsers.length} learners
//               </Typography>
//             </Stack>

//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: 'grey.50' }}>
//                     <TableCell><strong>Learner</strong></TableCell>
//                     <TableCell><strong>Status</strong></TableCell>
//                     <TableCell><strong>Last Activity</strong></TableCell>
//                     <TableCell><strong>Duration</strong></TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {paginated.length > 0 ? (
//                     paginated.map((u) => {
//                       const latestSession = u.latestSession;
//                       const duration = latestSession ?
//                         calculateDuration(latestSession.sessionStartTimestamp, latestSession.sessionEndTimestamp) 
//                         : "—";
                      
//                       return (
//                         <TableRow 
//                           key={u.userId}
//                           sx={{ 
//                             transition: 'all 0.2s ease',
//                             '&:hover': {
//                               backgroundColor: 'grey.50',
//                             }
//                           }}
//                         >
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={2}>
//                               <Avatar
//                                 sx={{
//                                   bgcolor: u.status === "ACTIVE" ? 'success.main' : 'error.main',
//                                   width: 40,
//                                   height: 40
//                                 }}
//                               >
//                                 <Typography variant="body2" fontWeight="bold" color="white">
//                                   {u.userName?.charAt(0)?.toUpperCase() || 'U'}
//                                 </Typography>
//                               </Avatar>
//                               <Box>
//                                 <Typography variant="subtitle1" fontWeight="medium">
//                                   {u.userName || "—"}
//                                 </Typography>
//                                 <Typography variant="body2" color="text.secondary">
//                                   {u.userId}
//                                 </Typography>
//                               </Box>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <StatusChip status={u.status || "UNKNOWN"} />
//                           </TableCell>
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={1}>
//                               <Clock size={16} color="#6B7280" />
//                               <Typography variant="body2">
//                                 {u.latestTimestamp
//                                   ? formatLastActivity(u.latestTimestamp)
//                                   : "Never logged in"}
//                               </Typography>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={1}>
//                               {duration !== "—" ? (
//                                 <>
//                                   <Play size={16} color="#10B981" />
//                                   <Typography variant="body2" color="text.primary" fontWeight="medium">
//                                     {duration}
//                                   </Typography>
//                                 </>
//                               ) : (
//                                 <>
//                                   <Square size={16} color="#6B7280" />
//                                   <Typography variant="body2" color="text.secondary">
//                                     {duration}
//                                   </Typography>
//                                 </>
//                               )}
//                             </Stack>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
//                         <Users size={48} color="#9CA3AF" />
//                         <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
//                           No learners found
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Try adjusting your search or filters
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <TablePagination
//               rowsPerPageOptions={[5, 10, 20, 25]}
//               component="div"
//               count={filteredUsers.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               sx={{
//                 borderTop: '1px solid',
//                 borderColor: 'grey.200',
//                 mt: 2
//               }}
//             />
//           </Paper>
//         </>
//       )}
//     </Container>
//   );
// }





// Improved Mentor Dashboard with Enhanced UI/UX

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Container, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Paper, TablePagination, Box, CircularProgress, Alert, IconButton, Chip, Avatar,
//   Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Divider
// } from "@mui/material";
// import {
//   TrendingUp, Users, UserX, Clock, Search, FilterList, Sort,
//   RefreshCw, X, AlertTriangle, CheckCircle2, Calendar, Mail, Phone, MapPin, Play, Square
// } from "lucide-react";
// import axios from "axios";
// import { formatDistanceToNow, format } from "date-fns";
// import { useParams } from "react-router-dom";
// import { useUserContext } from "../../context/AuthContext";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// // Styled components for better UI
// const StatCard = ({ title, value, subtitle, icon, color = "primary" }: any) => (
//   <Card
//     sx={{
//       height: '100%',
//       background: `linear-gradient(135deg, ${color}.light, ${color}.lighter)`,
//       border: `1px solid ${color}.100`,
//       borderRadius: 3,
//       boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//       transition: 'all 0.3s ease-in-out',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
//       }
//     }}
//   >
//     <CardContent sx={{ p: 3 }}>
//       <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
//         <Box>
//           <Typography variant="h3" fontWeight="bold" color={`${color}.dark`}>
//             {value}
//           </Typography>
//           <Typography variant="h6" color={`${color}.dark`} fontWeight="medium">
//             {title}
//           </Typography>
//           {subtitle && (
//             <Typography variant="caption" color={`${color}.main`}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Box
//           sx={{
//             p: 2,
//             borderRadius: 3,
//             bgcolor: `${color}.50`,
//             color: `${color}.main`,
//           }}
//         >
//           {icon}
//         </Box>
//       </Stack>
//     </CardContent>
//   </Card>
// );

// const StatusChip = ({ status }: { status: string }) => (
//   <Chip
//     label={status}
//     size="small"
//     color={status === "ACTIVE" ? "success" : "error"}
//     variant="filled"
//     sx={{
//       fontWeight: 'bold',
//       textTransform: 'uppercase',
//       fontSize: '0.75rem'
//     }}
//   />
// );

// const formatLastActivity = (timestamp?: string | null) => {
//   if (!timestamp) return "Never logged in";
//   const date = new Date(timestamp);
//   const relativeTime = formatDistanceToNow(date, { addSuffix: true });
//   const formattedTime = format(date, "hh:mm a");
//   return `${relativeTime} at ${formattedTime}`;
// };

// // Calculate duration between start and end time
// const calculateDuration = (startTime?: string, endTime?: string) => {
//   if (!startTime || !endTime) return "—";
  
//   try {
//     const start = new Date(startTime);
//     const end = new Date(endTime);
//     const durationMs = end.getTime() - start.getTime();
    
//     if (durationMs < 0) return "Invalid";
    
//     const hours = Math.floor(durationMs / (1000 * 60 * 60));
//     const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${seconds}s`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${seconds}s`;
//     } else {
//       return `${seconds}s`;
//     }
//   } catch (error) {
//     return "—";
//   }
// };

// const getLatestSessionForUser = (sessions?: any[]) => {
//   if (!sessions || sessions.length === 0) return null;

//   const valid = sessions
//     .map((s) => ({
//       ...s,
//       endTs: s.sessionEndTimestamp ? new Date(s.sessionEndTimestamp) : null,
//       startTs: s.sessionStartTimestamp ? new Date(s.sessionStartTimestamp) : null,
//     }))
//     .filter((s) => s.endTs || s.startTs);

//   if (valid.length === 0) return null;

//   valid.sort((a, b) => {
//     const aTime = a.endTs ? a.endTs.getTime() : a.startTs.getTime();
//     const bTime = b.endTs ? b.endTs.getTime() : b.startTs.getTime();
//     return bTime - aTime;
//   });

//   return valid[0];
// };

// export default function MentorDashboardClean() {
//   const { cohortId } = useParams<{ cohortId: string }>();
//   const { user } = useUserContext();
//   const mentorId = user?.userId ?? "";
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [organization, setOrganization] = useState<any | null>(null);
//   const [cohortMeta, setCohortMeta] = useState<any | null>(null);
//   const [users, setUsers] = useState<any[]>([]);
//   const [selectedUser, setSelectedUser] = useState<any | null>(null);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

//   // Pagination
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     if (!cohortId || !mentorId) {
//       setError("Missing cohortId or mentorId. Please re-select your cohort.");
//       return;
//     }
//     fetchData();
//   }, [cohortId, mentorId]);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await axios.get(
//         `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(
//           cohortId
//         )}/mentor/${encodeURIComponent(mentorId)}`,
//         { withCredentials: true }
//       );

//       const data = resp.data ?? {};
//       setOrganization(data.organization ?? null);
//       setCohortMeta(data.cohort ?? null);

//       const fetchedUsers: any[] = Array.isArray(data.users) ? data.users : [];
//       const mapped = fetchedUsers.map((u) => {
//         const latest = getLatestSessionForUser(u.recentSessions);
//         const latestTs =
//           latest?.sessionEndTimestamp ?? latest?.sessionStartTimestamp ?? null;
//         return {
//           ...u,
//           latestSession: latest ?? null,
//           latestTimestamp: latestTs,
//         };
//       });

//       mapped.sort((a, b) => {
//         if (!a.latestTimestamp && !b.latestTimestamp) return 0;
//         if (!a.latestTimestamp) return 1;
//         if (!b.latestTimestamp) return -1;
//         return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
//       });

//       setUsers(mapped);
//     } catch (err: any) {
//       console.error("Mentor dashboard fetch error:", err);
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load mentor cohort data."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   // derived stats
//   const totals = useMemo(() => {
//     const total = users.length;
//     const active = users.filter((u) => (u.status ?? "").toUpperCase() === "ACTIVE").length;
//     const deactivated = total - active;
//     return { total, active, deactivated };
//   }, [users]);

//   // Filter and search users
//   const filteredUsers = useMemo(() => {
//     let filtered = users.filter(user =>
//       user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (statusFilter !== "ALL") {
//       filtered = filtered.filter(user => user.status === statusFilter);
//     }

//     return filtered;
//   }, [users, searchTerm, statusFilter]);

//   const paginated = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handleChangePage = (_: any, newPage: number) => setPage(newPage);
//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleUserClick = (user: any) => {
//     setSelectedUser(user);
//     setShowUserModal(true);
//   };

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" gutterBottom>
//               Cohort Dashboard
//             </Typography>
//             <Typography variant="h6" color="text.secondary">
//               {cohortMeta?.cohortName || "Loading..."} • {organization?.organizationName || ""}
//             </Typography>
//           </Box>
//           <IconButton
//             onClick={handleRefresh}
//             disabled={refreshing}
//             sx={{
//               bgcolor: 'primary.main',
//               color: 'white',
//               '&:hover': { bgcolor: 'primary.dark' },
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <RefreshCw className={refreshing ? "animate-spin" : ""} size={20} />
//           </IconButton>
//         </Stack>
//       </Box>

//       {loading && (
//         <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
//           <CircularProgress />
//         </Box>
//       )}

//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//       )}

//       {!loading && !error && (
//         <>
//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Total Learners"
//                 value={totals.total}
//                 subtitle="All users in cohort"
//                 icon={<Users size={24} />}
//                 color="primary"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Active Learners"
//                 value={totals.active}
//                 subtitle="Currently active"
//                 icon={<TrendingUp size={24} />}
//                 color="success"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Deactivated"
//                 value={totals.deactivated}
//                 subtitle="Disabled users"
//                 icon={<UserX size={24} />}
//                 color="error"
//               />
//             </Grid>
//           </Grid>

//           {/* Search and Filters */}
//           <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
//             <Stack direction="row" spacing={2} alignItems="center">
//               <Box sx={{ position: 'relative', flex: 1 }}>
//                 <Search
//                   size={20}
//                   style={{
//                     position: 'absolute',
//                     left: 12,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     color: '#6B7280'
//                   }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search learners by name or ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '12px 12px 12px 40px',
//                     border: '1px solid #E5E7EB',
//                     borderRadius: '8px',
//                     fontSize: '14px',
//                     outline: 'none',
//                     transition: 'all 0.3s ease',
//                     ':focus': {
//                       borderColor: '#3B82F6',
//                       boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
//                     }
//                   }}
//                 />
//               </Box>
              
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 style={{
//                   padding: '12px 16px',
//                   border: '1px solid #E5E7EB',
//                   borderRadius: '8px',
//                   fontSize: '14px',
//                   outline: 'none',
//                   minWidth: '140px'
//                 }}
//               >
//                 <option value="ALL">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="DISABLED">Disabled</option>
//               </select>
//             </Stack>
//           </Paper>

//           {/* Learners Table */}
//           <Paper 
//             sx={{ 
//               p: 3, 
//               borderRadius: 3,
//               boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
//               <Typography variant="h6" fontWeight="bold">
//                 Learners Activity
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Showing {paginated.length} of {filteredUsers.length} learners
//               </Typography>
//             </Stack>

//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: 'grey.50' }}>
//                     <TableCell><strong>Learner</strong></TableCell>
//                     <TableCell><strong>Status</strong></TableCell>
//                     <TableCell><strong>Last Activity</strong></TableCell>
//                     <TableCell><strong>Duration</strong></TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {paginated.length > 0 ? (
//                     paginated.map((u) => {
//                       const latestSession = u.latestSession;
//                       const duration = latestSession ? 
//                         calculateDuration(latestSession.sessionStartTimestamp, latestSession.sessionEndTimestamp) 
//                         : "—";
                      
//                       return (
//                         <TableRow 
//                           key={u.userId}
//                           sx={{ 
//                             cursor: 'pointer',
//                             transition: 'all 0.2s ease',
//                             '&:hover': {
//                               backgroundColor: 'primary.50',
//                               transform: 'scale(1.01)'
//                             }
//                           }}
//                           onClick={() => handleUserClick(u)}
//                         >
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={2}>
//                               <Avatar
//                                 sx={{
//                                   bgcolor: u.status === "ACTIVE" ? 'success.main' : 'error.main',
//                                   width: 40,
//                                   height: 40
//                                 }}
//                               >
//                                 <Typography variant="body2" fontWeight="bold" color="white">
//                                   {u.userName?.charAt(0)?.toUpperCase() || 'U'}
//                                 </Typography>
//                               </Avatar>
//                               <Box>
//                                 <Typography variant="subtitle1" fontWeight="medium">
//                                   {u.userName || "—"}
//                                 </Typography>
//                                 <Typography variant="body2" color="text.secondary">
//                                   {u.userId}
//                                 </Typography>
//                               </Box>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <StatusChip status={u.status || "UNKNOWN"} />
//                           </TableCell>
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={1}>
//                               <Clock size={16} color="#6B7280" />
//                               <Typography variant="body2">
//                                 {u.latestTimestamp
//                                   ? formatLastActivity(u.latestTimestamp)
//                                   : "Never logged in"}
//                               </Typography>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Stack direction="row" alignItems="center" spacing={1}>
//                               {duration !== "—" ? (
//                                 <>
//                                   <Play size={16} color="#10B981" />
//                                   <Typography variant="body2" color="text.primary" fontWeight="medium">
//                                     {duration}
//                                   </Typography>
//                                 </>
//                               ) : (
//                                 <>
//                                   <Square size={16} color="#6B7280" />
//                                   <Typography variant="body2" color="text.secondary">
//                                     {duration}
//                                   </Typography>
//                                 </>
//                               )}
//                             </Stack>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
//                         <Users size={48} color="#9CA3AF" />
//                         <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
//                           No learners found
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Try adjusting your search or filters
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <TablePagination
//               rowsPerPageOptions={[5, 10, 20, 25]}
//               component="div"
//               count={filteredUsers.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               sx={{
//                 borderTop: '1px solid',
//                 borderColor: 'grey.200',
//                 mt: 2
//               }}
//             />
//           </Paper>
//         </>
//       )}

//       {/* User Details Modal */}
//       <Dialog
//         open={showUserModal}
//         onClose={() => setShowUserModal(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
//             overflow: 'hidden'
//           }
//         }}
//       >
//         {selectedUser && (
//           <>
//             <DialogTitle
//               sx={{
//                 background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
//                 color: 'white',
//                 py: 3
//               }}
//             >
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography variant="h5" fontWeight="bold">
//                     Learner Details
//                   </Typography>
//                   <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
//                     {selectedUser.userId}
//                   </Typography>
//                 </Box>
//                 <IconButton
//                   onClick={() => setShowUserModal(false)}
//                   sx={{ color: 'white' }}
//                 >
//                   <X size={24} />
//                 </IconButton>
//               </Stack>
//             </DialogTitle>

//             <DialogContent sx={{ p: 0 }}>
//               <Stack spacing={4} sx={{ p: 4 }}>
//                 {/* Basic Information */}
//                 <Box>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     Basic Information
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} sm={6}>
//                       <Stack direction="row" spacing={2} alignItems="center">
//                         <Avatar
//                           sx={{
//                             bgcolor: selectedUser.status === "ACTIVE" ? 'success.main' : 'error.main',
//                             width: 60,
//                             height: 60
//                           }}
//                         >
//                           <Typography variant="h6" fontWeight="bold" color="white">
//                             {selectedUser.userName?.charAt(0)?.toUpperCase() || 'U'}
//                           </Typography>
//                         </Avatar>
//                         <Box>
//                           <Typography variant="h6" fontWeight="bold">
//                             {selectedUser.userName || "—"}
//                           </Typography>
//                           <StatusChip status={selectedUser.status || "UNKNOWN"} />
//                         </Box>
//                       </Stack>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={1}>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Mail size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userEmail || "No email provided"}
//                           </Typography>
//                         </Stack>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Phone size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userPhoneNumber || "No phone provided"}
//                           </Typography>
//                         </Stack>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <MapPin size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userAddress || "No address provided"}
//                           </Typography>
//                         </Stack>
//                       </Stack>
//                     </Grid>
//                   </Grid>
//                 </Box>

//                 <Divider />

//                 {/* Activity Information */}
//                 <Box>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     Activity Information
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={2}>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Last Activity
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {selectedUser.latestTimestamp
//                               ? formatLastActivity(selectedUser.latestTimestamp)
//                               : "Never logged in"}
//                           </Typography>
//                         </Box>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             User Type
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {selectedUser.userType || "Learner"}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={2}>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Cohort
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {cohortMeta?.cohortName || "—"}
//                           </Typography>
//                         </Box>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Organization
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {organization?.organizationName || "—"}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Grid>
//                   </Grid>
//                 </Box>

//                 {/* Session Details */}
//                 {selectedUser.latestSession && (
//                   <>
//                     <Divider />
//                     <Box>
//                       <Typography variant="h6" fontWeight="bold" gutterBottom>
//                         Latest Session
//                       </Typography>
//                       <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//                         <Stack spacing={1}>
//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Session ID:
//                             </Typography>
//                             <Typography variant="body2" fontWeight="medium">
//                               {selectedUser.latestSession.sessionId}
//                             </Typography>
//                           </Stack>
//                           {selectedUser.latestSession.sessionStartTimestamp && (
//                             <Stack direction="row" justifyContent="space-between">
//                               <Typography variant="body2" color="text.secondary">
//                                 Started:
//                               </Typography>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {format(new Date(selectedUser.latestSession.sessionStartTimestamp), "PPpp")}
//                               </Typography>
//                             </Stack>
//                           )}
//                           {selectedUser.latestSession.sessionEndTimestamp && (
//                             <Stack direction="row" justifyContent="space-between">
//                               <Typography variant="body2" color="text.secondary">
//                                 Ended:
//                               </Typography>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {format(new Date(selectedUser.latestSession.sessionEndTimestamp), "PPpp")}
//                               </Typography>
//                             </Stack>
//                           )}
//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Duration:
//                             </Typography>
//                             <Typography variant="body2" fontWeight="medium">
//                               {calculateDuration(
//                                 selectedUser.latestSession.sessionStartTimestamp,
//                                 selectedUser.latestSession.sessionEndTimestamp
//                               )}
//                             </Typography>
//                           </Stack>
//                         </Stack>
//                       </Paper>
//                     </Box>
//                   </>
//                 )}
//               </Stack>
//             </DialogContent>

//             <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'grey.200' }}>
//               <Button
//                 onClick={() => setShowUserModal(false)}
//                 variant="outlined"
//                 sx={{ borderRadius: 2, textTransform: 'none' }}
//               >
//                 Close
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </Container>
//   );
// }








// sencond model of dashboard with improved UI and UX

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Container, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Paper, TablePagination, Box, CircularProgress, Alert, IconButton, Chip, Avatar,
//   Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Divider
// } from "@mui/material";
// import {
//   TrendingUp, Users, UserX, Clock, Search, FilterList, Sort,
//   RefreshCw, X, AlertTriangle, CheckCircle2, Calendar, Mail, Phone, MapPin
// } from "lucide-react";
// import axios from "axios";
// import { formatDistanceToNow, format } from "date-fns";
// import { useParams } from "react-router-dom";
// import { useUserContext } from "../../context/AuthContext";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// // Styled components for better UI
// const StatCard = ({ title, value, subtitle, icon, color = "primary" }: any) => (
//   <Card
//     sx={{
//       height: '100%',
//       background: `linear-gradient(135deg, ${color}.light, ${color}.lighter)`,
//       border: `1px solid ${color}.100`,
//       borderRadius: 3,
//       boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//       transition: 'all 0.3s ease-in-out',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
//       }
//     }}
//   >
//     <CardContent sx={{ p: 3 }}>
//       <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
//         <Box>
//           <Typography variant="h3" fontWeight="bold" color={`${color}.dark`}>
//             {value}
//           </Typography>
//           <Typography variant="h6" color={`${color}.dark`} fontWeight="medium">
//             {title}
//           </Typography>
//           {subtitle && (
//             <Typography variant="caption" color={`${color}.main`}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Box
//           sx={{
//             p: 2,
//             borderRadius: 3,
//             bgcolor: `${color}.50`,
//             color: `${color}.main`,
//           }}
//         >
//           {icon}
//         </Box>
//       </Stack>
//     </CardContent>
//   </Card>
// );

// const StatusChip = ({ status }: { status: string }) => (
//   <Chip
//     label={status}
//     size="small"
//     color={status === "ACTIVE" ? "success" : "error"}
//     variant="filled"
//     sx={{
//       fontWeight: 'bold',
//       textTransform: 'uppercase',
//       fontSize: '0.75rem'
//     }}
//   />
// );

// const formatLastActivity = (timestamp?: string | null) => {
//   if (!timestamp) return "Never logged in";
//   const date = new Date(timestamp);
//   const relativeTime = formatDistanceToNow(date, { addSuffix: true });
//   const formattedTime = format(date, "hh:mm a");
//   return `${relativeTime} at ${formattedTime}`;
// };

// const getLatestSessionForUser = (sessions?: any[]) => {
//   if (!sessions || sessions.length === 0) return null;

//   const valid = sessions
//     .map((s) => ({
//       ...s,
//       endTs: s.sessionEndTimestamp ? new Date(s.sessionEndTimestamp) : null,
//       startTs: s.sessionStartTimestamp ? new Date(s.sessionStartTimestamp) : null,
//     }))
//     .filter((s) => s.endTs || s.startTs);

//   if (valid.length === 0) return null;

//   valid.sort((a, b) => {
//     const aTime = a.endTs ? a.endTs.getTime() : a.startTs.getTime();
//     const bTime = b.endTs ? b.endTs.getTime() : b.startTs.getTime();
//     return bTime - aTime;
//   });

//   return valid[0];
// };

// export default function MentorDashboardClean() {
//   const { cohortId } = useParams<{ cohortId: string }>();
//   const { user } = useUserContext();
//   const mentorId = user?.userId ?? "";
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [organization, setOrganization] = useState<any | null>(null);
//   const [cohortMeta, setCohortMeta] = useState<any | null>(null);
//   const [users, setUsers] = useState<any[]>([]);
//   const [selectedUser, setSelectedUser] = useState<any | null>(null);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

//   // Pagination
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     if (!cohortId || !mentorId) {
//       setError("Missing cohortId or mentorId. Please re-select your cohort.");
//       return;
//     }
//     fetchData();
//   }, [cohortId, mentorId]);

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await axios.get(
//         `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(
//           cohortId
//         )}/mentor/${encodeURIComponent(mentorId)}`,
//         { withCredentials: true }
//       );

//       const data = resp.data ?? {};
//       setOrganization(data.organization ?? null);
//       setCohortMeta(data.cohort ?? null);

//       const fetchedUsers: any[] = Array.isArray(data.users) ? data.users : [];
//       const mapped = fetchedUsers.map((u) => {
//         const latest = getLatestSessionForUser(u.recentSessions);
//         const latestTs =
//           latest?.sessionEndTimestamp ?? latest?.sessionStartTimestamp ?? null;
//         return {
//           ...u,
//           latestSession: latest ?? null,
//           latestTimestamp: latestTs,
//         };
//       });

//       mapped.sort((a, b) => {
//         if (!a.latestTimestamp && !b.latestTimestamp) return 0;
//         if (!a.latestTimestamp) return 1;
//         if (!b.latestTimestamp) return -1;
//         return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
//       });

//       setUsers(mapped);
//     } catch (err: any) {
//       console.error("Mentor dashboard fetch error:", err);
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load mentor cohort data."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   // derived stats
//   const totals = useMemo(() => {
//     const total = users.length;
//     const active = users.filter((u) => (u.status ?? "").toUpperCase() === "ACTIVE").length;
//     const deactivated = total - active;
//     return { total, active, deactivated };
//   }, [users]);

//   // Filter and search users
//   const filteredUsers = useMemo(() => {
//     let filtered = users.filter(user =>
//       user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (statusFilter !== "ALL") {
//       filtered = filtered.filter(user => user.status === statusFilter);
//     }

//     return filtered;
//   }, [users, searchTerm, statusFilter]);

//   const paginated = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handleChangePage = (_: any, newPage: number) => setPage(newPage);
//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleUserClick = (user: any) => {
//     setSelectedUser(user);
//     setShowUserModal(true);
//   };

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" gutterBottom>
//               Cohort Dashboard
//             </Typography>
//             <Typography variant="h6" color="text.secondary">
//               {cohortMeta?.cohortName || "Loading..."} • {organization?.organizationName || ""}
//             </Typography>
//           </Box>
//           <IconButton
//             onClick={handleRefresh}
//             disabled={refreshing}
//             sx={{
//               bgcolor: 'primary.main',
//               color: 'white',
//               '&:hover': { bgcolor: 'primary.dark' },
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <RefreshCw className={refreshing ? "animate-spin" : ""} size={20} />
//           </IconButton>
//         </Stack>
//       </Box>

//       {loading && (
//         <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
//           <CircularProgress />
//         </Box>
//       )}

//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//       )}

//       {!loading && !error && (
//         <>
//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 4 }}>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Total Learners"
//                 value={totals.total}
//                 subtitle="All users in cohort"
//                 icon={<Users size={24} />}
//                 color="primary"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Active Learners"
//                 value={totals.active}
//                 subtitle="Currently active"
//                 icon={<TrendingUp size={24} />}
//                 color="success"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <StatCard
//                 title="Deactivated"
//                 value={totals.deactivated}
//                 subtitle="Disabled users"
//                 icon={<UserX size={24} />}
//                 color="error"
//               />
//             </Grid>
//           </Grid>

//           {/* Search and Filters */}
//           <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
//             <Stack direction="row" spacing={2} alignItems="center">
//               <Box sx={{ position: 'relative', flex: 1 }}>
//                 <Search
//                   size={20}
//                   style={{
//                     position: 'absolute',
//                     left: 12,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     color: '#6B7280'
//                   }}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search learners by name or ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '12px 12px 12px 40px',
//                     border: '1px solid #E5E7EB',
//                     borderRadius: '8px',
//                     fontSize: '14px',
//                     outline: 'none',
//                     transition: 'all 0.3s ease',
//                     focus: {
//                       borderColor: '#3B82F6',
//                       boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
//                     }
//                   }}
//                 />
//               </Box>
              
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 style={{
//                   padding: '12px 16px',
//                   border: '1px solid #E5E7EB',
//                   borderRadius: '8px',
//                   fontSize: '14px',
//                   outline: 'none',
//                   minWidth: '140px'
//                 }}
//               >
//                 <option value="ALL">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="DISABLED">Disabled</option>
//               </select>
//             </Stack>
//           </Paper>

//           {/* Learners Table */}
//           <Paper 
//             sx={{ 
//               p: 3, 
//               borderRadius: 3,
//               boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
//               <Typography variant="h6" fontWeight="bold">
//                 Learners Activity
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Showing {paginated.length} of {filteredUsers.length} learners
//               </Typography>
//             </Stack>

//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: 'grey.50' }}>
//                     <TableCell><strong>Learner</strong></TableCell>
//                     <TableCell><strong>Cohort</strong></TableCell>
//                     <TableCell><strong>Status</strong></TableCell>
//                     <TableCell><strong>Last Activity</strong></TableCell>
//                     <TableCell><strong>Details</strong></TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {paginated.length > 0 ? (
//                     paginated.map((u) => (
//                       <TableRow 
//                         key={u.userId}
//                         sx={{ 
//                           cursor: 'pointer',
//                           transition: 'all 0.2s ease',
//                           '&:hover': {
//                             backgroundColor: 'primary.50',
//                             transform: 'scale(1.01)'
//                           }
//                         }}
//                         onClick={() => handleUserClick(u)}
//                       >
//                         <TableCell>
//                           <Stack direction="row" alignItems="center" spacing={2}>
//                             <Avatar
//                               sx={{
//                                 bgcolor: u.status === "ACTIVE" ? 'success.main' : 'error.main',
//                                 width: 40,
//                                 height: 40
//                               }}
//                             >
//                               <Typography variant="body2" fontWeight="bold" color="white">
//                                 {u.userName?.charAt(0)?.toUpperCase() || 'U'}
//                               </Typography>
//                             </Avatar>
//                             <Box>
//                               <Typography variant="subtitle1" fontWeight="medium">
//                                 {u.userName || "—"}
//                               </Typography>
//                               <Typography variant="body2" color="text.secondary">
//                                 {u.userId}
//                               </Typography>
//                             </Box>
//                           </Stack>
//                         </TableCell>
//                         <TableCell>
//                           <Typography variant="body2">
//                             {cohortMeta?.cohortName || "—"}
//                           </Typography>
//                         </TableCell>
//                         <TableCell>
//                           <StatusChip status={u.status || "UNKNOWN"} />
//                         </TableCell>
//                         <TableCell>
//                           <Stack direction="row" alignItems="center" spacing={1}>
//                             <Clock size={16} color="#6B7280" />
//                             <Typography variant="body2">
//                               {u.latestTimestamp
//                                 ? formatLastActivity(u.latestTimestamp)
//                                 : "Never logged in"}
//                             </Typography>
//                           </Stack>
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             sx={{
//                               borderRadius: 2,
//                               textTransform: 'none',
//                               fontWeight: 'medium'
//                             }}
//                           >
//                             View Details
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
//                         <Users size={48} color="#9CA3AF" />
//                         <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
//                           No learners found
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           Try adjusting your search or filters
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <TablePagination
//               rowsPerPageOptions={[5, 10, 20, 25]}
//               component="div"
//               count={filteredUsers.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//               sx={{
//                 borderTop: '1px solid',
//                 borderColor: 'grey.200',
//                 mt: 2
//               }}
//             />
//           </Paper>
//         </>
//       )}

//       {/* User Details Modal */}
//       <Dialog
//         open={showUserModal}
//         onClose={() => setShowUserModal(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
//             overflow: 'hidden'
//           }
//         }}
//       >
//         {selectedUser && (
//           <>
//             <DialogTitle
//               sx={{
//                 background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
//                 color: 'white',
//                 py: 3
//               }}
//             >
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Box>
//                   <Typography variant="h5" fontWeight="bold">
//                     Learner Details
//                   </Typography>
//                   <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
//                     {selectedUser.userId}
//                   </Typography>
//                 </Box>
//                 <IconButton
//                   onClick={() => setShowUserModal(false)}
//                   sx={{ color: 'white' }}
//                 >
//                   <X size={24} />
//                 </IconButton>
//               </Stack>
//             </DialogTitle>

//             <DialogContent sx={{ p: 0 }}>
//               <Stack spacing={4} sx={{ p: 4 }}>
//                 {/* Basic Information */}
//                 <Box>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     Basic Information
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} sm={6}>
//                       <Stack direction="row" spacing={2} alignItems="center">
//                         <Avatar
//                           sx={{
//                             bgcolor: selectedUser.status === "ACTIVE" ? 'success.main' : 'error.main',
//                             width: 60,
//                             height: 60
//                           }}
//                         >
//                           <Typography variant="h6" fontWeight="bold" color="white">
//                             {selectedUser.userName?.charAt(0)?.toUpperCase() || 'U'}
//                           </Typography>
//                         </Avatar>
//                         <Box>
//                           <Typography variant="h6" fontWeight="bold">
//                             {selectedUser.userName || "—"}
//                           </Typography>
//                           <StatusChip status={selectedUser.status || "UNKNOWN"} />
//                         </Box>
//                       </Stack>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={1}>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Mail size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userEmail || "No email provided"}
//                           </Typography>
//                         </Stack>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Phone size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userPhoneNumber || "No phone provided"}
//                           </Typography>
//                         </Stack>
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <MapPin size={16} color="#6B7280" />
//                           <Typography variant="body2">
//                             {selectedUser.userAddress || "No address provided"}
//                           </Typography>
//                         </Stack>
//                       </Stack>
//                     </Grid>
//                   </Grid>
//                 </Box>

//                 <Divider />

//                 {/* Activity Information */}
//                 <Box>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     Activity Information
//                   </Typography>
//                   <Grid container spacing={3}>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={2}>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Last Activity
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {selectedUser.latestTimestamp
//                               ? formatLastActivity(selectedUser.latestTimestamp)
//                               : "Never logged in"}
//                           </Typography>
//                         </Box>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             User Type
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {selectedUser.userType || "Learner"}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <Stack spacing={2}>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Cohort
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {cohortMeta?.cohortName || "—"}
//                           </Typography>
//                         </Box>
//                         <Box>
//                           <Typography variant="caption" color="text.secondary">
//                             Organization
//                           </Typography>
//                           <Typography variant="body1" fontWeight="medium">
//                             {organization?.organizationName || "—"}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Grid>
//                   </Grid>
//                 </Box>

//                 {/* Session Details */}
//                 {selectedUser.latestSession && (
//                   <>
//                     <Divider />
//                     <Box>
//                       <Typography variant="h6" fontWeight="bold" gutterBottom>
//                         Latest Session
//                       </Typography>
//                       <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//                         <Stack spacing={1}>
//                           <Stack direction="row" justifyContent="space-between">
//                             <Typography variant="body2" color="text.secondary">
//                               Session ID:
//                             </Typography>
//                             <Typography variant="body2" fontWeight="medium">
//                               {selectedUser.latestSession.sessionId}
//                             </Typography>
//                           </Stack>
//                           {selectedUser.latestSession.sessionStartTimestamp && (
//                             <Stack direction="row" justifyContent="space-between">
//                               <Typography variant="body2" color="text.secondary">
//                                 Started:
//                               </Typography>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {format(new Date(selectedUser.latestSession.sessionStartTimestamp), "PPpp")}
//                               </Typography>
//                             </Stack>
//                           )}
//                           {selectedUser.latestSession.sessionEndTimestamp && (
//                             <Stack direction="row" justifyContent="space-between">
//                               <Typography variant="body2" color="text.secondary">
//                                 Ended:
//                               </Typography>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {format(new Date(selectedUser.latestSession.sessionEndTimestamp), "PPpp")}
//                               </Typography>
//                             </Stack>
//                           )}
//                         </Stack>
//                       </Paper>
//                     </Box>
//                   </>
//                 )}
//               </Stack>
//             </DialogContent>

//             <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'grey.200' }}>
//               <Button
//                 onClick={() => setShowUserModal(false)}
//                 variant="outlined"
//                 sx={{ borderRadius: 2, textTransform: 'none' }}
//               >
//                 Close
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </Container>
//   );
// }







// First model of dashboard for reference
// import React, { useMemo, useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useUserContext } from "../../context/AuthContext";
// import CohortStats from "../components/CohortStats";
// import ProgressChart from "../components/ProgressChart";
// import SessionActivityTable from "../components/SessionActivityTable";
// import ChartSkeleton from "../components/skeletons/ChartSkeleton";
// import TableSkeleton from "../components/skeletons/TableSkeleton";
// import { fetchLearnerSessionActivity, fetchMentorCohortProgress,} from "../../lib/mentor-api";
// import { useFetch } from "../../hooks/useFetch";
// import { useDebounce } from "../../hooks/useDebounce";

// export default function MentorDashboard() {
//   const { cohortId, programId: programIdFromRoute } = useParams<{
//     cohortId: string;
//     programId?: string;
//   }>();

//   const { user } = useUserContext();
//   const mentorId = user?.userId ?? "";

//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounce(search, 300);


//   // Get programId from multiple possible sources
//   const getProgramId = () => {
//     // First try: from user context
//     if (user?.selectedProgramId) {
//       return user.selectedProgramId;
//     }
    
//     // Second try: from localStorage selectedCohortWithProgram
//     const storedCohort = localStorage.getItem("selectedCohortWithProgram");
//     if (storedCohort) {
//       try {
//         const cohortData = JSON.parse(storedCohort);
//         return cohortData?.program?.programId || cohortData?.selectedProgramId;
//       } catch (e) {
//         console.error("Error parsing stored cohort:", e);
//       }
//     }
    
//     // Third try: from userData in localStorage
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       try {
//         const userDataObj = JSON.parse(userData);
//         return userDataObj.selectedProgramId;
//       } catch (e) {
//         console.error("Error parsing userData:", e);
//       }
//     }
//     return "";
//   };

//   const programId = programIdFromRoute || getProgramId();

//   // Debug effect to log the programId
//   useEffect(() => {
//     console.log("🔍 MentorDashboard Debug Info:", {
//       cohortId,
//       mentorId,
//       programId,
//       userSelectedProgramId: user?.selectedProgramId,
//       user: user
//     });
//   }, [cohortId, mentorId, programId, user]);

//   const {
//     data: cohortRows,
//     isLoading: loadingCohort,
//     error: cohortError,
//     refresh: refreshCohort,
//   } = useFetch(
//     () =>
//       cohortId && mentorId && programId
//         ? fetchMentorCohortProgress(mentorId, programId, cohortId)
//         : null,
//     [cohortId, mentorId, programId]
//   );

//   const {
//     data: activities,
//     isLoading: loadingActivities,
//     error: activitiesError,
//     refresh: refreshActivities,
//   } = useFetch(
//     () => (cohortId && mentorId ? fetchLearnerSessionActivity(cohortId, mentorId) : null),
//     [cohortId, mentorId]
//   );

//   // Ensure activities is always an array
//   const safeCohortRows = Array.isArray(cohortRows) ? cohortRows : [];
//   const safeActivities = Array.isArray(activities) ? activities : [];

//   if (!programId) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <h2 className="text-red-800 font-bold">Missing Program Information</h2>
//           <p className="text-red-600">
//             Unable to load cohort data. Program ID is missing. Please reselect your cohort.
//           </p>
//           <button 
//             onClick={() => window.location.href = '/select-cohort'}
//             className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//           >
//             Reselect Cohort
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const aggregatedSubconcepts = useMemo(() => {
//     return [];
//   }, [safeCohortRows]);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Mentor Cohort Dashboard</h1>
//           <p className="text-sm text-gray-600">Cohort: {cohortId}</p>
//           <p className="text-xs text-gray-500">Program: {programId}</p>
//         </div>

//         <div className="flex items-center gap-3">
//           <Link to={`/mentor/${cohortId}/progress`} className="px-3 py-2 bg-blue-600 text-white rounded">
//             Learner Progress
//           </Link>
//           <Link to={`/mentor/${cohortId}/activity`} className="px-3 py-2 bg-gray-100 rounded">
//             Activity Monitor
//           </Link>
//         </div>
//       </div>

//       <div>
//         {loadingCohort ? <div className="mb-4"><ChartSkeleton /></div> : cohortError ? (
//           <div className="bg-red-50 p-3 rounded border text-red-700">{cohortError.message}</div>
//         ) : (
//           <CohortStats rows={safeCohortRows} />
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2">
//           {loadingCohort ? (
//             <ChartSkeleton />
//           ) : (
//             <ProgressChart subconcepts={aggregatedSubconcepts} />
//           )}
//         </div>

//         <div>
//           {loadingActivities ? (
//             <TableSkeleton />
//           ) : (
//             <SessionActivityTable
//               activities={safeActivities}
//               isLoading={loadingActivities}
//               error={activitiesError ?? null}
//               onRefresh={() => refreshActivities()}
//               search={debouncedSearch}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }