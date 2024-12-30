import { useState, useEffect, useRef } from "react";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { motion } from "framer-motion";
import { Mic, Video, StopCircle, Trash2 } from "lucide-react";

export function MediaRecorder() {
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const {
    isRecording,
    recordedBlob,
    liveStream,
    startRecording,
    stopRecording,
    clearRecording,
    stopLiveStream,
  } = useMediaRecorder(mediaType);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      stopLiveStream();
    };
  }, [stopLiveStream]);

  useEffect(() => {
    if (liveStream && (videoRef.current || audioRef.current)) {
      if (mediaType === "video" && videoRef.current) {
        videoRef.current.srcObject = liveStream;
      } else if (mediaType === "audio" && audioRef.current) {
        audioRef.current.srcObject = liveStream;
      }
    }
  }, [liveStream, mediaType]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setMediaType("audio")}
          className={`px-4 py-2 rounded-[5px] ${
            mediaType === "audio"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Mic className="inline-block mr-2" size={18} />
          Audio
        </button>
        <button
          onClick={() => setMediaType("video")}
          className={`px-4 py-2 rounded-[5px] ${
            mediaType === "video"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Video className="inline-block mr-2" size={18} />
          Video
        </button>
      </div>
      <div className="flex justify-center space-x-4">
        {!isRecording && !recordedBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="px-4 py-2 bg-green-500 text-white rounded-[5px]"
          >
            Start Recording
          </motion.button>
        )}
        {isRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-[5px]"
          >
            <StopCircle className="inline-block mr-2" size={18} />
            Stop Recording
          </motion.button>
        )}
        {recordedBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearRecording}
            className="px-4 py-2 bg-gray-500 text-white rounded-[5px]"
          >
            <Trash2 className="inline-block mr-2" size={18} />
            Clear Recording
          </motion.button>
        )}
      </div>
      <div className="mt-4">
        {mediaType === "video" && (
          <div className="relative aspect-video bg-black rounded-[5px] overflow-hidden">
            {liveStream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : recordedBlob ? (
              <video
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Video size={48} />
              </div>
            )}
          </div>
        )}
        {mediaType === "audio" && (
          <div className="bg-gray-100 p-4 rounded-[5px]">
            {liveStream ? (
              <div className="flex items-center justify-center h-24">
                <audio ref={audioRef} autoPlay muted className="hidden" />
                <Mic size={48} className="text-blue-500 animate-pulse" />
              </div>
            ) : recordedBlob ? (
              <audio
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-24">
                <Mic size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
