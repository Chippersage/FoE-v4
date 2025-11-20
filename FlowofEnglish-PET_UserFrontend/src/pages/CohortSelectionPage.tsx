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

  const handleViewAssignments = () => {
    if (!assignmentStatistics) {
      alert("No assignment data available.");
      return;
    }

    navigate("/assignments", { state: { assignmentStatistics, cohorts } });
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

        {/* HEADER ROW — responsive, mobile spacing increased */}
        <div
          className="
            flex flex-row justify-between items-center w-full mb-6
            pt-2      
            md:pt-0   
          "
        >
          <h1
            className="
              font-bold text-slate-800 
              text-xl 
              sm:text-2xl 
              md:text-3xl 
              text-left
            "
          >
            Continue Your Learning
          </h1>

          {userRole?.toLowerCase() === "mentor" && (
            <button
              onClick={handleViewAssignments}
              className="
                bg-[#0EA5E9] hover:bg-[#0284C7] text-white
                px-3 sm:px-4 py-2
                rounded-lg shadow-md transition cursor-pointer
                text-sm sm:text-base
                ml-3
              "
            >
              View Assignments
            </button>
          )}
        </div>

        {/* COHORT LIST */}
        {cohorts.length === 0 ? (
          <p className="text-center text-slate-600">
            No active cohorts available.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-30">
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
