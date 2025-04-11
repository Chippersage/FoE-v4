// @ts-nocheck
import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Sparkles,
  Medal,
  Rocket,
  ArrowRight,
  Timer,
} from "lucide-react";
// import EmojiBubbles from "./EmojiBubbles";

interface ActivityCompletionModal {
//   isOpen: boolean;
  onClose: () => void;
  scorePercentage: number;
  countdownDuration: number; // Receive countdown duration as prop
}

export default function ActivityCompletionModal({
//   isOpen,
  onClose,
  scorePercentage,
  countdownDuration,
}: ActivityCompletionModal) {
  const [countdown, setCountdown] = useState(countdownDuration);
  const [audio] = useState(new Audio());
  // console.log("scorePercentage in activity completion modal", scorePercentage);

  useEffect(() => {
    let timer: number;
    // if (isOpen) {
      setCountdown(countdownDuration);

      // Set audio source based on scorePercentage
      audio.src =
        scorePercentage > 75
          ? "/high-score.mp3"
          : scorePercentage >= 50
          ? "/medium-score.mp3"
          : "/low-score.mp3";

      audio.play();

      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose(); // Close modal after countdown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    // }

    return () => {
      clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [scorePercentage, countdownDuration, audio, onClose]);

//   if (!isOpen) return null;

  const getScoreContent = () => {
    if (scorePercentage > 75) {
      return {
        icon: (
          <Trophy className="w-24 h-24 text-yellow-500 animate-[bounce_2s_ease-in-out_infinite]" />
        ),
        title: "Hurrah! 🌟",
        message:
          "You are on the right path. Unlocking the next activity for you...",
        bgColor: "bg-slate-700",
        textColor: "text-green-400",
        buttonColor: "bg-green-500 hover:bg-green-600",
        extraIcon: (
          <Rocket className="absolute -right-2 top-1/2 w-8 h-8 text-green-400 animate-pulse" />
        ),
      };
    } else if (scorePercentage >= 50) {
      return {
        icon: (
          <Medal className="w-24 h-24 text-blue-400 animate-[swing_2s_ease-in-out_infinite]" />
        ),
        title: "Well Done! 🎉",
        message: "You have unlocked the next activity, but keep practising.",
        bgColor: "bg-slate-700",
        textColor: "text-blue-400",
        buttonColor: "bg-blue-500 hover:bg-blue-600",
        extraIcon: (
          <Star className="absolute -right-2 top-1/2 w-8 h-8 text-blue-400 animate-pulse" />
        ),
      };
    } else {
      return {
        icon: (
          <img src="/icons/User-icons/confused.png" className="w-24 h-24 text-orange-400 animate-[float_3s_ease-in-out_infinite]" />
        ),
        title: "Keep Going!",
        message:
          "You can do better! Come back anytime and try again. Meanwhile, unlocking the next activity for you.",
        bgColor: "bg-slate-700",
        textColor: "text-orange-400",
        buttonColor: "bg-orange-500 hover:bg-orange-600",
        extraIcon: (
          <ArrowRight className="absolute -right-2 top-1/2 w-8 h-8 text-orange-400 animate-pulse hidden" />
        ),
      };
    }
  };

  const content = getScoreContent();

  return (
    <>
      {/* <EmojiBubbles
        emoji={
          scorePercentage > 75
            ? "🤩"
            : scorePercentage >= 50
            ? " 😊 "
            : " 🥹 "
        }
        count={30}
        interval={50}
      /> */}

      <div className="fixed inset-0 flex backdrop-blur-0 items-center justify-center z-50">
        <div
          className={`${content.bgColor} rounded-lg w-full max-w-md mx-4 overflow-hidden animate-[bounceIn_0.6s_ease-in-out] shadow-2xl`}
        >
          <div className="bg-slate-800 py-4 px-6 border-b border-slate-600">
            <h2 className="text-2xl font-bold text-white text-center">
              Next Activity Unlocked
            </h2>
          </div>

          <div className="p-6">
            <div className="relative z-10">
              <div className="flex justify-center mb-6 relative">
                <div className="relative">
                  {content.icon}
                  <Sparkles className={`absolute -top-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse ${scorePercentage < 50 ? "hidden" : ""}`} />
                  {content.extraIcon}
                </div>
              </div>

              <h2
                className={`text-4xl font-bold text-center mb-4 ${content.textColor}`}
              >
                {content.title}
              </h2>
              <p className="text-xl text-center text-slate-300 mb-8">
                {content.message}
              </p>

              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Timer className="w-5 h-5" />
                <p>
                  Redirecting to activities page in{" "}
                  <span className="font-bold">{countdown}</span> seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-slate-600">
            <div
              className="h-full bg-green-500 transition-all duration-1000"
              style={{
                width: `${
                  ((countdownDuration - countdown) / countdownDuration) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
