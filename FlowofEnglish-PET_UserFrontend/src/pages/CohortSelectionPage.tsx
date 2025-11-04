// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CohortCard from "../components/CohortCard";

const CohortSelectionPage = () => {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Helper function to check if the cohort has expired
  const isCohortActive = (cohort) => {
    if (!cohort.cohortEndDate) return true;
    const endDate = new Date(cohort.cohortEndDate).getTime();
    const now = Date.now();
    return endDate > now;
  };

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.userId) {
          console.error("No userId found in localStorage");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/users/${storedUser.userId}/cohorts`
        );

        const userDetails = response.data?.userDetails;
        const fetchedCohorts = userDetails?.allCohortsWithPrograms || [];

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
          progress: 30,
        }));

        const activeCohorts = formattedCohorts.filter(isCohortActive);
        setCohorts(activeCohorts);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  const handleSelectCohort = async (cohort) => {
    if (!cohort) return console.error("No cohort passed to handleSelectCohort");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.userId) {
        console.error("No user found in localStorage");
        return;
      }

      // Call the API to select cohort
      const res = await axios.post(`${API_BASE_URL}/users/select-cohort`, {
        userId: storedUser.userId,
        programId: cohort.programId,
        cohortId: cohort.cohortId,
      });

      // Extract sessionId from response and save it to localStorage
      if (res.data?.sessionId) {
        localStorage.setItem("sessionId", res.data.sessionId);
        console.log("Session ID saved:", res.data.sessionId);
      } else {
        console.warn("No sessionId found in response:", res.data);
      }

      // Navigate to /course/:programId route and pass cohort details in state
      navigate(`/course/${cohort.programId}`, { state: { selectedCohort: cohort } });
    } catch (error) {
      console.error("Error selecting cohort:", error);
      alert("Something went wrong while selecting the cohort!");
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">
          Select Your Cohort
        </h1>

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
