import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} : ${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center space-x-2 text-gray-700">
      <Clock size={20} className="animate-pulse" />
      <span className="font-medium">Time remaining</span>
      <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
    </div>
  );
};

export default Timer;
