import React, { useState } from "react";
import type { LearnerSessionActivity } from "@/types/mentor.types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  activities: LearnerSessionActivity[] | null | undefined;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  limit?: number;
  search?: string;
}

export default function SessionActivityTable({
  activities,
  isLoading = false,
  error = null,
  onRefresh,
  limit = 25,
  search = "",
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        Error loading session activity: {error.message}
      </div>
    );
  }

  // ✅ SAFELY handle activities data
  const safeActivities = Array.isArray(activities) ? activities : [];
  
  const filtered = safeActivities
    .filter((a) =>
      `${a.userName || ''} ${a.userEmail ?? ""}`.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, limit);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Recent Learner Sessions</h4>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          {safeActivities.length === 0 ? "No session data available" : "No matching sessions found"}
        </div>
      ) : (
        <div className="space-y-3 divide-y">
          {filtered.map((row) => {
            const isOpen = !!expanded[row.userId];
            const safeSessions = Array.isArray(row.sessions) ? row.sessions : [];
            
            return (
              <div key={row.userId} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{row.userName || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">{row.userEmail || "—"}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Last:{" "}
                      {row.lastLogin ? new Date(row.lastLogin).toLocaleString() : "—"}
                    </div>

                    {safeSessions.length > 0 && (
                      <button
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [row.userId]: !s[row.userId] }))
                        }
                        className="p-1 rounded hover:bg-gray-100"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && safeSessions.length > 0 && (
                  <div className="mt-3 text-sm text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {safeSessions.map((s) => (
                        <div
                          key={s.sessionId}
                          className="p-2 bg-gray-50 rounded border border-gray-100"
                        >
                          <div className="text-xs text-gray-600">
                            {s.timestamp ? new Date(s.timestamp).toLocaleString() : "Unknown date"}
                          </div>
                          <div className="text-sm font-medium">
                            {s.activityName || "Session"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {s.durationSeconds ? `Duration: ${Math.round(s.durationSeconds / 60)}min` : "Duration: —"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}