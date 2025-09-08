// @ts-nocheck
import axios from "axios";
import { useEffect, useState } from "react";
import { useUserContext } from "../context/AuthContext";
import "../Styles/Stages.css";
// import Leaderboard from "./Leaderboard";
import Stages from "./Stages";
import StagesSkeleton from "./skeletons/StageSkeleton";
// import LeaderboardSkeleton from "./skeletons/LeaderboardSkeleton";
import UserProgressBar from "./UserProgressBar";
// @ts-ignore
import ProgressbarSkeleton from "./skeletons/ProgressbarSkeleton";
import KidFriendlyModal from "./modals/CongratulatoryModal";
import LeaderboardSkeleton from "./skeletons/LeaderboardSkeleton";
import Leaderboard from "./Leaderboard";
import { Clock } from "lucide-react";
import { useSession } from "@/context/TimerContext";

function Dashboard() {
  const { user, selectedCohortWithProgram } = useUserContext();
  const [programInfo, setProgramInfo] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentUserLeaderBoardInfo, setCurrentUserLeaderBoardInfo] =
    useState(null);
  // const [loading, setLoading] = useState(true);
  // @ts-ignore
  const [error, setError] = useState(null);

  const [leaderBoardInfo, setLeaderBoardInfo] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [completedStagesCount, setCompletedStagesCount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratedProgramName, setCelebratedProgramName] = useState("");
  const { formattedElapsedTime } = useSession();

  const getProgramInfoByProgramId = async () => {
    if (user && user.userId && selectedCohortWithProgram) {
      const programId = encodeURIComponent(
        selectedCohortWithProgram?.program?.programId
      );
      const userId = encodeURIComponent(user.userId); // Extract userId here
      try {
        const response = await axios.get(
          `${API_BASE_URL}/units/${userId}/program/${programId}`
        );
        return response.data;
      } catch (error) {
        //  console.log('Error fetching program info:', error); // Log any error during fetching
        throw error;
      }
    }
  };

  const getLeaderBoardInfo = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-cohort-mappings/cohort/${selectedCohortWithProgram?.cohortId}/learner`
      );
      return response.data;
    } catch (error) {
      // console.log('Error fetching leaderboard info:', error); // Log any error during fetching
      throw error;
    }
  };

  useEffect(() => {
    if (user && selectedCohortWithProgram) {
      const fetchAndSetLeaderBoardInfo = async () => {
        try {
          const result = await getLeaderBoardInfo();
          // console.log(result);
          setLeaderBoardInfo(result);
          setCurrentUserLeaderBoardInfo(
            result.find(
              // @ts-ignore
              (entry) => entry.userId === user.userId
            )
          );
          // console.log("currentUserLeaderBoardInfo", currentUserLeaderBoardInfo);
        } catch (err) {
          // @ts-ignore
          setError(err.message);
        } finally {
          // setLoading(false);
        }
      };

      fetchAndSetLeaderBoardInfo();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/reports/program/${user?.userId}/${selectedCohortWithProgram?.program?.programId}`
        );
        setUserProgress(res.data);
        setCompletedStagesCount(res.data?.completedStages);
        // console.log(res.data);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    if (user && user.userId && selectedCohortWithProgram) {
      fetchUserProgress();
    }
  }, [user, selectedCohortWithProgram]);

  useEffect(() => {
    if (user && selectedCohortWithProgram) {
      // console.log(user)
      const fetchAndSetProgramInfo = async () => {
        try {
          const result = await getProgramInfoByProgramId();
          setProgramInfo(result);
        } catch (err) {
          // @ts-ignore
          setError(err.message);
        } finally {
          // setLoading(false);
        }
      };

      fetchAndSetProgramInfo();
    }
  }, [user, selectedCohortWithProgram]);

  // Add effect to check if all data is loaded
  useEffect(() => {
    if (programInfo && userProgress && leaderBoardInfo) {
      setIsDataLoaded(true);
    }
  }, [programInfo, userProgress, leaderBoardInfo]);

  const openModal = () => {
    // @ts-ignore
    setCelebratedProgramName(programInfo?.programName);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // @ts-ignore
    if (programInfo?.programCompletionStatus === "yes") {
      const storedCelebrationInfo = localStorage.getItem(
        "isProgramCompletionAlreadyCelebrated"
      );

      let isCurrentProgramAlreadyCelebrated = null;

      // Safely parse the localStorage value if it exists
      try {
        isCurrentProgramAlreadyCelebrated = storedCelebrationInfo
          ? JSON.parse(storedCelebrationInfo)
          : null;
      } catch (e) {
        console.warn("Invalid data in localStorage, clearing it...");
        localStorage.removeItem("isProgramCompletionAlreadyCelebrated");
      }

      // Check if the current program has been celebrated already
      if (
        !isCurrentProgramAlreadyCelebrated || // No celebration info exists
        // @ts-ignore
        isCurrentProgramAlreadyCelebrated.programId !== programInfo?.programId // Different program ID
      ) {
        // Open modal and update localStorage with the new celebration details
        const celebratedProgramDetails = {
          // @ts-ignore
          programId: programInfo?.programId,
          hasCelebrated: true,
        };

        localStorage.setItem(
          "isProgramCompletionAlreadyCelebrated",
          JSON.stringify(celebratedProgramDetails)
        );

        // Open the modal to celebrate
        openModal();
      }
    }
  }, [programInfo]);

  return (
    <div className="w-full min-h-screen bg-transparent">
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        programName={celebratedProgramName}
        congratsType="programCompletion"
      />

      {/* Audio Element */}
      {isModalOpen && <audio src="/sounds/program-completion-success.mp3" autoPlay />}
      
      {/* Enhanced Professional Header Section */}
      <div className="relative bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-xl shadow-sm">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Learning Dashboard</h1>
                <p className="text-slate-600 text-sm sm:text-lg">Welcome back! Continue your professional development journey.</p>
              </div>
            </div>
            
            {formattedElapsedTime && (
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">Session Time</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-800 tabular-nums">{formattedElapsedTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Learning Path Section - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            {/* @ts-ignore */}
            {programInfo && programInfo.stages ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Learning Path</h2>
                      <p className="text-slate-600 text-sm sm:text-base">Progress through your professional development modules</p>
                    </div>
                  </div>
                  
                  {programInfo?.programCompletionStatus === "yes" && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Program Complete!</span>
                    </div>
                  )}
                </div>
                
                <Stages
                  stages={programInfo?.stages}
                  programCompletionStatus={programInfo?.programCompletionStatus}
                  isDataLoaded={isDataLoaded}
                />
              </div>
            ) : (
              <div className="lg:col-span-2">
                <StagesSkeleton />
              </div>
            )}
          </div>

          {/* Right Sidebar - Progress & Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Enhanced Progress Card */}
            {userProgress && currentUserLeaderBoardInfo ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 progress-section">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg shadow-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Your Progress</h3>
                    <p className="text-slate-600 text-xs sm:text-sm">Track your learning achievements</p>
                  </div>
                </div>
                
                <UserProgressBar userProgress={userProgress} />
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Points Earned</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                        {/* @ts-ignore */}
                        {currentUserLeaderBoardInfo.leaderboardScore}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {/* @ts-ignore */}
                      {Array.from({ length: Math.min(completedStagesCount, 5) }).map(
                        (_, index) => (
                          <div key={index} className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )
                      )}
                      {/* @ts-ignore */}
                      {completedStagesCount > 5 && (
                        <span className="text-xs sm:text-sm text-slate-600 ml-2 font-medium">
                          {/* @ts-ignore */}
                          +{completedStagesCount - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ProgressbarSkeleton />
            )}

            {/* Enhanced Leaderboard Card */}
            {leaderBoardInfo ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg shadow-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">Team Performance</h3>
                    <p className="text-slate-600 text-xs sm:text-sm">See how you compare with your cohort</p>
                  </div>
                </div>
                
                <Leaderboard
                  leaderboard={leaderBoardInfo}
                  userId={user?.userId}
                  cohortName={user?.cohort?.cohortName}
                  cohortId={user?.cohort?.cohortId}
                />
              </div>
            ) : (
              <LeaderboardSkeleton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
