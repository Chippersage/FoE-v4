// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from "recharts";
import { getStudentProgress } from "../api/getStudentProgress";

export default function StudentProgress() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const programId = location.state?.programId;
  const cohortId = location.state?.cohortId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("barchart");

  useEffect(() => {
    if (!userId || !programId) return;

    setLoading(true);
    getStudentProgress(userId, programId)
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [userId, programId]);

  if (loading || !data) {
    return <p className="p-4 text-center text-lg font-medium">Loading Progress Report...</p>;
  }

  const stageChartData = data.stages.map((s: any) => ({
    name: s.stageName,
    progress: s.completionPercentage,
  }));

  const unitChartData =
    data.stages.flatMap((stage: any) =>
      stage.units.map((unit: any) => ({
        name: unit.unitName,
        progress: unit.completionPercentage,
      }))
    );

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 mb-16">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="
          flex items-center gap-2
          px-4 py-2
          w-fit
          bg-white
          border border-slate-300
          rounded-lg
          text-slate-700
          font-medium
          shadow-sm
          hover:bg-slate-100 hover:shadow-md
          active:scale-95
          transition-all
          cursor-pointer
        "
      >
        <span className="text-[18px]">←</span>
        <span>Back</span>
      </button>


      {/* HEADER + SUMMARY METRICS CARD (COMBINED) */}
      <div className="bg-white shadow-md rounded-xl p-5 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{data.userName ?? userId}</h1>
          <p className="text-sm text-gray-600 mt-1">{data.programName}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <Metric label="Avg Score" value={data.averageScore?.toFixed(2)} highlighted />
          <Metric label="Stages" value={`${data.completedStages}/${data.totalStages}`} />
          <Metric label="Units" value={`${data.completedUnits}/${data.totalUnits}`} />
          <Metric
            label="Last Attempt"
            value={new Date(data.lastAttemptDate * 1000).toLocaleDateString("en-IN")}
          />
        </div>
      </div>


      {/* SWITCH VIEW BUTTON */}
      <div className="flex gap-3">
        {["barchart", "linechart", "table"].map((mode) => (
          <button
            key={mode}
            className={`px-4 py-2 rounded-md border cursor-pointer ${
              viewMode === mode ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => setViewMode(mode)}
          >
            {mode === "barchart" && "Stage Chart"}
            {mode === "linechart" && "Unit Chart"}
            {mode === "table" && "Attempts Table"}
          </button>
        ))}
      </div>

      {/* CHART / TABLE VIEW */}
      <div className="bg-white shadow-md rounded-xl p-5">
        {viewMode === "barchart" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageChartData}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="progress" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {viewMode === "linechart" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={unitChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line dataKey="progress" stroke="#0EA5E9" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {viewMode === "table" && (
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Attempts</th>
                <th className="p-2">Highest Score</th>
              </tr>
            </thead>
            <tbody>
              {data.stages.flatMap((stage: any) =>
                stage.units.flatMap((unit: any) =>
                  unit.subconcepts.map((s: any) => (
                    <tr key={s.subconceptId} className="border-t">
                      <td className="p-2">{s.subconceptDesc}</td>
                      <td className="p-2">{s.attemptCount}</td>
                      <td className="p-2">{s.highestScore}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, highlighted = false }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={`text-lg font-semibold mt-1 ${highlighted ? "text-blue-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}
