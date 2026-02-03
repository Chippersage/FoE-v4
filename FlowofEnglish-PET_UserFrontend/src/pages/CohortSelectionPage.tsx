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
        if (!storedUser?.userId) return;

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
          completedSubconcepts: 0, // Add this to track completed subconcepts
        }));

        const activeCohorts = formattedCohorts.filter(isCohortActive);

        const progressPromises = activeCohorts.map(async (cohort) => {
          try {
            const progressRes = await axios.get(
              `${API_BASE_URL}/reports/program/${cohort.programId}/user/${storedUser.userId}/progress`
            );

            const total = progressRes.data?.totalSubconcepts || 0;
            const completed = progressRes.data?.completedSubconcepts || 0;

            return { 
              ...cohort, 
              progress: total > 0 ? Math.round((completed / total) * 100) : 0,
              completedSubconcepts: completed // Store completed subconcepts count
            };
          } catch {
            return { 
              ...cohort, 
              progress: 0,
              completedSubconcepts: 0
            };
          }
        });

        let cohortsWithProgress = await Promise.all(progressPromises);

        cohortsWithProgress = cohortsWithProgress.sort((a, b) =>
          a.progress === 100 && b.progress !== 100 ? 1 :
          a.progress !== 100 && b.progress === 100 ? -1 : 0
        );

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
      alert("Something went wrong while selecting the cohort!");
    }
  };

  // const handleViewLearners = (cohort) => {
  //   navigate("/mentor/dashboard", { state: { cohort } });
  // };

  // const handleViewAssignments = (cohort) => {
  //   navigate("/view-submissions", {
  //     state: { cohortId: cohort.cohortId, cohortName: cohort.cohortName },
  //   });
  // };

  // const handleMentorDashboard = (cohort) => {
  //   localStorage.setItem("selectedCohort", JSON.stringify(cohort));
  //   navigate("/mentor/dashboard", { state: { cohort } });
  // };
  const handleMentorDashboard = (cohort) => {
  const cohortWithProgram = {
    cohortId: cohort.cohortId,
    cohortName: cohort.cohortName,
    program: {
      programId: cohort.programId,
      programName: cohort.programName,
    },
  };

  // single source of truth
  localStorage.setItem(
    "selectedCohortWithProgram",
    JSON.stringify(cohortWithProgram)
  );

  navigate(
    `/mentor/${cohort.cohortId}/${cohort.programId}/dashboard`
  );
};


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-[#0EA5E9] opacity-20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0EA5E9] border-transparent animate-spin" />
        </div>
        <p className="mt-3 text-[#0EA5E9] font-medium text-xs animate-pulse">
          Loading Cohorts...
        </p>
      </div>
    );
  }

  const groupedByProgram = cohorts.reduce((acc, cohort) => {
    (acc[cohort.programName] ||= []).push(cohort);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-10 pt-3">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-slate-800 text-lg sm:text-xl md:text-2xl mb-6 font-bold sm:font-semibold">
          Continue Learning
        </h1>

        {cohorts.length === 0 ? (
          <p className="text-center text-xs text-slate-600">
            No active cohorts available.
          </p>
        ) : (
          <div className="grid gap-6 pb-10">
            {Object.entries(groupedByProgram).map(([programName, programCohorts]) => (
              <div key={programName} className="space-y-2">
                <h2 className="text-sm md:text-base font-semibold text-slate-700">
                  {programName}
                </h2>

                {programCohorts.map((c) => (
                  <CohortCard
                    key={c.cohortId}
                    cohort={c}
                    userRole={userRole}
                    assignmentStatistics={assignmentStatistics}
                    onResume={() => handleSelectCohort(c)}
                    // onViewLearners={handleViewLearners}
                    // onViewAssessments={handleViewAssignments}
                    onGenerateReport={() => console.log("Coming Soon")}
                    onViewMentorDashboard={() => handleMentorDashboard(c)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CohortSelectionPage;