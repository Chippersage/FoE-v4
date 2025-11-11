// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CohortCard from "../components/CohortCard";

const CohortSelectionPage = () => {
  const [cohorts, setCohorts] = useState([]);
  const [assignmentStatistics, setAssignmentStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(""); // Added user role state
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Helper: Check if the cohort is still active
  const isCohortActive = (cohort) => {
    if (!cohort.cohortEndDate) return true;
    const endDate = new Date(cohort.cohortEndDate).getTime();
    return endDate > Date.now();
  };

  // Fetch cohorts and assignment statistics for the logged-in user
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.userId) {
          console.error("No userId found in localStorage");
          return;
        }

        // Save user role locally
        setUserRole(storedUser?.userType || "");

        // Step 1: Get all cohorts for this user
        const response = await axios.get(
          `${API_BASE_URL}/users/${storedUser.userId}/cohorts`
        );

        // Extract user details and assignment data
        const userDetails = response.data?.userDetails;
        const fetchedCohorts = userDetails?.allCohortsWithPrograms || [];
        const assignmentStats = response.data?.assignmentStatistics || null;

        setAssignmentStatistics(assignmentStats);

        // Step 2: Format cohort data for rendering
        const formattedCohorts = fetchedCohorts.map((c) => ({
          cohortId: c.cohortId,
          cohortName: c.cohortName,
          cohortStartDate: new Date(c.cohortStartDate * 1000).toISOString(),
          cohortEndDate: new Date(c.cohortEndDate * 1000).toISOString(),
          showLeaderboard: c.showLeaderboard,
          delayedStageUnlock: c.delayedStageUnlock,
          delayInDays: c.delayInDays,
          enableAiEvaluation: c.enableAiEvaluation,
          organization: userDetails.organization,
          programId: c.program?.programId,
          programName: c.program?.programName,
          programDesc: c.program?.programDesc,
          stagesCount: c.program?.stagesCount,
          unitCount: c.program?.unitCount,
          progress: 0, // default placeholder for progress
        }));

        // Step 3: Filter active cohorts
        const activeCohorts = formattedCohorts.filter(isCohortActive);

        // Step 4: Fetch progress for each cohort (parallel API calls)
        const progressPromises = activeCohorts.map(async (cohort) => {
          try {
            const progressRes = await axios.get(
              `${API_BASE_URL}/reports/program/${cohort.programId}/user/${storedUser.userId}/progress`
            );

            const progressData = progressRes.data;
            const total = progressData?.totalSubconcepts || 0;
            const completed = progressData?.completedSubconcepts || 0;

            const progressPercent =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            return { ...cohort, progress: progressPercent };
          } catch (err) {
            console.warn(
              `Failed to fetch progress for ${cohort.programId}:`,
              err.message
            );
            return { ...cohort, progress: 0 };
          }
        });

        // Step 5: Wait for all progress results
        const cohortsWithProgress = await Promise.all(progressPromises);

        setCohorts(cohortsWithProgress);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  // Handle cohort selection and navigate to the course page
  const handleSelectCohort = async (cohort) => {
    if (!cohort) return console.error("No cohort passed to handleSelectCohort");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.userId) {
        console.error("No user found in localStorage");
        return;
      }

      // Save selected cohort locally
      localStorage.setItem("selectedCohort", JSON.stringify(cohort));

      // Call the API to select cohort
      const res = await axios.post(`${API_BASE_URL}/users/select-cohort`, {
        userId: storedUser.userId,
        programId: cohort.programId,
        cohortId: cohort.cohortId,
      });

      // Save sessionId if available
      if (res.data?.sessionId) {
        localStorage.setItem("sessionId", res.data.sessionId);
        console.log("Session ID saved:", res.data.sessionId);
      }

      // Navigate to course page
      navigate(`/course/${cohort.programId}`, { state: { selectedCohort: cohort } });
    } catch (error) {
      console.error("Error selecting cohort:", error);
      alert("Something went wrong while selecting the cohort!");
    }
  };

  // Handle navigation to assignments page
  const handleViewAssignments = () => {
    if (!assignmentStatistics) {
      alert("No assignment data available.");
      return;
    }

    // Navigate to assignments page with data in state
    navigate("/assignments", { state: { assignmentStatistics, cohorts } });
  };

  // Loader UI while fetching data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#0EA5E9] opacity-25" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0EA5E9] border-transparent animate-spin" />
        </div>
        <p className="mt-4 text-[#0EA5E9] font-medium text-base animate-pulse tracking-wide">
          Loading Cohorts...
        </p>
      </div>
    );
  }
    console.log(userRole);
  // Main UI
  return (
    <div className="min-h-screen bg-slate-50 pt-2 md:pt-4 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Page heading */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center md:text-left">
            Continue Your Learning
          </h1>

          {/* Show "View Assignments" button only for mentors */}
          {userRole?.toLowerCase() === "mentor" && (
            <button
              onClick={handleViewAssignments}
              className="mt-4 md:mt-0 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
            >
              View Assignments
            </button>
          )}
        </div>

        {/* Cohort list */}
        {cohorts.length === 0 ? (
          <p className="text-center text-slate-600">
            No active cohorts available.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cohorts.map((c) => (
              <CohortCard
                key={c.cohortId}
                cohort={c}
                onResume={() => handleSelectCohort(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CohortSelectionPage;
