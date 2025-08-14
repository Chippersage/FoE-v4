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
    <div className="w-full flex flex-col lg:flex-row gap-8 px-6 pb-12 items-start max-w-7xl mx-auto">
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        programName={celebratedProgramName}
        congratsType="programCompletion"
      />

      {/* Audio Element */}
      {isModalOpen && <audio src="/youaresuperb.mp3" autoPlay />}
      
      {/* Main Learning Path Section */}
      {/* @ts-ignore */}
      {programInfo && programInfo.stages ? (
        <div className="lg:w-[60%] w-full">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Learning Path</h2>
            <p className="text-slate-600 mb-6">Track your progress through the professional development modules</p>
            <Stages
              stages={programInfo?.stages}
              programCompletionStatus={programInfo?.programCompletionStatus}
              isDataLoaded={isDataLoaded}
            />
          </div>
        </div>
      ) : (
        <div className="lg:w-[60%] w-full">
          <StagesSkeleton />
        </div>
      )}

      {/* Professional Progress & Analytics Sidebar */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        {/* Professional Progress Card */}
        {userProgress && currentUserLeaderBoardInfo ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 progress-section">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  Your Progress
                </h3>
                <p className="text-slate-600 text-sm">Track your learning achievements</p>
              </div>
              {formattedElapsedTime && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-sm tabular-nums">
                    {formattedElapsedTime}
                  </span>
                </div>
              )}
            </div>
            
            <UserProgressBar userProgress={userProgress} />
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm text-slate-600">Total Points Earned</span>
                <span className="text-lg font-bold text-orange-600">
                  {/* @ts-ignore */}
                  {currentUserLeaderBoardInfo.leaderboardScore}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {/* @ts-ignore */}
                {Array.from({ length: Math.min(completedStagesCount, 5) }).map(
                  (_, index) => (
                    <div key={index} className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                  )
                )}
                {/* @ts-ignore */}
                {completedStagesCount > 5 && (
                  <span className="text-sm text-slate-600 ml-2">
                    {/* @ts-ignore */}
                    +{completedStagesCount - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ProgressbarSkeleton />
        )}

        {/* Professional Leaderboard Card */}
        {leaderBoardInfo ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Team Performance</h3>
            <p className="text-slate-600 text-sm mb-6">See how you compare with your cohort</p>
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
  );
}

export default Dashboard;
