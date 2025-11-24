// src/mentor/components/charts/ProgressDataTable.tsx
// @ts-nocheck
import React, { useState, useRef } from "react";
import ExportButtons from "./ExportButtons";

type ProgressDataTableProps = {
  users: any[];
};

const ProgressDataTable: React.FC<ProgressDataTableProps> = ({ users = [] }) => {
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

  const columns = [
    { key: "userId", label: "Learner ID" },
    { key: "userName", label: "Learner Name" },
    { key: "status", label: "Status" },
    { key: "lastLogin", label: "Last Login" },
    { key: "leaderboardScore", label: "Score" },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Learners Table View</h2>
        <ExportButtons
          componentRef={tableRef}
          filename="learners_table"
          exportType="table"
          tableData={sortedUsers}
        />
      </div>

      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full text-sm border rounded-md">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="p-2 border cursor-pointer text-left text-xs font-semibold"
                  onClick={() => handleSort(c.key)}
                >
                  {c.label}{" "}
                  {sortKey === c.key ? (direction === "asc" ? "↑" : "↓") : "↕"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => (
              <tr key={u.userId} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.userId}</td>
                <td className="p-2">{u.userName}</td>
                <td className="p-2">{u.status}</td>
                <td className="p-2">{u.lastLogin}</td>
                <td className="p-2">{u.leaderboardScore}</td>
              </tr>
            ))}
            {!sortedUsers.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-3 text-center text-gray-500"
                >
                  No learners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressDataTable;
