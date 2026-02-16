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
  const [userProgress, setUserProgress] = useState(null); // Changed to null instead of {}
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
        // Set to empty object instead of null to trigger the component
        setUserProgress({});
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

  // Function to check if stage is locked based on date
  const isStageLocked = (stageAvailableDate) => {
    if (!stageAvailableDate) return false;
    
    const availableDate = new Date(stageAvailableDate);
    const currentDate = new Date(); // Use today's date
    
    return currentDate < availableDate;
  };

  // Function to calculate days until stage is available
  const getDaysUntilAvailable = (stageAvailableDate) => {
    if (!stageAvailableDate) return 0;
    
    const availableDate = new Date(stageAvailableDate);
    const currentDate = new Date(); // Use today's date
    const timeDiff = availableDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Process program info to add locked status to stages
  const processedProgramInfo = programInfo ? {
    ...programInfo,
    stages: Object.fromEntries(
      Object.entries(programInfo.stages || {}).map(([key, stage]) => [
        key,
        {
          ...stage,
          isLocked: isStageLocked(stage.stageAvailableDate),
          daysUntilAvailable: getDaysUntilAvailable(stage.stageAvailableDate),
        }
      ])
    )
  } : null;

  return (
    <div className="w-full flex flex-col md:flex-row gap-2 px-2 pb-10 items-start">
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        programName={celebratedProgramName}
        congratsType="programCompletion"
      />

      {/* Audio Element */}
      {isModalOpen && <audio src="/youaresuperb.mp3" autoPlay />}
      {/* @ts-ignore */}
      {processedProgramInfo && processedProgramInfo.stages ? (
        <div className="md:w-[50%] w-full">
          <Stages
            key={JSON.stringify(Object.keys(processedProgramInfo?.stages || {}))}
            stages={processedProgramInfo?.stages}
            programCompletionStatus={processedProgramInfo?.programCompletionStatus}
            isDataLoaded={isDataLoaded}
          />
        </div>
      ) : (
        <StagesSkeleton />
      )}

      <div className="w-full md:w-[50%] flex flex-col">
        {/* Simplified condition - show if we have userProgress data OR show skeleton */}
        {userProgress ? (
          <div className="flex flex-col mb-6 mx-auto max-w-lg w-full px-6 py-2 bg-white gap-1 rounded-[3px] bg-opacity-50 m-3 progress-section">
            <div className="flex justify-between py-2">
              <h3 className="text-xl font-semibold font-openSans">
                Your Progress
              </h3>
              {formattedElapsedTime && (
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600 tabular-nums">
                    Session time: {formattedElapsedTime}
                  </span>
                </div>
              )}
            </div>
            <UserProgressBar userProgress={userProgress} />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-bold font-openSans">
                {/* @ts-ignore */}
                Total Points: {currentUserLeaderBoardInfo?.leaderboardScore || 0}{" "}
              </p>
              <div className="flex items-center space-x-2">
                {/* @ts-ignore */}
                {Array.from({ length: completedStagesCount || 0 }).map(
                  (_, index) => (
                    <img
                      key={index}
                      src="/icons/User-icons/trophy.png"
                      alt="trophy"
                      className="h-5 w-5"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <ProgressbarSkeleton />
        )}

        {leaderBoardInfo ? (
          <div className="">
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