import { useEffect, useRef } from "react";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { motion } from "framer-motion";
import { Mic, Video, StopCircle, Trash2 } from "lucide-react";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

interface MediaRecorderProps {
  onContentChange: (hasContent: boolean) => void;
  disabled: boolean;
  onBlobGenerated: (blob: Blob | null) => void; // Callback for notifying parent of new blob
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  mediaType: "audio" | "video";
  setIsMediaRecording: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: "upload" | "recordAudio" | "recordVideo";
}

export function MediaRecorder({
  onContentChange,
  disabled,
  onBlobGenerated,
  setErrorMessage,
  mediaType,
  setIsMediaRecording,
  activeTab,
}: MediaRecorderProps) {
  const {
    isRecording,
    recordedBlob,
    liveStream,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    stopLiveStream,
  } = useMediaRecorder(mediaType);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (recordedBlob) {
      handleClearRecording();
    }
  }, [activeTab]);

  useEffect(() => {
    setIsMediaRecording(isRecording);
  }, [isRecording, setIsMediaRecording]);

  // Notify parent when a new blob is available
  useEffect(() => {
    onBlobGenerated(recordedBlob);
    onContentChange(!!recordedBlob);
  }, [recordedBlob, onBlobGenerated, onContentChange]);

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

  useEffect(() => {
    onContentChange(!!recordedBlob);
  }, [recordedBlob, onContentChange]);

  const handleClearRecording = () => {
    setErrorMessage(null);
    clearRecording();
    onBlobGenerated(null); // Notify parent that the recording is cleared
    onContentChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        {!isRecording && !recordedBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className={`px-4 py-2 bg-green-500 text-white rounded-md ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={disabled}
          >
            Start Recording
          </motion.button>
        )}
        {isRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            <StopCircle className="inline-block mr-2" size={18} />
            Stop Recording
          </motion.button>
        )}
        {recordedBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearRecording}
            className={`px-4 py-2 bg-gray-500 text-white rounded-md ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={disabled}
          >
            <Trash2 className="inline-block mr-2" size={18} />
            Clear Recording
          </motion.button>
        )}
      </div>
      <div className="mt-4">
        {mediaType === "video" && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {liveStream ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
                  {formatDuration(duration)}
                </div>
              </>
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
          <div className="bg-gray-100 p-4 rounded-lg">
            {liveStream ? (
              <div className="flex flex-col items-center justify-center h-24">
                <audio ref={audioRef} autoPlay muted className="hidden" />
                <Mic size={48} className="text-blue-500 animate-pulse" />
                <div className="mt-2 text-lg font-semibold">
                  {formatDuration(duration)}
                </div>
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
      {recordedBlob && (
        <input
          type="file"
          id="recorded-blob"
          name="recorded-blob"
          className="hidden"
          value=""
          onChange={() => {}}
        />
      )}
    </div>
  );
}
