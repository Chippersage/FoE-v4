// @ts-nocheck
import React, { useState, useRef } from "react";
import ExportButtons from "./ExportButtons";

type ProgressDataTableProps = {
  users: any[];
  totals?: {
    totalStages: number;
    totalUnits: number;
    totalSubconcepts: number;
  };
};

const ProgressDataTable: React.FC<ProgressDataTableProps> = ({ 
  users = [], 
  totals = { totalStages: 10, totalUnits: 41, totalSubconcepts: 231 } 
}) => {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [sortKey, setSortKey] = useState<keyof any>("leaderboardScore");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key as any);
      setDirection("desc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;

    if (typeof aVal === "string") {
      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    return direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  // Columns with totals in header
  const columns = [
    { 
      key: "userId", 
      label: "Learner ID", 
      width: "w-1/6",
      showTotal: false 
    },
    { 
      key: "userName", 
      label: "Learner Name", 
      width: "w-1/5",
      showTotal: false 
    },
    { 
      key: "completedStages", 
      label: `Completed Stages (${totals.totalStages})`, 
      width: "w-1/6",
      showTotal: true 
    },
    { 
      key: "completedUnits", 
      label: `Completed Units (${totals.totalUnits})`, 
      width: "w-1/6",
      showTotal: true 
    },
    { 
      key: "completedSubconcepts", 
      label: `Completed Subconcepts (${totals.totalSubconcepts})`, 
      width: "w-1/6",
      showTotal: true 
    },
    { 
      key: "leaderboardScore", 
      label: "Leaderboard Score", 
      width: "w-1/6",
      showTotal: false 
    },
  ];

  return (
    <div className="bg-white p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0EA5E9]">Learners Progress Data</h2>
        <ExportButtons
          componentRef={tableRef}
          filename="learners_progress_data"
          exportType="table"
          tableData={sortedUsers}
          columns={columns.map(c => ({ header: c.label, accessor: c.key }))}
        />
      </div>

      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full text-sm border border-[#0EA5E9] rounded-lg overflow-hidden">
          <thead className="bg-[#0EA5E9] text-white">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`p-3 text-left text-xs font-semibold cursor-pointer hover:bg-[#0c96d4] transition-colors ${c.width}`}
                  onClick={() => handleSort(c.key)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span>
                        {c.showTotal ? c.label.split('(')[0].trim() : c.label}
                      </span>
                      <span className="ml-1">
                        {sortKey === c.key ? (direction === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </div>
                    {c.showTotal && (
                      <div className="text-[10px] font-normal mt-1 opacity-90">
                        Total: {c.label.match(/\((\d+)\)/)?.[1] || '0'}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u, index) => (
              <tr 
                key={u.userId} 
                className={`border-b border-[#e0f2fe] hover:bg-[#f0f9ff] transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'
                }`}
              >
                <td className="p-3 font-medium text-[#0EA5E9]">{u.userId}</td>
                <td className="p-3">{u.userName}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {u.completedStages || 0}
                    </span>
                    <div className="text-xs text-gray-500">
                      {Math.round((u.completedStages / totals.totalStages) * 100)}% of total
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {u.completedUnits || 0}
                    </span>
                    <div className="text-xs text-gray-500">
                      {Math.round((u.completedUnits / totals.totalUnits) * 100)}% of total
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {u.completedSubconcepts || 0}
                    </span>
                    <div className="text-xs text-gray-500">
                      {Math.round((u.completedSubconcepts / totals.totalSubconcepts) * 100)}% of total
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm font-medium text-gray-800">
                    {u.leaderboardScore || 0}
                  </span>
                </td>
              </tr>
            ))}
            {!sortedUsers.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-gray-500"
                >
                  No learners data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        Showing {sortedUsers.length} learners
      </div>
    </div>
  );
};

export default ProgressDataTable;