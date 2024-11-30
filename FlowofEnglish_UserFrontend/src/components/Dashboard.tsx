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
         console.log('Error fetching program info:', error); // Log any error during fetching
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
      console.log('Error fetching leaderboard info:', error); // Log any error during fetching
      throw error;
    }
  
  };

    useEffect(() => {
      if (user?.cohort?.cohortId) {
        const fetchAndSetLeaderBoardInfo = async () => {
          try {
            const result = await getLeaderBoardInfo();
            console.log(result);
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
        console.log(res.data);
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
      console.log(user)
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
    
  }, [user]);
  
  return (
    <div className="w-full flex flex-col md:flex-row mt-44 overflow-scroll no-scrollbar gap-2 px-2">
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
        {(userProgress && currentUserLeaderBoardInfo) ? (
          <div className="flex flex-col mb-10 mx-auto w-full max-w-md px-6 py-2 bg-white gap-1">
            <h3 className="text-xl font-semibold">Your Progress</h3>
            <UserProgressBar userProgress={userProgress} />
            <p className="text-xl font-semibold">
              {/* @ts-ignore */}
              Total Points: {currentUserLeaderBoardInfo.leaderboardScore}{" "}
            </p>
          </div>
        ): (
          <ProgressbarSkeleton/>
        )
      }

        {/* @ts-ignore */}
        {leaderBoardInfo ? (
          <div>
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
