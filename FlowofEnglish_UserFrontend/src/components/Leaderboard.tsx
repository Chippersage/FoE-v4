import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import avatar_icon from "../assets/icons/avatar_icon.svg";
import Avatar from "./Avatar";

// @ts-ignore
export default function Leaderboard({ cohortId, userId, leaderboardScore, cohortName, leaderboard }) {
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.leaderboardScore - a.leaderboardScore
  );
  const top3 = sortedLeaderboard.slice(0, 3);
  // @ts-ignore
  const currentUser = leaderboard.find((entry) => entry.userId === userId);
  const currentUserRank =
    sortedLeaderboard.findIndex((entry) => entry.userId === userId) + 1;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
        <p className="text-muted-foreground">{cohortName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Display top 3 performers with serial number */}
          {top3.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex justify-between items-center py-2 ${
                entry.userId === currentUser?.userId
                  ? "bg-blue-100 rounded-lg shadow-lg"
                  : ""
              }`}
            >
              <div className="flex items-center">
                {/* Serial Number */}
                <div className="font-bold text-lg mr-4">{index + 1}.</div>

                {/* Avatar Section */}
                <Avatar src={avatar_icon} />
                <div className="ml-2">
                  <div className="font-semibold text-primary">
                    {entry.userName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {index + 1 === 1 ? "Squirrel" : "Salamander"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {entry.leaderboardScore} Points
                </div>
              </div>
            </div>
          ))}

          {/* If current user is not in top 3, display them after top 3 with special effect */}
          {currentUserRank > 3 && currentUser && (
            <div
              className={`flex justify-between items-center py-2 bg-blue-100 p-2 rounded-xl shadow-lg`}
            >
              <div className="flex items-center">
                <Avatar src={avatar_icon} />
                <div className="ml-2">
                  <div className="font-semibold text-primary">
                    {currentUser.userName}
                  </div>
                  <div className="text-xs text-muted-foreground">You</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {currentUser.leaderboardScore} Points
                </div>
                <div className="text-sm text-muted-foreground">
                  Rank {currentUserRank}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
