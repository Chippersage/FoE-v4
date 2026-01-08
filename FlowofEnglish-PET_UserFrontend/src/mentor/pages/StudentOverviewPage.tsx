// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
<<<<<<< Updated upstream
import { ArrowLeft, Loader2, BookOpen, Calendar, Download } from "lucide-react";
=======
import { Loader2, BookOpen, Calendar, FileText, User, Mail, Phone, Clock, CheckCircle, ChevronDown, ClipboardList } from "lucide-react";
>>>>>>> Stashed changes
import axios from "axios";
import StudentAssignments from "../components/StudentAssignments";
import RadarSkillChart from "../components/RadarSkillChart";
import DetailedAttemptHistory from "../components/DetailedAttemptHistory";
import TimelineActivity from "../components/TimelineActivity";
import StatCard from "../components/StatCard";
import { processSkillsFromProgramData } from "../utils/skillMapper";
import { generatePDF } from "../utils/pdfGenerator";
import { SKILL_COLORS } from "../utils/skillMapper";

export default function StudentOverviewPage() {
  const { cohortId, programId, userId } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState('overview');
<<<<<<< Updated upstream
  const [generatingPDF, setGeneratingPDF] = useState(false);
=======
  const [mentorRemarks, setMentorRemarks] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{
    userId: string;
    userName: string;
    userEmail?: string;
    userPhoneNumber?: string;
    createdAt?: number;
  }>>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
>>>>>>> Stashed changes

  const [user, setUser] = useState<{
    userId: string;
    userName: string;
    userEmail?: string;
    userPhoneNumber?: string;
    createdAt?: number;
  } | null>(null);
  
  const [progress, setProgress] = useState<{
    cohortName: string;
    joinedOn: string;
    lastActive: string;
    completedStages: number;
    totalStages: number;
    completedUnits: number;
    totalUnits: number;
    completedSubconcepts: number;
    totalSubconcepts: number;
    averageScore: number;
    concepts: Array<{ skill: string; value: number }>;
    scores: Array<{ skill: string; count: number; total: number }>;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [programData, setProgramData] = useState<any>(null);

  const API = import.meta.env.VITE_API_BASE_URL || "";

  const downloadReport = async () => {
    if (!pageRef.current || generatingPDF || !user || !progress) return;
    
    setGeneratingPDF(true);
    
    try {
      await generatePDF({
        element: pageRef.current,
        user,
        progress,
        programId
      });
<<<<<<< Updated upstream
    } catch (e) {
      console.error("Download report error:", e);
      alert("Failed to download report. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
=======
  };

  const calculateAverageScore = (concepts: any[]) => {
    if (!concepts || concepts.length === 0) return 0;
    
    let totalScore = 0;
    let maxTotalScore = 0;
    let scoredConcepts = 0;
    
    concepts.forEach(concept => {
      if (concept.totalMaxScore > 0 && concept.userTotalScore >= 0) {
        totalScore += (concept.userTotalScore / concept.totalMaxScore) * 5;
        maxTotalScore += 5;
        scoredConcepts++;
      }
    });
    
    return maxTotalScore > 0 ? (totalScore / maxTotalScore) * 5 : 0;
  };

  const calculateSubconceptStats = (concepts: any[]) => {
    if (!concepts || concepts.length === 0) return { completed: 0, total: 0 };
    
    let completed = 0;
    let total = 0;
    
    concepts.forEach(concept => {
      completed += concept.completedSubconcepts || 0;
      total += concept.totalSubconcepts || 0;
    });
    
    return { completed, total };
  };

  const getRecentActivity = (programData: any) => {
    if (!programData?.stages) return [];
    
    const activities: any[] = [];
    
    programData.stages.forEach((stage: any) => {
      stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((subconcept: any) => {
          subconcept.attempts?.forEach((attempt: any) => {
            activities.push({
              stageName: stage.stageName,
              unitName: unit.unitName,
              subconceptName: subconcept.subconceptName,
              endTimestamp: attempt.endTimestamp,
              score: attempt.score || 0,
              sessionNumber: attempt.sessionNumber || 1
            });
          });
        });
      });
    });
    
    return activities
      .sort((a, b) => b.endTimestamp - a.endTimestamp)
      .slice(0, 5);
  };

  const handleDownloadReport = async () => {
    if (!user || !progress) return;

    const processedRecentActivity = recentActivity.map((activity, index) => ({
      title: activity.subconceptName || `Activity ${index + 1}`,
      stage: activity.stageName || 'Unknown Stage',
      unit: activity.unitName || 'Unknown Unit',
      score: activity.score || 0,
      session: activity.sessionNumber || 'N/A',
      date: activity.endTimestamp ? new Date(activity.endTimestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown date'
    })).filter(activity => activity.title !== 'undefined' && activity.stage !== 'undefined');

    const reportData: PDFReportData = {
      userName: user.userName,
      userId: user.userId,
      userEmail: user.userEmail,
      userPhoneNumber: user.userPhoneNumber,
      cohortName: progress.cohortName,
      programId: programId!,
      joinedOn: progress.joinedOn,
      lastActive: progress.lastActive,
      completedSubconcepts: progress.completedSubconcepts,
      totalSubconcepts: progress.totalSubconcepts,
      // Provide empty assignments data since we're not fetching it anymore
      assignmentsCount: {
        total: 0,
        corrected: 0,
        pending: 0
      },
      averageScore: progress.averageScore,
      concepts: progress.concepts,
      scores: progress.scores,
      // Provide empty assignments data array
      assignmentsData: [],
      recentActivity: processedRecentActivity,
      mentorRemarks: remarksRef.current?.value || mentorRemarks,
    };

    await downloadReport(reportData);
  };

  const saveRemarks = () => {
    const remarks = remarksRef.current?.value || "";
    setMentorRemarks(remarks);
    alert("Remarks saved! They will be included in the PDF report.");
>>>>>>> Stashed changes
  };

  const handleUserSelect = (selectedUser: typeof allUsers[0]) => {
    setShowUserDropdown(false);
    if (selectedUser.userId !== userId) {
      navigate(`/mentor/${cohortId}/${programId}/learner/${selectedUser.userId}`);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const mentor = JSON.parse(localStorage.getItem("user") || "{}");
      const mentorId = mentor?.userId;

      const userListRes = await axios.get(
        `${API}/user-cohort-mappings/mentor/${mentorId}/cohort/${cohortId}/users`
      );
      
      const users = userListRes.data.users || [];
      setAllUsers(users);
      
      if (!user && userId && users.length > 0) {
        const currentUser = users.find((u: any) => u.userId === userId);
        if (currentUser) {
          setUser({
            userId: currentUser.userId,
            userName: currentUser.userName,
            userEmail: currentUser.userEmail,
            userPhoneNumber: currentUser.userPhoneNumber,
            createdAt: currentUser.createdAt,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mentor = JSON.parse(localStorage.getItem("user") || "{}");
        const mentorId = mentor?.userId;

        const userListRes = await axios.get(
          `${API}/user-cohort-mappings/mentor/${mentorId}/cohort/${cohortId}/users`
        );
        const users = userListRes.data.users || [];
        setAllUsers(users);
        
        const userInfo = users.find((u: any) => u.userId === userId);
        if (!userInfo) throw new Error("User not found");

        const programRes = await axios.get(`${API}/reports/program/${userId}/${programId}`);
        const programData = programRes.data;
        setProgramData(programData);

<<<<<<< Updated upstream
        try {
          const assignmentsRes = await axios.get(`${API}/assignments/cohort/${cohortId}`);
          const userAssignments = assignmentsRes.data.assignments?.filter((a: any) => a.user?.userId === userId) || [];
          setAssignmentsCount({
            total: userAssignments.length,
            corrected: userAssignments.filter((a: any) => a.correctedDate).length,
            pending: userAssignments.filter((a: any) => !a.correctedDate).length
          });
        } catch (err) {
          console.error("Error fetching assignments count:", err);
        }

        const { radar, distribution } = processSkillsFromProgramData(programData);

=======
        let conceptsData = null;
        try {
          const conceptsRes = await axios.get(`${API}/programs/${programId}/concepts/progress/${userId}`);
          conceptsData = conceptsRes.data;
        } catch (conceptsErr) {
          console.error("Error fetching concepts progress:", conceptsErr);
        }

        const recentActivityData = getRecentActivity(programData);
        setRecentActivity(recentActivityData);

>>>>>>> Stashed changes
        let lastActive = "--";
        if (programData?.stages) {
          const allAttempts: any[] = [];
          programData.stages.forEach((stage: any) => {
            stage.units?.forEach((unit: any) => {
              unit.subconcepts?.forEach((sub: any) => {
                sub.attempts?.forEach((attempt: any) => {
                  allAttempts.push(attempt);
                });
              });
            });
          });
          
          if (allAttempts.length > 0) {
            const latestAttempt = allAttempts.reduce((latest, attempt) => 
              attempt.endTimestamp > latest.endTimestamp ? attempt : latest
            );
            lastActive = new Date(latestAttempt.endTimestamp * 1000).toLocaleDateString();
          }
        }

        setUser({
          userId: userInfo.userId,
          userName: userInfo.userName,
          userEmail: userInfo.userEmail,
          userPhoneNumber: userInfo.userPhoneNumber,
          createdAt: userInfo.createdAt,
        });

        setProgress({
          cohortName: userListRes.data.cohort?.cohortName || "",
          joinedOn: userInfo.createdAt
            ? new Date(userInfo.createdAt * 1000).toLocaleDateString()
            : "--",
          lastActive: lastActive,
          completedStages: programData.completedStages || 0,
          totalStages: programData.totalStages || 0,
          completedUnits: programData.completedUnits || 0,
          totalUnits: programData.totalUnits || 0,
          completedSubconcepts: programData.completedSubconcepts || 0,
          totalSubconcepts: programData.totalSubconcepts || 0,
          averageScore: programData.averageScore || 0,
          concepts: radar,
          scores: distribution,
        });
      } catch (err) {
        console.error("StudentOverviewPage load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && cohortId && programId) load();
    else setLoading(false);
  }, [userId, cohortId, programId, API]);

  useEffect(() => {
    if (cohortId && !allUsers.length) {
      fetchAllUsers();
    }
  }, [cohortId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...
    </div>
  );

  if (!user || !progress) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      No data available
    </div>
  );

  return (
<<<<<<< Updated upstream
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" ref={pageRef}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between border-b pb-4 mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            className="text-blue-600 flex items-center gap-2 w-fit"
            onClick={() => navigate(`/mentor/${cohortId}/${programId}/learners`)}
          >
            <ArrowLeft size={18} /> Back to Learners
          </button>
          
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-semibold">{user.userName}</h1>
            <p className="text-gray-500 text-sm">Learner ID: {user.userId}</p>
          </div>
        </div>

        <div className="text-center lg:text-right">
          <p className="text-gray-700 font-medium">
            Cohort: <span className="font-semibold">{progress.cohortName}</span>
          </p>
          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500 justify-center lg:justify-end">
            <p>Email: {user.userEmail || "Not provided"}</p>
            <p>Phone: {user.userPhoneNumber || "Not provided"}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500 justify-center lg:justify-end">
            <p>Joined: {progress.joinedOn}</p>
            <p>Last Active: {progress.lastActive}</p>
=======
    <div className="p-3 sm:p-4 max-w-6xl mx-auto space-y-4" ref={pageRef}>
      {/* Compact Header with Integrated Dropdown */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between sm:justify-start gap-3 mb-2">
              <div className="relative flex-1 sm:flex-none">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center justify-between w-full sm:w-64 bg-white border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-gray-900 text-sm truncate">{user.userName}</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform flex-shrink-0 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute z-10 mt-1 w-full sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {allUsers.map((userItem) => (
                      <button
                        key={userItem.userId}
                        onClick={() => handleUserSelect(userItem)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm ${userItem.userId === userId ? 'bg-blue-50 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                      >
                        <div className="font-medium text-gray-900 truncate">{userItem.userName}</div>
                        <div className="text-xs text-gray-600 truncate">{userItem.userId}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Mail className="h-3 w-3 text-gray-400" />
                <span className="truncate">{user.userEmail || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="h-3 w-3 text-gray-400" />
                <span className="truncate">{user.userPhoneNumber || "Not provided"}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right sm:text-left">
            <div className="text-sm font-semibold text-blue-700 mb-1 truncate">{progress.cohortName}</div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <div className="flex items-center justify-end sm:justify-start gap-1">
                <Clock className="h-3 w-3" />
                <span>Joined: {progress.joinedOn}</span>
              </div>
              <div className="flex items-center justify-end sm:justify-start gap-1">
                <Calendar className="h-3 w-3" />
                <span>Last Active: {progress.lastActive}</span>
              </div>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {/* Tabs */}
<<<<<<< Updated upstream
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
=======
      <div className="flex border-b overflow-x-auto">
        <button
          className={`flex-1 min-w-[90px] px-3 py-2 font-medium text-xs flex items-center justify-center gap-1.5 ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
>>>>>>> Stashed changes
          onClick={() => setActiveTab('overview')}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Overview</span>
        </button>
        <button
<<<<<<< Updated upstream
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'detailed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
=======
          className={`flex-1 min-w-[90px] px-3 py-2 font-medium text-xs flex items-center justify-center gap-1.5 ${activeTab === 'assignments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('assignments')}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Assignments</span>
        </button>
        <button
          className={`flex-1 min-w-[90px] px-3 py-2 font-medium text-xs flex items-center justify-center gap-1.5 ${activeTab === 'detailed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
>>>>>>> Stashed changes
          onClick={() => setActiveTab('detailed')}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Cards */}
<<<<<<< Updated upstream
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <StatCard
              label="Stages"
=======
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Modules"
>>>>>>> Stashed changes
              value={`${progress.completedStages}/${progress.totalStages}`}
              subLabel="Completed"
              color="bg-blue-50 text-blue-700"
            />
<<<<<<< Updated upstream
            <StatCard
              label="Units"
=======
            
            <StatCard
              label="Sessions"
>>>>>>> Stashed changes
              value={`${progress.completedUnits}/${progress.totalUnits}`}
              subLabel="Completed"
              color="bg-green-50 text-green-700"
            />
<<<<<<< Updated upstream
            <StatCard
              label="Subconcepts"
=======
            
            <StatCard
              label="Activities"
>>>>>>> Stashed changes
              value={`${progress.completedSubconcepts}/${progress.totalSubconcepts}`}
              subLabel="Completed"
              color="bg-purple-50 text-purple-700"
            />
<<<<<<< Updated upstream
            <StatCard
              label="Assignments"
              value={assignmentsCount.corrected}
              subLabel={`Submitted${assignmentsCount.total > 0 ? ` of ${assignmentsCount.total}` : ''}`}
              color="bg-amber-50 text-amber-700"
            />
            <div className="col-span-2 lg:col-span-1 flex items-center justify-center">
=======
            
            <div>
>>>>>>> Stashed changes
              <button
                onClick={downloadReport}
                disabled={generatingPDF}
<<<<<<< Updated upstream
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-3 sm:px-4 py-3 shadow text-sm font-semibold transition-colors"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download Report
=======
                className="w-full h-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-3 py-2.5 shadow text-xs font-semibold transition-colors"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download Report</span>
>>>>>>> Stashed changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Radar + Score Distribution */}
<<<<<<< Updated upstream
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Skills Overview</h2>
              <RadarSkillChart data={progress.concepts} />
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Skill Mastery</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {progress.scores.map((s) => (
                  <div key={s.skill} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium text-sm">{s.skill}</div>
                      <div className="font-semibold text-blue-600 text-sm">{s.count}/{s.total}</div>
=======
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800 mb-1 sm:mb-0">Skills Overview</h2>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Skill Proficiency (%)</span>
                </div>
              </div>
              <div className="h-64 sm:h-72">
                <RadarSkillChart data={progress.concepts} height={250} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800 mb-1 sm:mb-0">Skill Development</h2>
                <div className="text-xs text-gray-500">
                  {progress.scores.reduce((sum, s) => sum + s.count, 0)}/
                  {progress.scores.reduce((sum, s) => sum + s.total, 0)} activities
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {progress.scores.map((s) => {
                  const percentage = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
                  return (
                    <div key={s.skill} className="p-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-xs text-gray-700 truncate">{s.skill}</div>
                        <div className="font-semibold text-blue-600 text-xs whitespace-nowrap ml-1">
                          {s.count}/{s.total}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: SKILL_COLORS[s.skill] || "#374151",
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-500">
                          {s.total} activities
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          {percentage}%
                        </div>
                      </div>
>>>>>>> Stashed changes
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${s.total > 0 ? Math.round((s.count / s.total) * 100) : 0}%`,
                          backgroundColor: SKILL_COLORS[s.skill] || "#374151",
                        }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {s.total > 0 ? Math.round((s.count / s.total) * 100) : 0}% completed
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

<<<<<<< Updated upstream
          {/* Assignments Section */}
          <div className="mb-8">
            <StudentAssignments 
              cohortId={cohortId!}
              userId={userId!}
              cohortName={progress.cohortName}
            />
          </div>

          {/* Recent Activity & Mentor Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Recent Activity
                </h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Last 5 attempts
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto pr-2">
                <TimelineActivity programData={programData} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-green-600" />
                Mentor Remarks
              </h2>
              <div className="mb-4">
                <textarea 
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Write your remarks here about the student's progress, areas for improvement, or strengths..."
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <button className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
=======
          {/* Recent Activity & Mentor Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
              </div>
              <div className="max-h-64 overflow-y-auto pr-2">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">{activity.subconceptName}</h3>
                            <p className="text-xs text-gray-600 truncate">
                              {activity.stageName} • {activity.unitName}
                            </p>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <div className="font-bold text-blue-600 text-sm">
                              {activity.score}
                            </div>
                            <div className="text-xs text-gray-500">
                              Session {activity.sessionNumber}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.endTimestamp ? new Date(activity.endTimestamp * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown date'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No recent activity data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-green-600" />
                <h2 className="text-base font-semibold text-gray-800">Mentor Remarks</h2>
              </div>
              <div className="mb-3">
                <textarea 
                  ref={remarksRef}
                  value={mentorRemarks}
                  onChange={(e) => setMentorRemarks(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm text-gray-700 text-xs"
                  placeholder="Write your remarks here about the student's progress, areas for improvement, or strengths..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setMentorRemarks("");
                    if (remarksRef.current) remarksRef.current.value = "";
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs text-gray-700 font-medium"
                >
                  Clear
                </button>
                <button 
                  onClick={saveRemarks}
                  className="px-2.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                >
>>>>>>> Stashed changes
                  Save Remarks
                </button>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'assignments' ? (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <StudentAssignments 
            cohortId={cohortId!}
            userId={userId!}
            cohortName={progress.cohortName}
            programId={programId!}
          />
        </div>
      ) : (
<<<<<<< Updated upstream
        <div className="mb-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-xl font-semibold">Detailed Attempt History</h2>
              <div className="text-sm text-gray-500">
                Click on stages/units to expand and view attempt history
              </div>
=======
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-800">Detailed Attempt History</h2>
            </div>
            <div className="text-xs text-gray-500 text-center sm:text-right">
              Click on stages/units to expand and view attempt history
>>>>>>> Stashed changes
            </div>
          </div>
<<<<<<< Updated upstream
          
          <div className="flex justify-center mb-6">
            <button
              onClick={downloadReport}
              disabled={generatingPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-6 py-3 shadow font-semibold transition-colors"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Detailed Report
                </>
              )}
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Mentor Remarks</h2>
            <textarea 
              rows={5} 
              className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Write your remarks here..." 
            />
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
              <button className="px-4 sm:px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Save Remarks
              </button>
            </div>
          </div>
=======
          <DetailedAttemptHistory programData={programData} />
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}