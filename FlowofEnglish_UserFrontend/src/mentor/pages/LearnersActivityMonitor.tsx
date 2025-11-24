import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import { fetchLearnerSessionActivity } from "../../lib/mentor-api";
import { useFetch } from "../../hooks/useFetch";
import SessionActivityTable from "../components/SessionActivityTable";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import { Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

export default function LearnersActivityMonitor() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const { user } = useUserContext();
  const mentorId = user?.userId ?? "";

  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);

  const { data: activities, isLoading, error, refresh } = useFetch(
    () => (cohortId && mentorId ? fetchLearnerSessionActivity(cohortId, mentorId) : null),
    [cohortId, mentorId]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Monitor</h1>
          <p className="text-sm text-gray-600">Recent sessions and activity per learner</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => refresh()} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="pl-10 pr-3 py-2 border rounded w-full"
              placeholder="Search learner name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <SessionActivityTable
            activities={activities ?? []}
            isLoading={isLoading}
            error={error ?? null}
            onRefresh={() => refresh()}
            search={debounced}
          />
        )}
      </div>
    </div>
  );
}