// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen, Calendar, Download } from "lucide-react";
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
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
  const [assignmentsCount, setAssignmentsCount] = useState({ total: 0, corrected: 0, pending: 0 });

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
    } catch (e) {
      console.error("Download report error:", e);
      alert("Failed to download report. Please try again.");
    } finally {
      setGeneratingPDF(false);
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
        const userInfo = userListRes.data.users.find((u: any) => u.userId === userId);
        if (!userInfo) throw new Error("User not found");

        const programRes = await axios.get(`${API}/reports/program/${userId}/${programId}`);
        const programData = programRes.data;
        setProgramData(programData);

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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'detailed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <StatCard
              label="Stages"
              value={`${progress.completedStages}/${progress.totalStages}`}
              subLabel="Completed"
              color="bg-blue-50 text-blue-700"
            />
            <StatCard
              label="Units"
              value={`${progress.completedUnits}/${progress.totalUnits}`}
              subLabel="Completed"
              color="bg-green-50 text-green-700"
            />
            <StatCard
              label="Subconcepts"
              value={`${progress.completedSubconcepts}/${progress.totalSubconcepts}`}
              subLabel="Completed"
              color="bg-purple-50 text-purple-700"
            />
            <StatCard
              label="Assignments"
              value={assignmentsCount.corrected}
              subLabel={`Submitted${assignmentsCount.total > 0 ? ` of ${assignmentsCount.total}` : ''}`}
              color="bg-amber-50 text-amber-700"
            />
            <div className="col-span-2 lg:col-span-1 flex items-center justify-center">
              <button
                onClick={downloadReport}
                disabled={generatingPDF}
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
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Radar + Score Distribution */}
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
              <h2 className="text-xl font-semibold">Detailed Attempt History</h2>
              <div className="text-sm text-gray-500">
                Click on stages/units to expand and view attempt history
              </div>
            </div>
            <DetailedAttemptHistory programData={programData} />
          </div>
          
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
        </div>
      )}
    </div>
  );
}