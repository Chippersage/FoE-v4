import React, { useEffect, useState } from "react";
import { Container, Card, Typography, FormControl, InputLabel, Select, MenuItem, Box, } from "@mui/material";
import { useParams } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { fetchMentorCohortProgress } from "@/lib/mentor-api";
import LearnersProgressChart from "../../components/LearnersProgressChart";
import LineProgressChart from "../../components/LineProgressChart";
import ProgressDataTable from "../../components/TableView";

export default function MentorReportsPage() {
  const { cohortId, programId } = useParams();
  const { user } = useUserContext();
  const mentorId = user?.userId;

  const [visType, setVisType] = useState("barchart");
  const [learners, setLearners] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState("All Learners");

  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);

  // Fetch the mentor cohort progress (main reports API)
  useEffect(() => {
    if (!mentorId || !programId || !cohortId) return;

    async function loadData() {
      try {
        setLoading(true);
        const progress = await fetchMentorCohortProgress(
          mentorId,
          programId,
          cohortId
        );

        const transformed = {
          programId,
          cohortId,
          users: progress.map((u) => ({
            userId: u.userId,
            userName: u.userName,
            totalStages: u.totalStages ?? 0,
            completedStages: u.completedStages ?? 0,
            totalUnits: u.totalUnits ?? 0,
            completedUnits: u.completedUnits ?? 0,
            totalSubconcepts: u.totalSubconcepts ?? 0,
            completedSubconcepts: u.completedSubconcepts ?? 0,
            leaderboardScore: u.leaderboardScore ?? 0,
          })),
        };

        setApiData(transformed);

        const learnerList = [
          { userId: "All Learners", userName: "All Learners" },
          ...transformed.users,
        ];
        setLearners(learnerList);
      } catch (err) {
        console.error("Error loading mentor reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mentorId, programId, cohortId]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* --------------------- FILTER CARD --------------------- */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reports & Analytics
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
          {/* Program */}
          <FormControl fullWidth>
            <InputLabel>Program (From URL)</InputLabel>
            <Select disabled value={programId || ""}>
              <MenuItem value={programId}>{programId}</MenuItem>
            </Select>
          </FormControl>

          {/* Cohort */}
          <FormControl fullWidth>
            <InputLabel>Cohort (From URL)</InputLabel>
            <Select disabled value={cohortId || ""}>
              <MenuItem value={cohortId}>{cohortId}</MenuItem>
            </Select>
          </FormControl>

          {/* Visualization */}
          <FormControl fullWidth>
            <InputLabel>Select Visualization</InputLabel>
            <Select
              value={visType}
              onChange={(e) => setVisType(e.target.value)}
            >
              <MenuItem value="barchart">Bar Chart</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
              <MenuItem value="linechart">Line Chart</MenuItem>
            </Select>
          </FormControl>

          {/* Learner Select */}
          <FormControl fullWidth>
            <InputLabel>Select Learner</InputLabel>
            <Select
              value={selectedLearnerId}
              onChange={(e) => setSelectedLearnerId(e.target.value)}
            >
              {learners.map((l) => (
                <MenuItem key={l.userId} value={l.userId}>
                  {l.userName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* --------------------- LOADING --------------------- */}
      {loading && (
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto" />
          <Typography sx={{ mt: 2 }}>Loading Reports...</Typography>
        </Box>
      )}

      {/* --------------------- VISUALIZATION AREA --------------------- */}
      {!loading && apiData && (
        <Card sx={{ p: 3 }}>
          {visType === "barchart" && (
            <LearnersProgressChart
              data={apiData}
              programId={programId}
              selectedUserId={selectedLearnerId}
            />
          )}

          {visType === "linechart" && (
            <LineProgressChart data={apiData} />
          )}

          {visType === "table" && <ProgressDataTable data={apiData} />}
        </Card>
      )}
    </Container>
  );
}
