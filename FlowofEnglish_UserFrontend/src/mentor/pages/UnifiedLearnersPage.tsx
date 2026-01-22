import { useUserContext } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { disableUserInCohort, fetchLatestSessions, fetchMentorCohortUsers, fetchProgramReport, fetchUserAssignments, fetchUserConceptsProgress,
    reactivateUserInCohort, } from '@/mentor/mentor-api';
import type { ConceptsProgressResponse } from '@/mentor/mentor.types';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity as ActivityIcon, AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, Clock, Download, HelpCircle,
    RefreshCw, Search, SortAsc, SortDesc, Target, TrendingUp, UserCheck, Users, Users as UsersIcon, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProgramHeader from '../components/analytics/ProgramHeader';
import ProgressOverviewCards from '../components/analytics/ProgressOverviewCards';
import RadarChartComponent from '../components/analytics/RadarChartComponent';
import RecentProgramAttempts from '../components/analytics/RecentProgramAttempts';
import SkillBreakdown from '../components/analytics/SkillBreakdown';
import StageAccordion from '../components/analytics/StageAccordion';
import StudentAssignments from '../components/analytics/StudentAssignments';
import TimeAnalysis from '../components/analytics/TimeAnalysis';
import MentorRemarks from '../components/analytics/MentorRemarks';
import ReactPaginate from 'react-paginate';

// Status Toggle Component
const StatusToggle: React.FC<{
  isActive: boolean;
  onToggle: () => void;
  userId: string;
  isLoading?: boolean;
}> = ({ isActive, onToggle, userId, isLoading = false }) => {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive ? 'bg-green-500' : 'bg-gray-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="sr-only">
        {isActive ? 'Disable user' : 'Enable user'}
      </span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        } ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-2 w-2 border border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
      </span>
    </button>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
  description?: string;
}> = ({ title, value, icon, color, isLoading = false, description }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function UnifiedLearnersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { cohortId, learnerId: urlLearnerId, programId: urlProgramId } = useParams<{
    cohortId: string;
    learnerId?: string;
    programId?: string;
  }>();
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>( urlLearnerId || null );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const mentorId = user?.userId || "";
  
  // List view states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "score" | "joinDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "disable" | "reactivate";
    userId: string;
    userName: string;
  } | null>(null);
  const [disableReason, setDisableReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [conceptsProgressData, setConceptsProgressData] = useState<ConceptsProgressResponse | null>(null);
  const [isConceptsLoading, setIsConceptsLoading] = useState(false);
  const [mentorRemarks, setMentorRemarks] = useState("");
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const saveRemarks = () => {
  const remarks = remarksRef.current?.value || "";
  setMentorRemarks(remarks);
  alert("Remarks saved! They will be included in the PDF report.");
};

  // Dashboard states
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryProgramId = queryParams.get('programId');

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 1. Load all users
  const { data: cohortData, isLoading: usersLoading, refresh: refreshUsers } = useFetch(
    () => {
      if (!mentorId || !cohortId) return null;
      return fetchMentorCohortUsers(mentorId, cohortId);
    },
    [mentorId, cohortId]
  );
  // Determine programId
  const progId = queryProgramId || urlProgramId || cohortData?.cohort?.program?.programId;

  // 2. Load all sessions data for the cohort (for stats)
  const { data: allSessionsData, isLoading: allSessionsLoading } = useFetch(
    () => {
      if (!mentorId || !cohortId) return null;
      return fetchLatestSessions(mentorId, cohortId);
    },
    [mentorId, cohortId]
  );

  // 3. Load sessions data for selected learner
  const { data: sessionsData, isLoading: sessionsLoading } = useFetch(
    () => {
      if (!mentorId || !cohortId) return null;
      return fetchLatestSessions(mentorId, cohortId, selectedLearnerId || undefined);
    },
    [mentorId, cohortId, selectedLearnerId]
  );

  // 4. Load learner analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error, refresh: refreshAnalytics } = useFetch(
    () => {
      if (!selectedLearnerId || !progId) return null;
      return fetchProgramReport(selectedLearnerId, progId);
    },
    [selectedLearnerId, progId]
  );

  // 5. Load user assignments data
  const { data: assignmentsData, isLoading: assignmentsLoading, refresh: refreshAssignments } = useFetch(
    () => {
      if (!selectedLearnerId || !cohortId || !progId) return null;
      return fetchUserAssignments(cohortId, selectedLearnerId, progId);
    },
    [selectedLearnerId, cohortId, progId]
  );

  // Combine refresh functions
  const handleRefreshAll = useCallback(() => {
    refreshAnalytics();
    refreshAssignments();
  }, [refreshAnalytics, refreshAssignments]);

  //6. Fetch concepts progress when a learner is selected
  useEffect(() => {
    const fetchConceptsProgress = async () => {
      if (!selectedLearnerId || !progId) {
        setConceptsProgressData(null);
        return;
      }

      setIsConceptsLoading(true);
      try {
        const data = await fetchUserConceptsProgress(progId, selectedLearnerId);
        setConceptsProgressData(data);
      } catch (error) {
        console.error('Error fetching concepts progress:', error);
        setConceptsProgressData(null);
      } finally {
        setIsConceptsLoading(false);
      }
    };

    if (selectedLearnerId && progId) {
      fetchConceptsProgress();
    } else {
      setConceptsProgressData(null);
    }
  }, [selectedLearnerId, progId]);

  // Process skill data function
  const processSkillData = useCallback((concepts: any[]) => {
    if (!concepts) return [];
    
    const skillGroups = concepts.reduce((acc, concept) => {
      const skill1 = concept['conceptSkill-1'] || 'Other';
      
      if (!acc[skill1]) {
        acc[skill1] = {
          name: skill1,
          totalScore: 0,
          userScore: 0,
          conceptCount: 0,
        };
      }
      
      acc[skill1].totalScore += concept.totalMaxScore;
      acc[skill1].userScore += concept.userTotalScore;
      acc[skill1].conceptCount += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(skillGroups)
      .filter((skill: any) => skill.name !== '')
      .map((skill: any) => ({
        name: skill.name,
        score: skill.totalScore > 0 ? Math.round((skill.userScore / skill.totalScore) * 100) : 0,
        conceptCount: skill.conceptCount,
      }));
  }, []);

  // Skill colors constant - moved outside component for better performance
  const skillColors = {
    'Grammar': '#FF6B6B',
    'Reading': '#4ECDC4',
    'Writing': '#45B7D1',
    'Speaking': '#4CAF50',
    'Critical Thinking': '#FF1493',
    'Active listening': '#D2B48C',
    'Other': '#FF69B4'
  };


  // Calculate stats from data
  const stats = useMemo(() => {
    if (!cohortData || !allSessionsData) {
      return {
        totalLearners: 0,
        activeLearners: 0,
        activeToday: 0,
        activeNow: 0,
        isLoading: true
      };
    }

    const totalLearners = cohortData.cohort?.totalUsers || 0;
    const activeLearners = cohortData.cohort?.activeUsers || 0;
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get current time minus 5 minutes for "active now"
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    let activeToday = 0;
    let activeNow = 0;
    
    // Track unique users
    const usersActiveToday = new Set<string>();
    const usersActiveNow = new Set<string>();
    
    // Process all sessions to find active users
    if (allSessionsData && allSessionsData.sessions) {
      allSessionsData.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.createdAt);
        
        // Check if session was today
        if (sessionDate >= today) {
          usersActiveToday.add(session.userId);
        }
        
        // Check if session was within last 5 minutes
        if (sessionDate >= fiveMinutesAgo) {
          usersActiveNow.add(session.userId);
        }
      });
    }
    
    activeToday = usersActiveToday.size;
    activeNow = usersActiveNow.size;
    
    return {
      totalLearners,
      activeLearners,
      activeToday,
      activeNow,
      isLoading: false
    };
  }, [cohortData, allSessionsData]);

  // Update URL when learner is selected
  useEffect(() => {
    if (!cohortId) return;
    
    if (selectedLearnerId && progId) {
      const newPath = `/mentor/${cohortId}/learners?learnerId=${selectedLearnerId}&programId=${progId}`;
      navigate(newPath, { replace: true });
    } else if (selectedLearnerId) {
      const newPath = `/mentor/${cohortId}/learners?learnerId=${selectedLearnerId}`;
      navigate(newPath, { replace: true });
    } else {
      navigate(`/mentor/${cohortId}/learners`, { replace: true });
    }
  }, [selectedLearnerId, progId, cohortId, navigate]);

  // Initialize selected learner from URL
  useEffect(() => {
    if (urlLearnerId && urlLearnerId !== selectedLearnerId) {
      setSelectedLearnerId(urlLearnerId);
    }
  }, [urlLearnerId]);

  // Get selected learner info
  const selectedLearner = cohortData?.users?.find(
    user => user.userId === selectedLearnerId
  );

  // Notification handler
  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle user actions
  const handleUserAction = useCallback(async (userId: string, action: "disable" | "reactivate", reason?: string) => {
    if (!cohortId || !userId) return;
    
    setActionLoading(userId);
    try {
      if (action === "disable") {
        await disableUserInCohort(userId, cohortId, reason || "No reason provided");
        showNotification("success", "User disabled successfully");
      } else {
        await reactivateUserInCohort(userId, cohortId);
        showNotification("success", "User reactivated successfully");
      }
      
      // Refresh users list
      refreshUsers();
      
      // If the current selected user was modified, refresh analytics too
      if (userId === selectedLearnerId) {
        refreshAnalytics();
      }
    } catch (error) {
      console.error(`${action} user error:`, error);
      showNotification("error", `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
      setShowConfirmation(false);
      setPendingAction(null);
      setDisableReason("");
    }
  }, [cohortId, selectedLearnerId, refreshUsers, refreshAnalytics, showNotification]);

  // Show confirmation dialog
  const showActionConfirmation = (userId: string, userName: string, action: "disable" | "reactivate") => {
    setPendingAction({ type: action, userId, userName });
    setShowConfirmation(true);
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!cohortData?.users) return [];

    let filtered = cohortData.users.filter((u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

// Apply sorting - Disabled users always go to the bottom
  filtered.sort((a, b) => {
    // First, sort by status: Active users come first, Disabled users come last
    const statusOrder = { "ACTIVE": 0, "DISABLED": 1 };
    const statusA = statusOrder[a.status] || 2;
    const statusB = statusOrder[b.status] || 2;
    
    if (statusA !== statusB) {
      return statusOrder === "asc" ? statusA - statusB : statusB - statusA;
    }

    // If same status, then sort by the selected field
    let aValue: string | number = "";
    let bValue: string | number = "";

    switch (sortBy) {
      case "name":
        aValue = a.userName.toLowerCase();
        bValue = b.userName.toLowerCase();
        break;
      case "score":
        aValue = a.leaderboardScore;
        bValue = b.leaderboardScore;
        break;
      case "joinDate":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === "asc" 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  return filtered;
}, [cohortData?.users, search, statusFilter, sortBy, sortOrder]);

  // Toggle sort order
  const toggleSort = useCallback((field: "name" | "score" | "joinDate") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }, [sortBy, sortOrder]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    refreshUsers().finally(() => setRefreshing(false));
  }, [refreshUsers]);

  // Handle learner selection
  const handleSelectLearner = useCallback((userId: string) => {
    setSelectedLearnerId(userId);
    setShowUserDropdown(false);
  }, []);

  // Handle exports
  const handleExport = useCallback((format: 'pdf' | 'excel' | 'csv') => {
    if (!analyticsData) return;
    
    const filename = `${analyticsData.userName || selectedLearnerId}_${analyticsData.programName || progId}_Report`;
    console.log(`Exporting as ${format}: ${filename}`);
    
    // TODO: Implement actual export functionality
    alert(`Exporting as ${format} - ${filename}`);
  }, [analyticsData, selectedLearnerId, progId]);

  // Disable reasons
  const disableReasons = [
    "User is no longer enrolled at the school",
    "User requested to leave the program",
    "User account compromised",
    "Other"
  ];

  // Calculate pagination values
const offset = currentPage * itemsPerPage;
const pageCount = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

// Get current page items
const currentItems = filteredAndSortedUsers.slice(
  offset,
  offset + itemsPerPage
);

// Handle page click
const handlePageClick = ({ selected }: { selected: number }) => {
  setCurrentPage(selected);
};

// Also add items per page selector state and handler
const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);

const handleItemsPerPageChange = (count: number) => {
  setItemsPerPage(count);
  setCurrentPage(0); // Reset to first page when changing items per page
  setShowItemsPerPageDropdown(false);
};
  // If no learner selected, show list view
  if (!selectedLearnerId) {
    return (
      <div className="p-6 space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            } animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Learners in {cohortData?.cohort?.cohortName || 'Cohort'}
            </h1>
            <p className="text-gray-600">Manage learners and view their progress analytics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || usersLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Stats Cards - 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Learners"
            value={stats.totalLearners}
            icon={<UsersIcon className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100"
            isLoading={usersLoading || stats.isLoading}
            description="All registered learners"
          />
          
          <StatsCard
            title="Active Learners"
            value={stats.activeLearners}
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
            color="bg-green-100"
            isLoading={usersLoading || stats.isLoading}
            description="Currently enabled users"
          />
          
          <StatsCard
            title="Active Today"
            value={stats.activeToday}
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            color="bg-purple-100"
            isLoading={allSessionsLoading || stats.isLoading}
            description="Users active in last 24 hours"
          />
          
          <StatsCard
            title="Active Now"
            value={stats.activeNow}
            icon={<ActivityIcon className="h-5 w-5 text-orange-600" />}
            color="bg-orange-100"
            isLoading={allSessionsLoading || stats.isLoading}
            description="Real-time active users"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search learner by name or ID..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>

            <div className="flex border rounded-lg divide-x">
              <button
                onClick={() => toggleSort("name")}
                className={`px-3 py-2 flex items-center gap-1 ${
                  sortBy === "name" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                }`}
              >
                Name
                {sortBy === "name" && (
                  sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => toggleSort("score")}
                className={`px-3 py-2 flex items-center gap-1 ${
                  sortBy === "score" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                }`}
              >
                Score
                {sortBy === "score" && (
                  sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usersLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded animate-pulse"></div></td>
                    </tr>
                  ))
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No learners found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((user) => (
                    <tr 
                      key={user.userId} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectLearner(user.userId)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.userName}</div>
                            <div className="text-sm text-gray-500">{user.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.userEmail || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            {user.leaderboardScore} pts
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.createdAt * 1000).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <StatusToggle
                            isActive={user.status === "ACTIVE"}
                            onToggle={() => showActionConfirmation(
                              user.userId, 
                              user.userName, 
                              user.status === "ACTIVE" ? "disable" : "reactivate"
                            )}
                            userId={user.userId}
                            isLoading={actionLoading === user.userId}
                          />
                          <button
                            onClick={() => handleSelectLearner(user.userId)}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View Analytics
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls - Moved outside the table but inside the table container */}
          {filteredAndSortedUsers.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{offset + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(offset + itemsPerPage, filteredAndSortedUsers.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAndSortedUsers.length}</span> learners
                  </div>
                  
                  {/* Items per page selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {itemsPerPage} per page
                      <ChevronDown className={`h-4 w-4 transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showItemsPerPageDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setShowItemsPerPageDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[120px]">
                          {[5, 10, 20, 50].map((count) => (
                            <button
                              key={count}
                              onClick={() => handleItemsPerPageChange(count)}
                              className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                                itemsPerPage === count ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              {count} per page
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Pagination */}
                <ReactPaginate
                  previousLabel={
                    <span className="flex items-center gap-1 text-sm">
                      <ChevronDown className="h-4 w-4 rotate-90" />
                      Previous
                    </span>
                  }
                  nextLabel={
                    <span className="flex items-center gap-1 text-sm">
                      Next
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </span>
                  }
                  breakLabel={'...'}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageClick}
                  containerClassName="flex items-center gap-1"
                  pageClassName=""
                  pageLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                  activeClassName=""
                  activeLinkClassName="px-3 py-1.5 text-sm rounded bg-blue-50 border border-blue-200 text-blue-600 font-medium"
                  previousClassName="mr-2"
                  nextClassName="ml-2"
                  previousLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-1 transition-colors"
                  nextLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-1 transition-colors"
                  disabledClassName="opacity-50 cursor-not-allowed"
                  disabledLinkClassName="hover:bg-transparent"
                  forcePage={currentPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show dashboard view when learner is selected
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setSelectedLearnerId(null)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Learners List
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {selectedLearner?.userName?.charAt(0).toUpperCase() || 'L'}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">
                    {selectedLearner?.userName || analyticsData?.userName || selectedLearnerId}
                  </div>
                  <div className="text-xs text-gray-500">Viewing analytics</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select Learner
                      </div>
                      {cohortData?.users?.map((user) => (
                        <button
                          key={user.userId}
                          onClick={() => handleSelectLearner(user.userId)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-gray-50 ${
                            selectedLearnerId === user.userId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.userName}</div>
                            <div className="text-xs text-gray-500 truncate">{user.userId}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <ProgramHeader 
            programName={analyticsData?.programName || progId || "Unknown Program"}
            programDesc={analyticsData?.programDesc || ""}
            learnerName={analyticsData?.userName || selectedLearnerId || "Unknown Learner"}
          />
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button
              className={`px-3 py-2 text-sm ${viewMode === 'detailed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
          </div>
          
          <div className="relative group">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button 
                onClick={() => handleExport('pdf')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as PDF
              </button>
              <button 
                onClick={() => handleExport('excel')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as Excel
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedLearner?.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`font-medium ${selectedLearner?.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                {selectedLearner?.status || "UNKNOWN"}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          <StatusToggle
            isActive={selectedLearner?.status === "ACTIVE"}
            onToggle={() => showActionConfirmation(
              selectedLearnerId!,
              selectedLearner?.userName || "this user",
              selectedLearner?.status === "ACTIVE" ? "disable" : "reactivate"
            )}
            userId={selectedLearnerId!}
            isLoading={actionLoading === selectedLearnerId}
          />
        </div>
      </div>

      {/* Loading State */}
      {analyticsLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !analyticsLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load analytics</h3>
          <p className="text-red-600 mb-4">{error?.message || 'Unable to load learner data'}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => refreshAnalytics()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => setSelectedLearnerId(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {analyticsData && !analyticsLoading && !error && (
        <>
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <ProgressOverviewCards data={analyticsData} cohortEndDate={assignmentsData?.cohort?.cohortEndDate} />
          </div>

          {/* Conditional rendering based on viewMode */}
          {viewMode === 'overview' ? (
            <>
              {/* OVERVIEW VIEW */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6"> */}
                {/*  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Progress Overview</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Target className="h-4 w-4" />
                        <span>Completion Rate</span>
                      </div>
                    </div>
                    <CompletionChart data={analyticsData} />
                  </div> */}
                  {/* <SkillImpactMatrix stages={analyticsData.stages} /> */}

{/*  RadarChart Section */}
{/* <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm ">
  <div className="flex items-center justify-between mb-6 h-full">
    <div>
      <h3 className="text-lg font-semibold text-gray-800">Skills OverView </h3>
      <p className="text-sm text-gray-600 mt-1">
        Comprehensive view of skill proficiency across all concepts
      </p>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Target className="h-4 w-4" />
      <span>Skill Proficiency (%)</span>
    </div>
  </div>
  
  {isConceptsLoading ? (
    <div className="h-96 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500">Loading skill analysis...</p>
      </div>
    </div>
  ) : conceptsProgressData?.concepts ? (
    <RadarChartComponent data={processSkillData(conceptsProgressData.concepts)} height={450} />
  ) : (
    <div className="h-96 flex items-center justify-center">
      <p className="text-gray-500">No skill data available for this learner</p>
    </div>
  )} */}
  {/* <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="flex flex-wrap gap-4 justify-center">
      {conceptsProgressData?.concepts && processSkillData(conceptsProgressData.concepts).map((skill: any) => (
          <div key={skill.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skillColors[skill.name] || skillColors.Other }} />
            <span className="text-sm text-gray-700">{skill.name}</span>
            <span className="text-sm font-semibold text-blue-600">{skill.score}%</span>
          </div>
        ))}
    </div>
  </div> */}
{/* </div> */}
                  {/* <SessionList sessionsData={sessionsData}
                    learnerId={selectedLearnerId || undefined}
                    learnerName={selectedLearner?.userName || analyticsData?.userName}
                  /> */}
                  {/* <RecentProgramAttempts
                    analyticsData={analyticsData}
                    learnerName={selectedLearner?.userName || analyticsData?.userName}
                    onViewDetailed={() => setViewMode('detailed')}
                  />

                </div>
                <div className="space-y-6">
                {analyticsData.stages && analyticsData.stages.length > 0 && (
                    <SkillBreakdown stages={analyticsData.stages} />
                  )}
                </div> */}
                {/* <div className="space-y-6">
                  {(analyticsData.firstAttemptDate || analyticsData.lastAttemptDate) && (
                    <TimeAnalysis 
                      firstAttemptDate={analyticsData.firstAttemptDate}
                      lastAttemptDate={analyticsData.lastAttemptDate}
                    />
                  )}

                  {analyticsData.stages && analyticsData.stages.length > 0 && (
                    <SkillBreakdown stages={analyticsData.stages} />
                  )}
                </div> */}
              {/* </div> */}

                {/* OVERVIEW VIEW */}

{/* ROW 1: Radar + Skill Breakdown (SAME HEIGHT) */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

  {/* Radar Chart */}
  <div className="lg:col-span-2">
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-[520px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Skills Overview
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive view of skill proficiency across all concepts
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="h-4 w-4" />
          <span>Skill Proficiency (%)</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isConceptsLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Loading skill analysis...</p>
          </div>
        ) : conceptsProgressData?.concepts ? (
          <RadarChartComponent
            data={processSkillData(conceptsProgressData.concepts)}
            height={420}
          />
        ) : (
          <p className="text-gray-500">No skill data available</p>
        )}
      </div>
    </div>
  </div>

  {/* Skill Breakdown */}
  <div>
    {analyticsData.stages?.length > 0 && (
      <div className="h-[520px]">
        <SkillBreakdown stages={analyticsData.stages} />
      </div>
    )}
  </div>
</div>

  {/* ROW 2: Recent Attempts + Mentor Remarks */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
  {/* Recent Program Attempts */}
  <div className="lg:col-span-2 h-[520px]">
    <RecentProgramAttempts
      analyticsData={analyticsData}
      learnerName={selectedLearner?.userName || analyticsData?.userName}
      onViewDetailed={() => setViewMode("detailed")}
    />
  </div>

  {/* Mentor Remarks */}
  <div className="h-[520px]">
    <MentorRemarks
      remarksRef={remarksRef}
      mentorRemarks={mentorRemarks}
      setMentorRemarks={setMentorRemarks}
      onSave={saveRemarks}
    />
  </div>
</div>



              <StudentAssignments
                data={analyticsData}
                assignmentsData={assignmentsData}
                cohortId={cohortId}
                cohortName={cohortData?.cohort?.cohortName}
                learnerName={selectedLearner?.userName || analyticsData?.userName}
                programId={progId}
                onRefresh={handleRefreshAll}
              />
            </>
          ) : (
            <>
              {/* DETAILED VIEW */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Detailed Progress & Attempt History</h3>
                        <p className="text-gray-600 mt-1">
                          Interactive view combining Modules progress with detailed attempt history
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          onClick={() => {
                            if (expandedStage) {
                              setExpandedStage(null);
                            } else {
                              setExpandedStage(analyticsData.stages[0]?.stageId || null);
                            }
                          }}
                        >
                          {expandedStage ? 'Collapse All' : 'Expand All'}
                        </button>
                        <button 
                          onClick={() => setViewMode('overview')}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Back to Overview
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {analyticsData.stages.map((stage: any, index: number) => (
                        <motion.div
                          key={stage.stageId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <StageAccordion
                            stage={stage}
                            isExpanded={expandedStage === stage.stageId}
                            onToggle={() => setExpandedStage(
                              expandedStage === stage.stageId ? null : stage.stageId
                            )}
                            defaultExpandedUnits={new Set()}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showConfirmation && pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowConfirmation(false);
              setPendingAction(null);
              setDisableReason("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 text-white ${
                pendingAction.type === "disable" 
                  ? "bg-gradient-to-r from-red-600 to-red-700" 
                  : "bg-gradient-to-r from-green-600 to-green-700"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {pendingAction.type === "disable" ? "Disable User" : "Reactivate User"}
                    </h2>
                    <p className="text-opacity-90 text-sm mt-1">
                      {pendingAction.type === "disable" 
                        ? "Are you sure you want to disable this user?" 
                        : "Are you sure you want to reactivate this user?"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">User Details:</h3>
                  <p><strong>Name:</strong> {pendingAction.userName}</p>
                  <p><strong>ID:</strong> {pendingAction.userId}</p>
                </div>

                {pendingAction.type === "disable" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disable Reason
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                      value={disableReason}
                      onChange={(e) => setDisableReason(e.target.value)}
                    >
                      <option value="">Select reason</option>
                      {disableReasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={`p-3 rounded-lg ${
                  pendingAction.type === "disable" 
                    ? "bg-red-50 border border-red-200 text-red-700" 
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}>
                  <p className="text-sm font-medium">
                    {pendingAction.type === "disable" 
                      ? "⚠️ The user will lose access to the cohort and their progress will be paused."
                      : "✅ The user will regain access to the cohort and can continue their progress."}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setPendingAction(null);
                      setDisableReason("");
                    }}
                    disabled={actionLoading === pendingAction.userId}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUserAction(
                      pendingAction.userId, 
                      pendingAction.type,
                      pendingAction.type === "disable" ? disableReason : undefined
                    )}
                    disabled={(pendingAction.type === "disable" && !disableReason) || actionLoading === pendingAction.userId}
                    className={`flex-1 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
                      pendingAction.type === "disable" 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionLoading === pendingAction.userId ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      pendingAction.type === "disable" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />
                    )}
                    {actionLoading === pendingAction.userId
                      ? (pendingAction.type === "disable" ? "Disabling..." : "Reactivating...") 
                      : (pendingAction.type === "disable" ? "Disable User" : "Reactivate User")
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}