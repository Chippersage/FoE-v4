// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LearnersProgressChart from "../components/charts/LearnersProgressChart";
import LineProgressChart from "../components/charts/LineProgressChart";
import ProgressDataTable from "../components/charts/ProgressDataTable";
import { FileBarChart } from "lucide-react";

export default function CohortReports() {
  const { cohortId, programId } = useParams();
  const [cohortData, setCohortData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("bar chart");
  const [totals, setTotals] = useState({
    totalStages: 10,
    totalUnits: 41,
    totalSubconcepts: 231
  });

  // Get mentor ID from your auth context or localStorage
  const getMentorId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.userId;
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchCohortReports = async () => {
      if (!cohortId || !programId) {
        setError("Missing cohort or program ID");
        setLoading(false);
        return;
      }

      const mentorId = getMentorId();
      if (!mentorId) {
        setError("Mentor ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get API base URL from environment variable
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        if (!API_BASE_URL) {
          throw new Error("API base URL not configured in environment variables");
        }

        // Construct the API URL
        const apiUrl = `${API_BASE_URL}/reports/mentor/${mentorId}/program/${programId}/cohort/${cohortId}/progress`;
        
        console.log("Fetching reports from:", apiUrl);
        
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (response.status === 404) {
            throw new Error("Cohort or program not found.");
          } else {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        
        setCohortData({
          programName: data.programName,
          programId: data.programId,
          programDesc: data.programDesc,
          cohortId: data.cohortId,
          cohortName: data.cohortName,
          organization: data.organization || { organizationName: "N/A" }
        });
        
        setUsers(data.users || []);
        
        // Extract total counts from first user (all users have same totals)
        if (data.users && data.users.length > 0) {
          setTotals({
            totalStages: data.users[0].totalStages || 10,
            totalUnits: data.users[0].totalUnits || 41,
            totalSubconcepts: data.users[0].totalSubconcepts || 231
          });
        }
        
      } catch (err) {
        console.error("Error fetching cohort reports:", err);
        setError(err.message || "Failed to load cohort reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCohortReports();
  }, [cohortId, programId]);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    
    const mentorId = getMentorId();
    if (cohortId && programId && mentorId) {
      // Re-fetch the data
      const fetchData = async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const apiUrl = `${API_BASE_URL}/reports/mentor/${mentorId}/program/${programId}/cohort/${cohortId}/progress`;
          
          const token = localStorage.getItem('token');
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(apiUrl, { headers });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();
          
          setCohortData({
            programName: data.programName,
            programId: data.programId,
            programDesc: data.programDesc,
            cohortId: data.cohortId,
            cohortName: data.cohortName,
            organization: data.organization || { organizationName: "N/A" }
          });
          
          setUsers(data.users || []);
          
          if (data.users && data.users.length > 0) {
            setTotals({
              totalStages: data.users[0].totalStages || 10,
              totalUnits: data.users[0].totalUnits || 41,
              totalSubconcepts: data.users[0].totalSubconcepts || 231
            });
          }
        } catch (err) {
          console.error("Error refreshing data:", err);
          setError(err.message || "Failed to refresh data.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9] mr-3"></div>
        Loading cohort reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-sm border border-red-200">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-[#0EA5E9] text-white rounded-full text-sm font-medium hover:bg-[#0c96d4] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cohortData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#0EA5E9] text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h2>
          <p className="text-gray-500 mb-4">No cohort data could be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header - No back button */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#0EA5E9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileBarChart size={28} className="text-[#0EA5E9]" />
            <div>
              <h1 className="text-2xl font-bold text-[#0EA5E9] tracking-tight">
                Cohort Reports
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {cohortData.cohortName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Cohort: <span className="font-medium">{cohortData.cohortId}</span></span>
              <span>•</span>
              <span>Program: <span className="font-medium">{cohortData.programName}</span></span>
            </div>
            <button
              onClick={refreshData}
              className="text-xs text-[#0EA5E9] hover:text-[#0c96d4] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Total Counts Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#0EA5E9]">
        <h2 className="text-lg font-semibold text-[#0EA5E9] mb-4">Program Totals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Total Stages</span>
              <span className="text-2xl font-bold text-blue-900">{totals.totalStages}</span>
            </div>
            <div className="text-xs text-blue-600">
              Number of stages in the program
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Total Units</span>
              <span className="text-2xl font-bold text-green-900">{totals.totalUnits}</span>
            </div>
            <div className="text-xs text-green-600">
              Number of units in the program
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-800">Total Subconcepts</span>
              <span className="text-2xl font-bold text-purple-900">{totals.totalSubconcepts}</span>
            </div>
            <div className="text-xs text-purple-600">
              Number of subconcepts in the program
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle and Charts/Table */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#0EA5E9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#0EA5E9]">Progress Visualizations</h2>
          <div className="flex gap-2">
            {["bar chart", "line chart", "table"].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-[#0EA5E9] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Charts/Table Section */}
        <div className="pt-2">
          {viewMode === "bar chart" && <LearnersProgressChart users={users} programId={cohortData.programId} />}
          {viewMode === "line chart" && <LineProgressChart users={users} />}
          {viewMode === "table" && <ProgressDataTable users={users} totals={totals} />}
        </div>
      </div>

      {/* Performance Summary Section - Preserved from original */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#0EA5E9]">
        <h3 className="text-lg font-semibold text-[#0EA5E9] mb-3">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Top Scorers
            </h4>
            {users.length > 0 ? (
              users
                .sort((a, b) => b.leaderboardScore - a.leaderboardScore)
                .slice(0, 5)
                .map((user, idx) => (
                  <div key={user.userId} className="flex justify-between items-center py-1.5 border-b border-blue-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${idx < 3 ? 'text-blue-700' : 'text-gray-700'}`}>
                        {user.userName}
                      </span>
                      <span className="text-[10px] text-gray-500">@{user.userId}</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                      {user.leaderboardScore} pts
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-2">No data available</p>
            )}
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <FileBarChart size={16} />
              Completion Leaders
            </h4>
            {users.length > 0 ? (
              users
                .map(user => ({
                  ...user,
                  completionPct: user.totalStages ? (user.completedStages / user.totalStages) * 100 : 0
                }))
                .sort((a, b) => b.completionPct - a.completionPct)
                .slice(0, 5)
                .map((user, idx) => (
                  <div key={user.userId} className="flex justify-between items-center py-1.5 border-b border-green-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${idx < 3 ? 'text-green-700' : 'text-gray-700'}`}>
                        {user.userName}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      {Math.round(user.completionPct)}%
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-2">No data available</p>
            )}
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0A9 9 0 008 4.5" />
              </svg>
              Most Activities Completed
            </h4>
            {users.length > 0 ? (
              users
                .map(user => ({
                  ...user,
                  totalActivities: user.completedSubconcepts || 0
                }))
                .sort((a, b) => b.totalActivities - a.totalActivities)
                .slice(0, 5)
                .map((user, idx) => (
                  <div key={user.userId} className="flex justify-between items-center py-1.5 border-b border-purple-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${idx < 3 ? 'text-purple-700' : 'text-gray-700'}`}>
                        {user.userName}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium mb-1">
                        {user.totalActivities} subconcepts
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {user.completedStages}/{totals.totalStages} stages
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-2">No data available</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Report generated on: {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span>Total learners analyzed: {users.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}