import axios from 'axios';
import { useEffect, useState } from 'react';
import { useUserContext } from "../context/AuthContext";
import '../Styles/Stages.css';
import Leaderboard from './Leaderboard';
import Stages from './Stages';
import StagesSkeleton from './skeletons/StageSkeleton';
import LeaderboardSkeleton from './skeletons/LeaderboardSkeleton';

function Dashboard() {

  const { user } = useUserContext();
  const [programInfo, setProgramInfo] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const [leaderBoardInfo, setLeaderBoardInfo] = useState(null);
  
  const getProgramInfoByProgramId = async () => {
     if (user && user.userId && user.program && user.program.programId) {
       const programId = encodeURIComponent(user.program.programId);
       const userId = encodeURIComponent(user.userId); // Extract userId here
       try {
         const response = await axios.get(
           `${API_BASE_URL}/units/${userId}/program/${programId}`
         );

         console.log('Program Info Response:', response.data); // Log response data for program info
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
        `${API_BASE_URL}/user-cohort-mappings`
      );
      return response.data;
    } catch (error) {
      console.log('Error fetching leaderboard info:', error); // Log any error during fetching
      throw error;
    }
  
  };
  
  useEffect(() => {
    if(user){
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

  useEffect(() => {
    const fetchAndSetLeaderBoardInfo = async () => {
      try {
        const result = await getLeaderBoardInfo();
        console.log("Leaderboard info", result);
        setLeaderBoardInfo(result);
      } catch (err) {
        // @ts-ignore
        setError(err.message);
      } finally {
        // setLoading(false);
      }
    };

        fetchAndSetLeaderBoardInfo();

  }, []);

  // useEffect(() => {
  //   if (user) {
  //     console.log("User context:", user); // Logs only when `user` changes
  //   }
  // }, [user]); // Log only when `user` state changes
  
  return (
    <div className="w-full flex flex-col md:flex-row mt-44 gap-2 px-2">
      {/* @ts-ignore */}
      {programInfo && programInfo.stages ? (
        // @ts-ignore
        <Stages stages={programInfo.stages} />
      ) : (
        <StagesSkeleton/>
      )}
      {/* @ts-ignore */}
      {leaderBoardInfo ? (
        // @ts-ignore
        <Leaderboard leaderboard={leaderBoardInfo} userId={user?.userId} cohortName={user?.cohort?.cohortName} cohortId={user?.cohort?.cohortId}/>
      ) : (
        <LeaderboardSkeleton/>
      )}
    </div>
  );
}

export default Dashboard;
