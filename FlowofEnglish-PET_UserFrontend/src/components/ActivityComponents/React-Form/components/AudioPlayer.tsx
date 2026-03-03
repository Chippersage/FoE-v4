import { useEffect, useRef, useState } from "react";

interface Props {
  subconceptId: string;
  audioId: string;
  audioUrl?: string;
}

export default function AudioPlayer({
  subconceptId,
  audioId,
  audioUrl,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [playCount, setPlayCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const storageKey = `audio_${subconceptId}_${audioId}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setPlayCount(parseInt(stored));
  }, [storageKey]);

  const handlePlay = async () => {
    if (!audioUrl) return;
    if (playCount >= 3 || isPlaying) return;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      await audio.play();
      setIsPlaying(true);

      const newCount = playCount + 1;
      setPlayCount(newCount);
      localStorage.setItem(storageKey, newCount.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent);
      setCurrentTime(audio.currentTime);
    };

    const onLoaded = () => {
      setDuration(audio.duration);
    };

    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const remaining = 3 - playCount;

    return (
    <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white space-y-3">

        {/* Top Row */}
        <div className="flex items-center justify-between">
        <button
            onClick={handlePlay}
            disabled={remaining <= 0 || isPlaying}
            className={`
            px-4 py-1.5 rounded-full text-xs font-medium transition
            ${
                remaining <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isPlaying
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }
            `}
        >
            {remaining <= 0
            ? "Replay Limit Reached"
            : isPlaying
            ? "Playing..."
            : "Play"}
        </button>

        <div className="text-xs text-gray-500">
            {remaining > 0
            ? `${remaining} left`
            : "All attempts used"}
        </div>
        </div>

        {/* Progress + Time in same row */}
        <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-500 w-8">
            {formatTime(currentTime)}
        </span>

        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
            className="h-full bg-black transition-all duration-200"
            style={{ width: `${progress}%` }}
            />
        </div>

        <span className="text-[11px] text-gray-500 w-8 text-right">
            {formatTime(duration)}
        </span>
        </div>

        <audio ref={audioRef} src={audioUrl} hidden />
    </div>
    );
}