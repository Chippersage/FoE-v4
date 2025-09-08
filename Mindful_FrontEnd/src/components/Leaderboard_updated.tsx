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
                <div className="font-bold text-lg mr-3 min-w-[30px] text-center text-slate-600">
                  {index + 1}.
                </div>
                <Avatar src={avatar_icon} size="w-8 h-8" />
                <div className="ml-3">
                  <div className="font-semibold text-slate-800 text-sm truncate max-w-[140px]">
                    {entry.userName}
                  </div>
                  {entry.userId === currentUser?.userId && (
                    <div className="text-xs text-orange-600 font-medium">You</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-800">
                  {entry.leaderboardScore} 
                </div>
                <div className="text-xs text-slate-500">
                  Points
                </div>
              </div>
            </div>
          ))}

          {/* If current user is not in top 3, display them after top 3 with special effect */}
          {currentUserRank > 3 && currentUser && !showMore && (
            <div className="flex justify-between items-center py-3 px-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Avatar src={avatar_icon} size="w-8 h-8" />
                <div className="ml-3">
                  <div className="font-semibold text-slate-800 text-sm">
                    {currentUser.userName}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">You</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-800">
                  {currentUser.leaderboardScore} Points
                </div>
                <div className="text-xs text-slate-500">
                  Rank {currentUserRank}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show More Button */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        {!showMore ? (
          <Button
            onClick={() => setShowMore(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm"
            disabled={displayedLeaderboard.length === 0}
          >
            Show more
          </Button>
        ) : (
          <Button
            onClick={() => setShowMore(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 text-sm"
          >
            Show less
          </Button>
        )}
      </div>
    </div>
  );
}
