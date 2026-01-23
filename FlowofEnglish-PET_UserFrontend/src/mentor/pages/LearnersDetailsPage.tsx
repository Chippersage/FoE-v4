import { useUserContext } from "@/context/AuthContext";
import { disableUserInCohort, fetchMentorCohortUsers, reactivateUserInCohort } from "@/mentor/mentor-api";
import type { MentorCohortMetadata, MentorCohortUser } from "@/types/mentor.types";
import { AlertTriangle, CheckCircle2, Circle, HelpCircle, RefreshCw, Search, SortAsc, SortDesc, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function LearnersDetailsPage() {
  const { cohortId } = useParams();
  const { user } = useUserContext();
  const mentorId = user?.userId;
  
  const [data, setData] = useState<MentorCohortMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<MentorCohortUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "score" | "joinDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<"disable" | "reactivate" | null>(null);

  const disableReasons = [
    "User is no longer enrolled at the school",
    "User requested to leave the program",
    "User account compromised",
    "Other"
  ];

  // Fetch data function
  const fetchData = async () => {
    if (!cohortId || !mentorId) return;
    
    try {
      setLoading(true);
      const res = await fetchMentorCohortUsers(mentorId, cohortId);
      setData(res);
    } catch (err) {
      console.error("Mentor cohort users error:", err);
      showNotification("error", "Failed to load learners data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [cohortId, mentorId]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!data?.users) return [];

    let filtered = data.users.filter((u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
  }, [data?.users, search, statusFilter, sortBy, sortOrder]);

  // Show confirmation dialog
  const showConfirmationDialog = (action: "disable" | "reactivate") => {
    setPendingAction(action);
    setShowConfirmation(true);
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    if (!selectedUser || !cohortId) return;

    setActionLoading(true);
    try {
      if (pendingAction === "disable") {
        await disableUserInCohort(selectedUser.userId, cohortId, disableReason);
        showNotification("success", "User disabled successfully");
        setDisableReason("");
      } else if (pendingAction === "reactivate") {
        await reactivateUserInCohort(selectedUser.userId, cohortId);
        showNotification("success", "User reactivated successfully");
      }
      
      setShowModal(false);
      setShowConfirmation(false);
      setPendingAction(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`${pendingAction} user error:`, error);
      showNotification("error", `Failed to ${pendingAction} user`);
      setShowConfirmation(false);
      setPendingAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Toggle sort order
  const toggleSort = (field: "name" | "score" | "joinDate") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-10 bg-gray-200 rounded mb-6 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-40 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6">No data found</div>;

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
        <h1 className="text-2xl font-bold text-gray-800">
          Learners in {data.cohort.cohortName}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
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

        {/* Status Filter */}
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

          {/* Sort Buttons */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Total Learners</p>
          <p className="text-3xl font-bold">{data.cohort.totalUsers}</p>
        </div>
        <div className="bg-white border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-bold text-green-600">
            {data.cohort.activeUsers}
          </p>
        </div>
        <div className="bg-white border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Deactivated</p>
          <p className="text-3xl font-bold text-red-600">
            {data.cohort.deactivatedUsers}
          </p>
        </div>
      </div>

      {/* Learner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedUsers.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No learners found matching your criteria.</p>
          </div>
        )}

        {filteredAndSortedUsers.map((u: MentorCohortUser) => (
          <div
            key={u.userId}
            onClick={() => {
              setSelectedUser(u);
              setShowModal(true);
              setDisableReason("");
            }}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300 group transform hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {u.userName}
                </h2>
                <p className="text-gray-500 text-sm">{u.userId}</p>
              </div>
              
              <div className="flex items-center gap-1">
                {u.status === "ACTIVE" ? (
                  <Circle className="h-3 w-3 text-green-500 fill-green-500" />
                ) : (
                  <Circle className="h-3 w-3 text-red-500 fill-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  u.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                }`}>
                  {u.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-600">
                {u.leaderboardScore} pts
              </span>
            </div>

            <p className="text-gray-600 text-sm mt-2">
              Joined: {new Date(Number(u.createdAt) * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
            </p>
          </div>
        ))}
      </div>

      {/* Main Modal */}
      {showModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Learner Details</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedUser.userId}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-500 transform hover:scale-110 duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* User Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="font-semibold text-gray-900">{selectedUser.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.userPhoneNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Email and User Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="font-semibold text-gray-900 break-all">
                    {selectedUser.userEmail || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${
                      selectedUser.userType === "Learner" ? "bg-blue-500" :
                      selectedUser.userType === "Mentor" ? "bg-purple-500" : "bg-gray-500"
                    }`} />
                    <span className="font-semibold text-gray-900">
                      {selectedUser.userType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="font-semibold text-gray-900">
                  {selectedUser.userAddress || "N/A"}
                </p>
              </div>

              {/* Status and Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${
                      selectedUser.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className={`font-semibold ${
                      selectedUser.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Score</label>
                  <p className="font-semibold text-blue-600">
                    {selectedUser.leaderboardScore} pts
                  </p>
                </div>
              </div>

              {/* Join Date */}
              <div>
                <label className="text-sm font-medium text-gray-500">Join Date</label>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedUser.createdAt * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Deactivation Details */}
              {selectedUser.status === "DISABLED" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div>
                    <label className="text-sm font-medium text-red-700">Deactivation Reason</label>
                    <p className="text-red-600 mt-1">{selectedUser.deactivatedReason}</p>
                  </div>
                  {selectedUser.deactivatedAt && (
                    <div>
                      <label className="text-sm font-medium text-red-700">Deactivated On</label>
                      <p className="text-red-600 mt-1">
                        {new Date(selectedUser.deactivatedAt * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Section */}
              {selectedUser.status === "ACTIVE" && (
                <div className="border-t pt-4 mt-4">
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

                  <button
                    disabled={!disableReason || actionLoading}
                    onClick={() => showConfirmationDialog("disable")}
                    className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Disable User
                  </button>
                </div>
              )}

              {selectedUser.status === "DISABLED" && (
                <div className="border-t pt-4 mt-4">
                  <button
                    disabled={actionLoading}
                    onClick={() => showConfirmationDialog("reactivate")}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Reactivate User
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
          onClick={cancelConfirmation}
        >
          <div 
            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confirmation Header */}
            <div className={`p-6 text-white ${
              pendingAction === "disable" 
                ? "bg-gradient-to-r from-red-600 to-red-700" 
                : "bg-gradient-to-r from-green-600 to-green-700"
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {pendingAction === "disable" ? "Disable User" : "Reactivate User"}
                  </h2>
                  <p className="text-opacity-90 text-sm mt-1">
                    {pendingAction === "disable" 
                      ? "Are you sure you want to disable this user?" 
                      : "Are you sure you want to reactivate this user?"}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Content */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">User Details:</h3>
                <p><strong>Name:</strong> {selectedUser.userName}</p>
                <p><strong>ID:</strong> {selectedUser.userId}</p>
                <p><strong>Email:</strong> {selectedUser.userEmail || "N/A"}</p>
                {pendingAction === "disable" && disableReason && (
                  <p><strong>Reason:</strong> {disableReason}</p>
                )}
              </div>

              <div className={`p-3 rounded-lg ${
                pendingAction === "disable" 
                  ? "bg-red-50 border border-red-200 text-red-700" 
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}>
                <p className="text-sm font-medium">
                  {pendingAction === "disable" 
                    ? "⚠️ The user will lose access to the cohort and their progress will be paused."
                    : "✅ The user will regain access to the cohort and can continue their progress."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelConfirmation}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedAction}
                  disabled={actionLoading}
                  className={`flex-1 py-2 text-white rounded-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                    pendingAction === "disable" 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    pendingAction === "disable" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />
                  )}
                  {actionLoading
                    ? (pendingAction === "disable" ? "Disabling..." : "Reactivating...") 
                    : (pendingAction === "disable" ? "Yes, Disable" : "Yes, Reactivate")
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}