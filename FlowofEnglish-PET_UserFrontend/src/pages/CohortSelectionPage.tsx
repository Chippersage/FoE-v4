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

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cohorts`);
        setCohorts(response.data || []);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCohorts();
  }, []);

  // ✅ Handle selecting a cohort
  const handleSelectCohort = (cohort) => {
    const selected = {
      cohortId: cohort.cohortId,
      cohortName: cohort.cohortName,
      programName: cohort.programName,
    };

    // Save to localStorage
    localStorage.setItem("selectedCohortWithProgram", JSON.stringify(selected));

    // Redirect to course page
    navigate("/course");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading cohorts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">
          Select Your Cohort
        </h1>

        {cohorts.length === 0 ? (
          <p className="text-center text-slate-600">No cohorts found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cohorts.map((c) => (
              <div key={c.cohortId} onClick={() => handleSelectCohort(c)}>
                <CohortCard cohort={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CohortSelectionPage;
