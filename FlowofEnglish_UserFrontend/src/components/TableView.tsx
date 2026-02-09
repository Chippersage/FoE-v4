import { useState, useRef } from "react";
import { Typography } from "@mui/material";
import ExportButtons from "./ExportButtons";

type SortDirection = "asc" | "desc";

/* -------------------- DATE FORMATTER -------------------- */
const formatDate = (epoch?: number) => { if (!epoch) return "No Activity";
  return new Date(epoch * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", });
};

const ProgressDataTable = ({ data }: any) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection; }>({
    key: "leaderboardScore", direction: "desc", });
  const [hoveredHeader, setHoveredHeader] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  if (!data?.users?.length) {
    return <Typography>No data available</Typography>;
  }

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    { key: "userId", label: "Learner ID", sortable: true },
    { key: "userName", label: "Learner Name", sortable: true },
    { key: "programName", label: "Program Name", sortable: true },
    { key: "modules", label: "Modules Completed", sortable: true },
    { key: "sessions", label: "Sessions Completed", sortable: true },
    { key: "activities", label: "Activities Completed", sortable: true },
    { key: "assignments", label: "Assignments Submitted", sortable: true },
    { key: "recentAttemptDate", label: "Recent Activity", sortable: true },
    { key: "createdAt", label: "Enrolled On", sortable: true },
    { key: "leaderboardScore", label: "Leaderboard Score", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

   /* -------------------- SORTING -------------------- */
  const sortedUsers = [...data.users].sort((a: any, b: any) => {
    const { key, direction } = sortConfig;

    //  ACTIVE users always first
    if (a.status !== b.status) {
      return a.status === "ACTIVE" ? -1 : 1;
    }

    const getSortableValue = (user: any) => {
      switch (key) {
        case "modules":
          return user.completedStages ?? 0;
        case "sessions":
          return user.completedUnits ?? 0;
        case "activities":
          return user.completedSubconcepts ?? 0;
        case "assignments":
          return user.completedAssignments ?? 0;
        default:
          return user[key] ?? 0;
      }
    };

    const aVal = getSortableValue(a);
    const bVal = getSortableValue(b);

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  /* -------------------- HANDLERS -------------------- */
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* -------------------- CELL RENDERER -------------------- */
  const renderCell = (user: any, column: any) => {
    switch (column.key) {
      case "modules":
        return `${user.completedStages ?? 0} / ${user.totalStages ?? 0}`;

      case "sessions":
        return `${user.completedUnits ?? 0} / ${user.totalUnits ?? 0}`;

      case "activities":
        return `${user.completedSubconcepts ?? 0} / ${user.totalSubconcepts ?? 0}`;

      case "assignments":
        return `${user.completedAssignments ?? 0} / ${user.totalAssignments ?? 0}`;

      case "recentAttemptDate":
        return formatDate(user.recentAttemptDate);

      case "createdAt":
        return formatDate(user.createdAt);

      case "status":
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              user.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.status}
          </span>
        );

      default: {
        const value = user[column.key];
        if (typeof value === "number") return value.toLocaleString();
        return value ?? "—";
      }
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Learners Progress
        </h2>
        <ExportButtons
          componentRef={{ tableRef }}
          filename="learner_progress_data"
          exportType="table"
          allowedFormats={["csv"]}
          tableData={data}
          programName={data?.programName}
        />
      </div>

      <div ref={tableRef} className="w-full overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border border-sky-200 bg-sky-100 p-3 text-sm cursor-pointer ${
                    sortConfig.key === column.key ? "bg-sky-200" : ""
                  }`}
                  onClick={() => handleSort(column.key)}
                  onMouseEnter={() => setHoveredHeader(column.key)}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex justify-between">
                    {column.label}
                    <span className="opacity-60">
                      {sortConfig.key === column.key
                        ? sortConfig.direction === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedUsers.map((user: any, idx: number) => (
              <tr key={idx} className="hover:bg-sky-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="border border-sky-200 p-3 text-sm"
                  >
                    {renderCell(user, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDataTable;