import React, { useState } from "react";
import type { LearnerSessionActivity } from "@/types/mentor.types";
import { ChevronDown, ChevronUp, Calendar, Clock, User, Mail, Activity,TrendingUp,Zap, RefreshCw,} from "lucide-react";

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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <span className="font-medium">Error loading session activity:</span>
        </div>
        <p className="mt-1 text-sm">{error.message}</p>
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

  const toggleExpanded = (userId: string) => {
    setExpanded(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "disabled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filtered.length} of {safeActivities.length} learners</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {safeActivities.length === 0 ? "No session data available" : "No matching sessions found"}
            </h3>
            <p className="text-gray-500">
              {safeActivities.length === 0 
                ? "Session data will appear here once learners start their activities."
                : "Try adjusting your search terms to find what you're looking for."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const isOpen = !!expanded[row.userId];
            const safeSessions = Array.isArray(row.sessions) ? row.sessions : [];
            const lastSession = safeSessions[0];
            
            return (
              <div 
                key={row.userId} 
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {row.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      {row.status === "ACTIVE" && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {row.userName || 'Unknown User'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(row.status)}`}>
                          {row.status || "UNKNOWN"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{row.userId}</span>
                        </div>
                        {row.userEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{row.userEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Last Activity */}
                      {row.lastLogin && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Last active: {new Date(row.lastLogin).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sessions Count & Expand Button */}
                  <div className="flex items-center gap-4">
                    {safeSessions.length > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Activity className="h-4 w-4" />
                          <span>{safeSessions.length} session{safeSessions.length !== 1 ? 's' : ''}</span>
                        </div>
                        {lastSession && (
                          <div className="text-xs text-gray-500 mt-1">
                            Latest: {formatDuration(lastSession.durationSeconds)}
                          </div>
                        )}
                      </div>
                    )}

                    {safeSessions.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(row.userId)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                        aria-expanded={isOpen}
                      >
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Sessions */}
                {isOpen && safeSessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recent Sessions ({safeSessions.length})
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {safeSessions.map((session, index) => (
                        <div
                          key={session.sessionId}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {session.activityName || "Learning Session"}
                              </span>
                            </div>
                            {index === 0 && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                                Latest
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {session.timestamp ? new Date(session.timestamp).toLocaleDateString() : "Unknown date"}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {session.timestamp ? new Date(session.timestamp).toLocaleTimeString() : "Unknown time"}
                              </span>
                            </div>

                            {session.durationSeconds && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-medium">Duration:</span>
                                <span>{formatDuration(session.durationSeconds)}</span>
                              </div>
                            )}

                            {session.status && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  session.status === "completed" 
                                    ? "bg-green-100 text-green-800" 
                                    : session.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {session.status.replace('_', ' ')}
                                </span>
                              </div>
                            )}
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