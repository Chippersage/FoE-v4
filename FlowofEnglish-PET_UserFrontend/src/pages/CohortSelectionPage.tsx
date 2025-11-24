// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CohortCard from "../components/CohortCard";

const CohortSelectionPage = () => {
  const [cohorts, setCohorts] = useState([]);
  const [assignmentStatistics, setAssignmentStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const isCohortActive = (cohort) => {
    if (!cohort.cohortEndDate) return true;
    const endDate = new Date(cohort.cohortEndDate).getTime();
    return endDate > Date.now();
  };

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.userId) {
          console.error("No userId found in localStorage");
          return;
        }

        setUserRole(storedUser?.userType || "");
        console.log(userRole);

        const response = await axios.get(
          `${API_BASE_URL}/users/${storedUser.userId}/cohorts`
        );

        const userDetails = response.data?.userDetails;
        const fetchedCohorts = userDetails?.allCohortsWithPrograms || [];
        const assignmentStats = response.data?.assignmentStatistics || null;
        setAssignmentStatistics(assignmentStats);

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
          progress: 0,
        }));

        const activeCohorts = formattedCohorts.filter(isCohortActive);

        const progressPromises = activeCohorts.map(async (cohort) => {
          try {
            const progressRes = await axios.get(
              `${API_BASE_URL}/reports/program/${cohort.programId}/user/${storedUser.userId}/progress`
            );

            const progressData = progressRes.data;
            const total = progressData?.totalSubconcepts || 0;
            const completed = progressData?.completedSubconcepts || 0;

            const percentage =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            return { ...cohort, progress: percentage };
          } catch {
            return { ...cohort, progress: 0 };
          }
        });

        let cohortsWithProgress = await Promise.all(progressPromises);

        // Move completed 100% progress to bottom
        cohortsWithProgress = cohortsWithProgress.sort((a, b) => {
          if (a.progress === 100 && b.progress !== 100) return 1;
          if (a.progress !== 100 && b.progress === 100) return -1;
          return 0;
        });

        setCohorts(cohortsWithProgress);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  const handleSelectCohort = async (cohort) => {
    if (!cohort) return;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.userId) return;

      localStorage.setItem("selectedCohort", JSON.stringify(cohort));

      const res = await axios.post(`${API_BASE_URL}/users/select-cohort`, {
        userId: storedUser.userId,
        programId: cohort.programId,
        cohortId: cohort.cohortId,
      });

      if (res.data?.sessionId) {
        localStorage.setItem("sessionId", res.data.sessionId);
      }

      navigate(`/course/${cohort.programId}`, {
        state: { selectedCohort: cohort },
      });
    } catch (error) {
      console.error("Error selecting cohort:", error);
      alert("Something went wrong while selecting the cohort!");
    }
  };

  const handleViewLearners = (cohort) => {
    navigate("/mentor/dashboard", { state: { cohort } });
  };

  const handleViewAssignments = (cohort) => {
    navigate("/view-submissions", {
      state: { cohortId: cohort.cohortId, cohortName: cohort.cohortName },
    });
  };

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

  return (
    <div className="min-h-screen bg-slate-50 pt-2 md:pt-4 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div
          className="
            flex flex-row justify-between items-center w-full mb-8
            pt-2 md:pt-0
          "
        >
          <h1
            className="
              font-bold text-slate-800 
              text-2xl sm:text-2xl md:text-3xl text-left
            "
          >
            {userRole?.toLowerCase() === "mentor"
              ? "Mentor Dashboard"
              : "Continue Your Learning"}
          </h1>
        </div>

        {cohorts.length === 0 ? (
          <p className="text-center text-slate-600">
            No active cohorts available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-6 md:pb-10">
            {cohorts.map((c) => (
              <CohortCard
                key={c.cohortId}
                cohort={c}
                userRole={userRole}
                assignmentStatistics={assignmentStatistics}
                onResume={() => handleSelectCohort(c)}
                onViewLearners={(cohort) => handleViewLearners(cohort)}
                onViewAssessments={() => handleViewAssignments(c)}
                onGenerateReport={() => console.log("Reports Coming Soon")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CohortSelectionPage;
