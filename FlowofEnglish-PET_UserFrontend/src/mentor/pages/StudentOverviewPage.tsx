// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen, Calendar, FileText, User, Mail, Phone, Clock, CheckCircle } from "lucide-react";
import axios from "axios";
import StudentAssignments from "../components/StudentAssignments";
import RadarSkillChart from "../components/RadarSkillChart";
import DetailedAttemptHistory from "../components/DetailedAttemptHistory";
import StatCard from "../components/StatCard";
import { SKILL_COLORS } from "../utils/skillMapper";
import { usePDFReport, type PDFReportData } from "../hooks/usePDFReport";

export default function StudentOverviewPage() {
  const { cohortId, programId, userId } = useParams();
  const navigate = useNavigate();
  
  const { generatingPDF, pageRef, downloadReport } = usePDFReport();
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [mentorRemarks, setMentorRemarks] = useState("");
  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
    concepts: Array<{ name: string; score: number; conceptCount: number }>;
    scores: Array<{ skill: string; count: number; total: number }>;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [programData, setProgramData] = useState<any>(null);
  const [assignmentsCount, setAssignmentsCount] = useState({ total: 0, corrected: 0, pending: 0 });

  const API = import.meta.env.VITE_API_BASE_URL || "";

  const processSkillDataForRadar = (concepts: any[]) => {
    if (!concepts || concepts.length === 0) return [];
    
    const skillGroups: Record<string, { 
      name: string; 
      totalScore: number; 
      userScore: number; 
      conceptCount: number;
    }> = {};
    
    concepts.forEach(concept => {
      const skillName = concept['conceptSkill-1'] || 'Other';
      
      if (!skillGroups[skillName]) {
        skillGroups[skillName] = {
          name: skillName,
          totalScore: 0,
          userScore: 0,
          conceptCount: 0,
        };
      }
      
      skillGroups[skillName].totalScore += concept.totalMaxScore;
      skillGroups[skillName].userScore += concept.userTotalScore;
      skillGroups[skillName].conceptCount += 1;
    });
    
    return Object.values(skillGroups)
      .filter(skill => skill.name !== '' && skill.totalScore > 0)
      .map(skill => ({
        name: skill.name,
        score: Math.round((skill.userScore / skill.totalScore) * 100),
        conceptCount: skill.conceptCount,
      }))
      .sort((a, b) => b.score - a.score);
  };

  const processSkillDataForMastery = (concepts: any[]) => {
    if (!concepts || concepts.length === 0) return [];
    
    const skillMap = new Map<string, { skill: string; count: number; total: number }>();
    
    concepts.forEach(concept => {
      const skillName = concept['conceptSkill-1'] || 'Other';
      
      if (!skillMap.has(skillName)) {
        skillMap.set(skillName, {
          skill: skillName,
          count: 0,
          total: 0
        });
      }
      
      const skillData = skillMap.get(skillName)!;
      
      if (concept.completedSubconcepts > 0) {
        skillData.count += concept.completedSubconcepts;
      }
      
      skillData.total += concept.totalSubconcepts || 1;
    });
    
    return Array.from(skillMap.values())
      .filter(skill => skill.total > 0)
      .sort((a, b) => {
        const percentageA = (a.count / a.total) * 100;
        const percentageB = (b.count / b.total) * 100;
        return percentageB - percentageA;
      });
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

    const processedAssignmentsData = assignmentsData.map((assignment, index) => ({
      assignmentName: assignment.assignmentName || `Assignment ${index + 1}`,
      stage: assignment.stageName || assignment.stage?.stageName || 'General',
      score: assignment.correctedDate ? `${assignment.score || 0}/5` : 'Not graded',
      session: assignment.sessionNumber || assignment.session || 'N/A',
      status: assignment.correctedDate ? 'Graded' : (assignment.submittedDate ? 'Submitted' : 'Pending'),
      submittedDate: assignment.submittedDate ? new Date(assignment.submittedDate).toLocaleDateString() : 'Not submitted'
    }));

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
      assignmentsCount,
      averageScore: progress.averageScore,
      concepts: progress.concepts,
      scores: progress.scores,
      assignmentsData: processedAssignmentsData,
      recentActivity: processedRecentActivity,
      mentorRemarks: remarksRef.current?.value || mentorRemarks,
    };

    await downloadReport(reportData);
  };

  const saveRemarks = () => {
    const remarks = remarksRef.current?.value || "";
    setMentorRemarks(remarks);
    alert("Remarks saved! They will be included in the PDF report.");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mentor = JSON.parse(localStorage.getItem("user") || "{}");
        const mentorId = mentor?.userId;

        // Fetch user info
        const userListRes = await axios.get(
          `${API}/user-cohort-mappings/mentor/${mentorId}/cohort/${cohortId}/users`
        );
        const userInfo = userListRes.data.users.find((u: any) => u.userId === userId);
        if (!userInfo) throw new Error("User not found");

        // Fetch program data
        const programRes = await axios.get(`${API}/reports/program/${userId}/${programId}`);
        const programData = programRes.data;
        setProgramData(programData);

        // Fetch assignments data
        try {
          let userAssignments = [];
          
          try {
            const assignmentsRes = await axios.get(`${API}/assignments/cohort/${cohortId}`);
            userAssignments = assignmentsRes.data.assignments?.filter((a: any) => a.user?.userId === userId) || [];
          } catch (err) {
            try {
              const assignmentsRes = await axios.get(`${API}/assignments/user/${userId}`);
              userAssignments = assignmentsRes.data.assignments || [];
            } catch (err2) {
              console.warn("User assignments endpoint also failed:", err2);
            }
          }
          
          const processedAssignments = userAssignments.map((assignment: any, index: number) => ({
            ...assignment,
            assignmentName: assignment.assignmentName || assignment.name || `Assignment ${index + 1}`,
            stageName: assignment.stageName || assignment.stage?.stageName || 'General',
            score: assignment.score || assignment.grade || 0,
            sessionNumber: assignment.sessionNumber || assignment.session || 1,
            submittedDate: assignment.submittedDate || assignment.submittedAt || null,
            correctedDate: assignment.correctedDate || assignment.gradedAt || null,
            status: assignment.correctedDate ? 'Graded' : (assignment.submittedDate ? 'Submitted' : 'Pending')
          }));
          
          setAssignmentsData(processedAssignments);
          setAssignmentsCount({
            total: processedAssignments.length,
            corrected: processedAssignments.filter((a: any) => a.correctedDate).length,
            pending: processedAssignments.filter((a: any) => !a.correctedDate && a.submittedDate).length
          });
        } catch (err) {
          console.error("Error fetching assignments:", err);
        }

        // Fetch concepts progress
        let conceptsData = null;
        try {
          const conceptsRes = await axios.get(`${API}/programs/${programId}/concepts/progress/${userId}`);
          conceptsData = conceptsRes.data;
        } catch (conceptsErr) {
          console.error("Error fetching concepts progress:", conceptsErr);
        }

        // Get recent activity from program data
        const recentActivityData = getRecentActivity(programData);
        setRecentActivity(recentActivityData);

        // Calculate last active
        let lastActive = "--";
        if (recentActivityData.length > 0) {
          const latestActivity = recentActivityData[0];
          lastActive = new Date(latestActivity.endTimestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }

        const concepts = conceptsData?.concepts || [];
        const radarData = processSkillDataForRadar(concepts);
        const masteryData = processSkillDataForMastery(concepts);
        const avgScore = calculateAverageScore(concepts);
        const subconceptStats = calculateSubconceptStats(concepts);

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
            ? new Date(userInfo.createdAt * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : "--",
          lastActive: lastActive,
          completedStages: programData.completedStages || 0,
          totalStages: programData.totalStages || 0,
          completedUnits: programData.completedUnits || 0,
          totalUnits: programData.totalUnits || 0,
          completedSubconcepts: subconceptStats.completed || programData.completedSubconcepts || 0,
          totalSubconcepts: subconceptStats.total || programData.totalSubconcepts || 0,
          averageScore: avgScore || programData.averageScore || 0,
          concepts: radarData,
          scores: masteryData,
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      <Loader2 className="animate-spin" /> Loading...
    </div>
  );

  if (!user || !progress) return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      No data available
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" ref={pageRef}>
      {/* Header */}
      <div className="mb-6">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 text-sm sm:text-base"
          onClick={() => navigate(`/mentor/${cohortId}/${programId}/learners`)}
        >
          <ArrowLeft className="inline mr-2" size={18} />
          <span className="truncate">Back to Learners</span>
        </button>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">{user.userName}</h1>
              <p className="text-gray-600 mb-3 text-sm sm:text-base">Learner ID: {user.userId}</p>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.userEmail || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.userPhoneNumber || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-base sm:text-lg font-semibold text-blue-700 mb-1 truncate">{progress.cohortName}</div>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Joined: {progress.joinedOn}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Last Active: {progress.lastActive}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`flex-1 min-w-[120px] px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`flex-1 min-w-[120px] px-3 sm:px-4 py-2 font-medium text-sm ${activeTab === 'detailed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Cards - Only 3 cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div>
              <StatCard
                label="Subconcepts"
                value={`${progress.completedSubconcepts}/${progress.totalSubconcepts}`}
                subLabel="Completed"
                color="bg-purple-50 text-purple-700"
              />
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                <p className="text-sm text-gray-500 mb-1">Assignments</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl sm:text-2xl font-bold text-amber-700">
                    {assignmentsCount.corrected}
                  </p>
                  <p className="text-xs text-gray-600">
                    {assignmentsCount.total > 0 ? `graded of ${assignmentsCount.total} total` : 'graded'}
                  </p>
                </div>
                {assignmentsCount.pending > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {assignmentsCount.pending} pending review
                  </p>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={handleDownloadReport}
                disabled={generatingPDF}
                className="w-full h-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-3 py-2.5 shadow text-sm font-semibold transition-colors"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Download Report</span>
                    <span className="sm:hidden">Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Radar + Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Skills Overview</h2>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Skill Proficiency (%)</span>
                </div>
              </div>
              <div className="h-[280px] sm:h-[320px] lg:h-[340px]">
                <RadarSkillChart data={progress.concepts} height={280} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Skill Mastery</h2>
                <div className="text-sm text-gray-500">
                  {progress.scores.reduce((sum, s) => sum + s.count, 0)}/
                  {progress.scores.reduce((sum, s) => sum + s.total, 0)} activities
                </div>
              </div>
              <div className="space-y-3 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
                {progress.scores.map((s) => {
                  const percentage = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
                  return (
                    <div key={s.skill} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-sm text-gray-700 truncate">{s.skill}</div>
                        <div className="font-semibold text-blue-600 text-sm whitespace-nowrap ml-2">
                          {s.count}/{s.total}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
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
                          {percentage}% complete
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="mb-8">
            <StudentAssignments 
              cohortId={cohortId!}
              userId={userId!}
              cohortName={progress.cohortName}
              programId={programId!}
            />
          </div>

          {/* Recent Activity & Mentor Remarks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Last {recentActivity.length} attempts
                </span>
              </div>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto pr-2">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{activity.subconceptName}</h3>
                            <p className="text-sm text-gray-600">
                              {activity.stageName} • {activity.unitName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
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
                  <div className="text-center py-8 text-gray-500">
                    No recent activity data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Mentor Remarks</h2>
              </div>
              <div className="mb-4">
                <textarea 
                  ref={remarksRef}
                  value={mentorRemarks}
                  onChange={(e) => setMentorRemarks(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm text-gray-700"
                  placeholder="Write your remarks here about the student's progress, areas for improvement, or strengths..."
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button 
                  onClick={() => {
                    setMentorRemarks("");
                    if (remarksRef.current) remarksRef.current.value = "";
                  }}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium"
                >
                  Clear
                </button>
                <button 
                  onClick={saveRemarks}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mb-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Detailed Attempt History</h2>
              <div className="text-sm text-gray-500 text-center sm:text-right">
                Click on stages/units to expand and view attempt history
              </div>
            </div>
            <DetailedAttemptHistory programData={programData} />
          </div>
        </div>
      )}
    </div>
  );
}