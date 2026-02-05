import { useState, useRef } from "react";
import { Typography } from "@mui/material";
import ExportButtons from "./ExportButtons";

type SortDirection = "asc" | "desc";

const ProgressDataTable = ({ data }: any) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({
    key: "leaderboardScore",
    direction: "desc",
  });

  const [hoveredHeader, setHoveredHeader] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  if (!data?.users?.length) {
    return <Typography>No data available</Typography>;
  }

  /* -------------------- TOTALS -------------------- */
  const firstUser = data.users.find((u: any) => u.userId !== "All Learners");
  const totals = {
    stages: firstUser?.totalStages ?? 0,
    units: firstUser?.totalUnits ?? 0,
    subconcepts: firstUser?.totalSubconcepts ?? 0,
  };

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    { key: "userId", label: "Learner ID", sortable: true },
    { key: "userName", label: "Learner Name", sortable: true },
    { key: "programName", label: "Program Name", sortable: true },
    {
      key: "completedStages",
      label: "Completed Modules",
      total: totals.stages,
      sortable: true,
    },
    {
      key: "completedUnits",
      label: "Completed Sessions",
      total: totals.units,
      sortable: true,
    },
    {
      key: "completedSubconcepts",
      label: "Completed Activities",
      total: totals.subconcepts,
      sortable: true,
    },
    { key: "leaderboardScore", label: "Leaderboard Score", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  /* -------------------- SORTING -------------------- */
  const sortedUsers = [...data.users]
    .filter((u: any) => u.userId !== "All Learners")
    .sort((a: any, b: any) => {
      const { key, direction } = sortConfig;

      // 🔒 Status priority (ALWAYS)
      if (a.status !== b.status) {
        return a.status === "ACTIVE" ? -1 : 1;
      }

      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return direction === "asc"
        ? (aVal ?? 0) - (bVal ?? 0)
        : (bVal ?? 0) - (aVal ?? 0);
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
    const value = user[column.key];

    if (column.key === "status") {
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
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return value ?? "—";
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
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
        />
      </div>

      {/* Table */}
      <div ref={tableRef} className="w-full overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    border border-sky-200 bg-sky-100 p-3 text-sm
                    cursor-pointer select-none transition-colors
                    ${
                      sortConfig.key === column.key
                        ? "bg-sky-200"
                        : ""
                    }
                    ${
                      hoveredHeader === column.key
                        ? "bg-sky-50"
                        : ""
                    }
                  `}
                  onClick={() =>
                    column.sortable && handleSort(column.key)
                  }
                  onMouseEnter={() => setHoveredHeader(column.key)}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex justify-between items-center">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="ml-2 opacity-60">
                        {sortConfig.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>
                  {column.total !== undefined && (
                    <div className="text-xs text-gray-600 mt-1">
                      Total: {column.total}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedUsers.map((user: any, index: number) => (
              <tr
                key={`${user.userId}-${index}`}
                className="hover:bg-sky-50 transition-colors"
              >
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
