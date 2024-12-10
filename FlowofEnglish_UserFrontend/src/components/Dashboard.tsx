import axios from 'axios';
import { useEffect, useState } from 'react';
import { useUserContext } from "../context/AuthContext";
import '../Styles/Stages.css';
import Leaderboard from './Leaderboard';
import Stages from './Stages';
import StagesSkeleton from './skeletons/StageSkeleton';
import LeaderboardSkeleton from './skeletons/LeaderboardSkeleton';
import UserProgressBar from './UserProgressBar';
// @ts-ignore
import ProgressbarSkeleton from './skeletons/ProgressBarSkeleton';
import KidFriendlyModal from './CongratulatoryModal';

function Dashboard() {

  const { user } = useUserContext();
  const [programInfo, setProgramInfo] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentUserLeaderBoardInfo, setCurrentUserLeaderBoardInfo] = useState(null);
  // const [loading, setLoading] = useState(true);
  // @ts-ignore
  const [error, setError] = useState(null);

  const [leaderBoardInfo, setLeaderBoardInfo] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [celebratedStageName, setCelebratedStageName] = useState("");
  const [completedStagesCount, setCompletedStagesCount] = useState(null);

  const getProgramInfoByProgramId = async () => {
     if (user && user.userId && user.program && user.program.programId) {
       const programId = encodeURIComponent(user.program.programId);
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
        `${API_BASE_URL}/user-cohort-mappings/cohort/${user?.cohort?.cohortId}`
      );
      return response.data;
    } catch (error) {
      // console.log('Error fetching leaderboard info:', error); // Log any error during fetching
      throw error;
    }
  
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
      if (user?.cohort?.cohortId) {
        const fetchAndSetLeaderBoardInfo = async () => {
          try {
            const result = await getLeaderBoardInfo();
            // console.log(result);
            setLeaderBoardInfo(result);
            setCurrentUserLeaderBoardInfo (result.find(
              // @ts-ignore
              (entry) => entry.userId === user.userId
            ));
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
          `${API_BASE_URL}/reports/program/${user?.userId}/${user?.program?.programId}`
        )
        setUserProgress(res.data)
        // console.log(res.data);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    }
    
   if(user && user.userId && user.program && user.program.programId){
     fetchUserProgress()
   }

  }, [user]);
  
  useEffect(() => {
    if(user){
      // console.log(user)
      const fetchAndSetProgramInfo = async () => {
        try {
          const result = await getProgramInfoByProgramId();
          setProgramInfo(result);
          // console.log(result)
        } catch (err) {
          // @ts-ignore
          setError(err.message);
        } finally {
          // setLoading(false);
        }
      };

      fetchAndSetProgramInfo();
    }
    
  }, [user]);

  useEffect(() => {
    // @ts-ignore
    if (programInfo && programInfo.stages) {
      // Find the last completed stage
      // @ts-ignore
      const stages = Object.values(programInfo.stages)
      // console.log(stages)
      const completedStages = stages?.filter(
        // @ts-ignore
        (stage) => stage.stageCompletionStatus === "yes"
      );
      // @ts-ignore
      setCompletedStagesCount(completedStages.length);
      const lastCompletedStage = completedStages[completedStages.length - 1];
      

      if (lastCompletedStage) {
        const storedStage = localStorage.getItem("lastCompletedStage");

        // Show confetti and audio if this stage hasn't been celebrated yet
        // @ts-ignore
        if (!storedStage || (storedStage.stageId !== lastCompletedStage.stageId)) {
          // @ts-ignore
          setCelebratedStageName(lastCompletedStage.stageName);
          openModal()

          // Store the current stage as the last celebrated stage
          localStorage.setItem(
            "lastCompletedStage",
            // @ts-ignore
            lastCompletedStage
          );
        }
      }
    }
  }, [programInfo]);
  
  return (
    <div className="w-full flex flex-col md:flex-row mt-40 overflow-scroll no-scrollbar gap-2 px-2">
      {/* Confetti Animation */}
      {/* {showConfetti && (
        <> */}
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        stageName={celebratedStageName}
      />

      {/* Audio Element */}
      {isModalOpen && (
        <audio
          src="/youaresuperb.mp3"
          autoPlay

          // onEnded={() => setShowConfetti(false)}
        />
      )}

      {/* </>
      )} */}
      {/* @ts-ignore */}
      {programInfo && programInfo.stages ? (
        <div className="sm:w-[50%]">
          {/* @ts-ignore */}
          <Stages stages={programInfo.stages} />
        </div>
      ) : (
        <StagesSkeleton />
      )}

      <div className="w-full sm:w-[50%] flex flex-col">
        {userProgress && currentUserLeaderBoardInfo ? (
          <div className="flex flex-col mb-6 mx-auto w-[400px] px-6 py-2 bg-white gap-1 rounded-[3px]">
            <h3 className="text-xl font-semibold font-openSans">
              Your Progress
            </h3>
            <UserProgressBar userProgress={userProgress} />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-bold font-openSans">
                {/* @ts-ignore */}
                Total Points: {currentUserLeaderBoardInfo.leaderboardScore}{" "}
              </p>
              <div className="flex items-center space-x-2">
                {/* @ts-ignore */}
                {Array.from({ length: completedStagesCount }).map(
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

        {/* @ts-ignore */}
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
