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
    <div className="max-w-lg mx-auto max-h-[350px] flex flex-col rounded-lg overflow-hidden">
      <div className="text-center mb-4">
        <h4 className="text-lg font-bold text-slate-800 mb-1">
          Leaderboard
        </h4>
        <p className="text-slate-600 text-sm">{cohortName}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {/* Display the appropriate number of scorers (top 3 or full leaderboard) */}
          {displayedLeaderboard.length === 0 && (
            <div className="text-center py-4 text-slate-500">No leaderboard data available</div>
          )}
          {displayedLeaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex justify-between items-center py-3 px-3 rounded-lg transition-colors ${
                entry.userId === currentUser?.userId
                  ? "bg-orange-50 border border-orange-200 shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center">
                {/* Serial Number */}
                <div className="font-bold text-lg mr-1 min-w-[30px] text-center">
                  {index + 1}.
                </div>

                {/* Avatar Section */}
                <Avatar src={avatar_icon} />
                <div className="ml-2">
                  <div className="font-semibold text-black truncate max-w-[140px]">
                    {entry.userName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-md font-bold">
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
                <div className="text-lg font-bold">
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
