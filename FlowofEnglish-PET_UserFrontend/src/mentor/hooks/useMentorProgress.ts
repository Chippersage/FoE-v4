// @ts-nocheck
import { useEffect, useState } from "react";
import { getCohortProgress } from "../api/getCohortProgress";
import { useUserContext } from "../../context/AuthContext";

export const useMentorProgress = (cohortId: string) => {
  const { user } = useUserContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return "--";
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "--";
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    console.log("🔍 useMentorProgress triggered with:");
    console.log("mentorId:", user?.userId);
    console.log("cohortId:", cohortId);

    if (!user?.userId || !cohortId) return;

    setLoading(true);

    getCohortProgress(user.userId, cohortId)
      .then((data) => {
        console.log("API Response:", data);

        const mapped = (data.users || []).map((u: any) => ({
          userId: u.userId,
          userName: u.userName,
          userType: u.userType,
          userEmail: u.userEmail || null,
          userPhoneNumber: u.userPhoneNumber || null,
          status: u.status,
          leaderboardScore: u.leaderboardScore ?? 0,
          lastLogin: formatDate(u.recentSessions?.[0]?.sessionStartTimestamp),
        }));

        setUsers(mapped);
      })
      .catch((err) => {
        console.error("Error in useMentorProgress:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.userId, cohortId]);

  return { users, loading };
};
