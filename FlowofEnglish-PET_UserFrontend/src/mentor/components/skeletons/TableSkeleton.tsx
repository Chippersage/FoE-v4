import React from "react";

export default function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="h-3 w-36 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}