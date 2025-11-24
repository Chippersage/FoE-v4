import React, { useEffect, useMemo, useState } from "react";
import { Container, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Box, CircularProgress, Alert,} from "@mui/material";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";

/**
 * MentorDashboardClean
 * - Option A: shows only the latest session timestamp per user
 * - Uses Mentor Session Activity API:
 *    GET /api/v1/user-session-mappings/cohort/{cohortId}/mentor/{mentorUserId}
 *
 * Note: API base URL fetched from import.meta.env.VITE_API_BASE_URL (or fallback to /api)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const formatLastActivity = (timestamp?: string | null) => {
  if (!timestamp) return "Learner not logged in";
  const date = new Date(timestamp);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  const formattedTime = format(date, "hh:mm a");
  return `${relativeTime} at ${formattedTime}`;
};

const getLatestSessionForUser = (sessions?: any[]) => {
  if (!sessions || sessions.length === 0) return null;

  // Prefer sessionEndTimestamp if present; otherwise use sessionStartTimestamp
  const valid = sessions
    .map((s) => ({
      ...s,
      // Normalize to Date object or null
      endTs: s.sessionEndTimestamp ? new Date(s.sessionEndTimestamp) : null,
      startTs: s.sessionStartTimestamp ? new Date(s.sessionStartTimestamp) : null,
    }))
    .filter((s) => s.endTs || s.startTs);

  if (valid.length === 0) return null;

  // Compare by endTs if available, else startTs
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
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [cohortMeta, setCohortMeta] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (!cohortId || !mentorId) {
      setError("Missing cohortId or mentorId. Please re-select your cohort.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get(
          `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(
            cohortId
          )}/mentor/${encodeURIComponent(mentorId)}`,
          { withCredentials: true }
        );

        // Expecting the uploaded JSON structure: { organization, cohort, users: [...] }
        const data = resp.data ?? {};
        setOrganization(data.organization ?? null);
        setCohortMeta(data.cohort ?? null);

        // Normalize users array
        const fetchedUsers: any[] = Array.isArray(data.users) ? data.users : [];
        // Map to include latestSession and latestTimestamp for easy sorting
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

        // Sort by latestTimestamp desc (nulls last)
        mapped.sort((a, b) => {
          if (!a.latestTimestamp && !b.latestTimestamp) return 0;
          if (!a.latestTimestamp) return 1;
          if (!b.latestTimestamp) return -1;
          return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
        });

        setUsers(mapped);
      } catch (err: any) {
        console.error("Mentor dashboard fetch error:", err);
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load mentor cohort data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cohortId, mentorId]);

  // derived stats
  const totals = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status ?? "").toUpperCase() === "ACTIVE").length;
    const deactivated = total - active;
    return { total, active, deactivated };
  }, [users]);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Mentor Cohort Dashboard
      </Typography>

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
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Learners
                  </Typography>
                  <Typography variant="h4">{totals.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cohortMeta?.cohortName ? `Cohort: ${cohortMeta.cohortName}` : ""}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Learners
                  </Typography>
                  <Typography variant="h4">{totals.active}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active users in this cohort
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Deactivated Learners
                  </Typography>
                  <Typography variant="h4">{totals.deactivated}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Disabled / deactivated users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Latest Login Learners
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User ID</strong></TableCell>
                    <TableCell><strong>Learner Name</strong></TableCell>
                    <TableCell><strong>Cohort</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Latest Login</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length > 0 ? (
                    paginated.map((u) => (
                      <TableRow key={u.userId}>
                        <TableCell>{u.userId}</TableCell>
                        <TableCell>{u.userName ?? "—"}</TableCell>
                        <TableCell>{cohortMeta?.cohortName ?? "—"}</TableCell>
                        <TableCell>{u.status ?? "—"}</TableCell>
                        <TableCell>
                          {u.latestTimestamp
                            ? formatLastActivity(u.latestTimestamp)
                            : "Learner not logged in"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No learners available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
    </Container>
  );
}


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