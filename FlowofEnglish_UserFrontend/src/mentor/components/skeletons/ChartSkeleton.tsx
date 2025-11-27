import React from "react";

export default function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-40 h-4 bg-gray-200 rounded" />
            <div className="flex-1 h-3 bg-gray-100 rounded" />
            <div className="w-12 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}