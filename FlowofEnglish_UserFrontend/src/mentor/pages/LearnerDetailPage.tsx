import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDetailedLearnerProgress } from "../_hooks/useDetailedLearnerProgress";
import { ArrowLeft, TrendingUp } from "lucide-react";
import ProgressChart from "../components/ProgressChart";

export default function LearnerDetailPage() {
  const { learnerId, programId } = useParams();
  const navigate = useNavigate();

  if (!learnerId || !programId) {
    return <div>Invalid learner or program ID</div>;
  }

  const { progress, isLoading, error } = useDetailedLearnerProgress(
    learnerId,
    programId
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      ) : progress ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {progress.userName}
            </h1>
            <p className="text-gray-600">{progress.programName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-blue-600">
                {progress.completedStages}/{progress.totalStages}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-green-600">
                {progress.overallScore}%
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Subconcepts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress.subconcepts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ProgressChart subconcepts={progress.subconcepts} />
        </>
      ) : null}
    </div>
  );
}
