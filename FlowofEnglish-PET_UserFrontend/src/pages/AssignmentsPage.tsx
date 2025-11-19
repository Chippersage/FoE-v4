import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Cohort {
  cohortId: string;
  cohortName: string;
  programName: string;
  programId: string;
}

interface CohortAssignmentStats {
  correctedAssignments: number;
  totalAssignments: number;
  pendingAssignments: number;
  cohortUserCount: number;
}

interface AssignmentStatistics {
  correctedAssignments: number;
  totalAssignments: number;
  pendingAssignments: number;
  totalCohortUserCount: number;
  cohortDetails: Record<string, CohortAssignmentStats>;
}

interface LocationState {
  assignmentStatistics: AssignmentStatistics;
  cohorts: Cohort[];
}

const AssignmentsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const assignmentStatistics = state?.assignmentStatistics;
  const cohorts = state?.cohorts || [];

  if (!assignmentStatistics) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700">
        <p className="text-lg font-medium">No assignment data available.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const cohortDetails = assignmentStatistics.cohortDetails || {};
  const hasPending = Object.values(cohortDetails).some(
    (c) => c.pendingAssignments > 0
  );

  // Navigate to View Submissions page
  const handleViewSubmissions = (cohortId: string, cohortName: string) => {
    navigate("/view-submissions", { state: { cohortId, cohortName } });
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Assignments</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg shadow transition cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Assignments Grid */}
        {hasPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts.map((cohort) => {
              const stats = cohortDetails[cohort.cohortId];
              if (!stats || stats.pendingAssignments === 0) return null;

              const pendingPercent =
                stats.totalAssignments > 0
                  ? Math.round(
                      (stats.pendingAssignments / stats.totalAssignments) * 100
                    )
                  : 0;

              return (
                <div
                  key={cohort.cohortId}
                  className="bg-white rounded-2xl p-5 border border-blue-100 shadow hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold text-[#0EA5E9] mb-1">
                    {cohort.programName}
                  </h2>
                  <p className="text-gray-600 mb-3 text-sm">
                    Cohort:{" "}
                    <span className="font-medium text-gray-800">
                      {cohort.cohortName}
                    </span>
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${pendingPercent}%` }}
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg space-y-1 text-sm text-gray-700 mb-3">
                    <p>
                      <strong>Pending:</strong>{" "}
                      <span className="text-red-600 font-semibold">
                        {stats.pendingAssignments}
                      </span>
                    </p>
                    <p>
                      <strong>Corrected:</strong>{" "}
                      {stats.correctedAssignments || 0}
                    </p>
                    <p>
                      <strong>Total Assignments:</strong>{" "}
                      {stats.totalAssignments || 0}
                    </p>
                    <p>
                      <strong>Students in Cohort:</strong>{" "}
                      {stats.cohortUserCount || 0}
                    </p>
                  </div>

                  {/* View submissions button */}
                  <button
                    onClick={() =>
                      handleViewSubmissions(cohort.cohortId, cohort.cohortName)
                    }
                    className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white py-2 rounded-lg font-medium transition cursor-pointer"
                  >
                    View Submissions
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-600 mt-12 text-lg font-medium">
            All assignments are corrected! Great job!
          </p>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
