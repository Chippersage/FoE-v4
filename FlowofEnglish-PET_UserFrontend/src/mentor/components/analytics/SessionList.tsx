import { Clock, Calendar, ChevronRight } from 'lucide-react';
import type { LearnerSessionActivity, SessionRecord } from '@/types/mentor.types';
import { motion } from 'framer-motion';

interface SessionListProps {
  sessionsData?: LearnerSessionActivity[];
  learnerId?: string;
  learnerName?: string;
  className?: string;
}

export default function SessionList({ 
  sessionsData, learnerId, learnerName, className = '' }: SessionListProps) {
  // Filter sessions for selected learner or show all
  const filteredData = learnerId ? sessionsData?.filter(user => user.userId === learnerId) : sessionsData;

  // Get sessions for the selected user (if any)
  const userSessions = learnerId ? filteredData?.find(user => user.userId === learnerId)?.sessions || [] : [];

  // Calculate total sessions
  const totalSessions = userSessions.length || 0;

  // Format date for display (compact version)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Format time duration (compact)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  // Format time range
  const formatTimeRange = (start?: string, end?: string) => {
    if (!start || !end) return '';
    
    const startTime = new Date(start).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    const endTime = new Date(end).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    return `${startTime}-${endTime}`;
  };

  if (!sessionsData || sessionsData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Recent Sessions</h3>
            <p className="text-xs text-gray-500">No sessions available</p>
          </div>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-center py-4 text-sm text-gray-500">
          No learning sessions recorded yet
        </div>
      </div>
    );
  }

  // If no sessions for the selected learner
  if (learnerId && userSessions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Recent Sessions</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>0 sessions</span>
              {learnerName && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                    {learnerName}
                  </span>
                </>
              )}
            </div>
          </div>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-center py-4 text-sm text-gray-500">
          This learner has no recent sessions
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-md">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Recent Sessions</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{totalSessions} sessions</span>
              {learnerId && learnerName ? (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                    {learnerName}
                  </span>
                </>
              ) : learnerId ? (
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                  Selected learner
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                  All learners
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List - Compact View */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {userSessions.slice(0, 6).map((session, index) => (
          <motion.div
            key={session.sessionId}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group flex items-center gap-3 p-2.5 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-150"
          >
            {/* Session Number */}
            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              {index + 1}
            </div>

            {/* Session Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {session.activityName || 'Learning Session'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.timestamp)}
                    </span>
                    {session.durationSeconds && (
                      <span className="text-xs text-gray-500">
                        • {formatDuration(session.durationSeconds)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  session.status === 'completed' ? 'bg-green-500' :
                  session.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
              </div>

              {/* Additional Info */}
              {session.sessionStartTimestamp && session.sessionEndTimestamp && (
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">
                    {formatTimeRange(session.sessionStartTimestamp, session.sessionEndTimestamp)}
                  </span>
                  {session.score !== undefined && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                      Score: {session.score}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      {userSessions.length > 6 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Showing 6 of {userSessions.length} sessions</span>
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Empty state handling */}
      {userSessions.length === 0 && (
        <div className="py-3 text-center">
          <div className="text-xs text-gray-500 mb-1">No sessions available</div>
          <div className="text-[10px] text-gray-400">Start learning to see sessions here</div>
        </div>
      )}
    </motion.div>
  );
}



{/* Usage Example:
import { useEffect, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { fetchLatestSessions } from '@/lib/mentor-api';
import { Clock, Calendar, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import type { LearnerSessionActivity, SessionRecord } from '@/types/mentor.types';
import { motion } from 'framer-motion';

interface SessionListProps {
  mentorId: string;
  cohortId: string;
  learnerId?: string;
  className?: string;
}

export default function SessionList({ mentorId, cohortId, learnerId, className = '' }: SessionListProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(learnerId);
  
  // Fetch sessions data
  const { data: sessionsData, isLoading, error } = useFetch(
    () => {
      if (!mentorId || !cohortId) return null;
      return fetchLatestSessions(mentorId, cohortId, selectedUserId);
    },
    [mentorId, cohortId, selectedUserId]
  );

  // Update selected user when learnerId prop changes
  useEffect(() => {
    if (learnerId && learnerId !== selectedUserId) {
      setSelectedUserId(learnerId);
    }
  }, [learnerId]);

  // Calculate total learning time
  const calculateTotalLearningTime = (sessions: SessionRecord[]) => {
    const totalSeconds = sessions.reduce((total, session) => {
      return total + (session.durationSeconds || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Format time duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get session status color
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get session icon
  const getSessionIcon = (index: number) => {
    const icons = [
      <BookOpen className="h-5 w-5" />,
      <Calendar className="h-5 w-5" />,
      <Clock className="h-5 w-5" />,
    ];
    return icons[index % icons.length];
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Sessions</h3>
            <p className="text-sm text-gray-500">Loading session data...</p>
          </div>
          <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to load sessions</h3>
          <p className="text-gray-500 mb-4">{error.message || 'Failed to fetch session data'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter sessions for selected learner or show all
  const filteredData = selectedUserId 
    ? sessionsData?.filter(user => user.userId === selectedUserId)
    : sessionsData;

  // Calculate summary statistics
  const totalSessions = filteredData?.reduce((total, user) => total + (user.sessions?.length || 0), 0) || 0;
  const totalUsers = filteredData?.length || 0;
  const totalLearningTime = filteredData?.reduce((total, user) => {
    return total + calculateTotalLearningTime(user.sessions || []);
  }, '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}
    >
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Learning Sessions</h3>
              <p className="text-sm text-gray-500">
                {selectedUserId 
                  ? `Showing sessions for ${filteredData?.[0]?.userName || 'selected learner'}`
                  : `Showing all ${totalUsers} active learners`
                }
              </p>
            </div>
          </div>
          
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{totalSessions}</span> sessions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{totalUsers}</span> {totalUsers === 1 ? 'learner' : 'learners'}
              </span>
            </div>
          </div>
        </div>
        
        
        <div className="flex-shrink-0">
          <button
            onClick={() => setSelectedUserId(undefined)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !selectedUserId 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            View All
          </button>
        </div>
      </div>

     
      <div className="space-y-4">
        {!filteredData || filteredData.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-gray-700 font-medium mb-1">No sessions found</h4>
            <p className="text-gray-500 text-sm">
              {selectedUserId 
                ? 'This learner has no recent sessions.'
                : 'No recent sessions found for this cohort.'
              }
            </p>
          </div>
        ) : (
          filteredData.map((user, userIndex) => (
            <div key={user.userId} className="space-y-3">
              
              {!selectedUserId && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{user.userName}</h4>
                      <p className="text-xs text-gray-500">{user.userId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUserId(user.userId)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    View sessions
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              
              <div className="space-y-3">
                {user.sessions?.slice(0, 5).map((session, sessionIndex) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sessionIndex * 0.05 }}
                    className="group flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    
                    <div className="p-2 bg-white border border-gray-300 rounded-lg group-hover:border-blue-400 transition-colors">
                      {getSessionIcon(sessionIndex)}
                    </div>

                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">
                            {session.activityName || 'Learning Session'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(session.timestamp)}
                            </span>
                            {session.durationSeconds && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDuration(session.durationSeconds)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        
                        {session.status && (
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      
                      <div className="mt-3 flex flex-wrap gap-3">
                        {session.score !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">
                              Score: <span className="font-semibold">{session.score}</span>
                            </span>
                          </div>
                        )}
                        
                        {session.sessionStartTimestamp && session.sessionEndTimestamp && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">
                              {new Date(session.sessionStartTimestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(session.sessionEndTimestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              
              {user.sessions && user.sessions.length > 5 && (
                <div className="text-center">
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Show {user.sessions.length - 5} more sessions
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Data updates in real-time • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View full session history
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
*/}