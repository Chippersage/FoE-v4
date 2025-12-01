import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import { fetchLearnerSessionActivity } from "../../lib/mentor-api";
import { useFetch } from "../../hooks/useFetch";
import SessionActivityTable from "../components/SessionActivityTable";
import TableSkeleton from "../components/skeletons/TableSkeleton";
import { Search, RefreshCw, Users, Activity, Calendar, Clock, User, Mail } from "lucide-react";
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

  // Calculate stats
  const stats = {
    totalUsers: activities?.length || 0,
    activeUsers: activities?.filter(a => a.status === "ACTIVE").length || 0,
    totalSessions: activities?.reduce((total, user) => total + (user.sessions?.length || 0), 0) || 0,
    activeToday: activities?.filter(user => {
      if (!user.lastLogin) return false;
      const lastLogin = new Date(user.lastLogin);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length || 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Monitor</h1>
          <p className="text-sm text-gray-600">Track learner sessions and activity patterns</p>
        </div>

        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Learners</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Learners</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalSessions}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.activeToday}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Learner Sessions</h2>
                <p className="text-sm text-gray-600">Monitor and track learner engagement</p>
              </div>
            </div>
            
            <div className="relative w-full lg:w-auto lg:min-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-700 font-medium">Error loading activity data</p>
                <p className="text-red-600 text-sm mt-1">{error.message}</p>
                <button
                  onClick={() => refresh()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
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
    </div>
  );
}