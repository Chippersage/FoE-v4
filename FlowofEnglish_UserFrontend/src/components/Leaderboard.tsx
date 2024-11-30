import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import avatar_icon from "../assets/icons/avatar_icon.svg";
import Avatar from "./Avatar";
import { Button } from "./ui/button";
import { useState } from "react";

// @ts-ignore
export default function Leaderboard({ cohortId, userId, cohortName, leaderboard }) {
  const [showMore, setShowMore] = useState(false);

  // Sort leaderboard by score
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.leaderboardScore - a.leaderboardScore
  );

  // Slice top 3 scorers
  const top3 = sortedLeaderboard.slice(0, 3);

  // Determine current user rank
  // @ts-ignore
  const currentUser = leaderboard.find((entry) => entry.userId === userId);
  const currentUserRank =
    sortedLeaderboard.findIndex((entry) => entry.userId === userId) + 1;

  // Decide whether to show the full leaderboard or just top 3 based on `showMore`
  const displayedLeaderboard = showMore ? sortedLeaderboard : top3;

  return (
    <Card className="max-w-[400px] mx-auto max-h-[350px] flex flex-col rounded-[3px] overflow-hidden p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
        <p className="text-muted-foreground">{cohortName}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar-2">
        <div className="space-y-4">
          {/* Display the appropriate number of scorers (top 3 or full leaderboard) */}
          {displayedLeaderboard.length === 0 && (
            <div className="text-center">No leaderboard data available</div>
          )}
          {displayedLeaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex justify-between items-center py-1 px-1 bg-slate-100 rounded-[5px] ${
                entry.userId === currentUser?.userId
                  ? "bg-blue-100 rounded-[2px] shadow-lg"
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
          {currentUserRank > 3 && currentUser && !showMore && (
            <div className="flex justify-between items-center py-2 bg-blue-100 p-2 rounded-xl shadow-xl">
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

      {/* Sticky Show More Button */}
      <div className="sticky bottom-0 bg-white shadow-sm">
        {!showMore ? (
          <Button
            onClick={() => setShowMore(true)}
            className="w-full text-center rounded-[5px]"
            disabled={displayedLeaderboard.length === 0}
          >
            Show more
          </Button>
        ) : (
          <Button
            onClick={() => setShowMore(false)}
            className="w-full text-center rounded-[5px]"
          >
            Show less
          </Button>
        )}
      </div>
    </Card>
  );
}
