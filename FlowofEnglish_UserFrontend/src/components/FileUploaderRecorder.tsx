"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileUploader } from "./FileUploader";
import { AudioRecorder } from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { Preview } from "./Preview";
import { Upload, Mic, Video } from "lucide-react";
import { UploadModal } from "./modals/UploadModal";

export const FileUploaderRecorder: React.FC = () => {
  const [activeAction, setActiveAction] = useState<
    "upload" | "audio" | "video" | null
  >(null);
  const [recordingState, setRecordingState] = useState<
    "recording" | "paused" | "stopped"
  >("recording");
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(
    null
  );
  const streamRef = useRef<MediaStream | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // Duration in seconds
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [videoRecordingDuration, setVideoRecordingDuration] = useState(0);
  const videoRecordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Close active action when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => setActiveAction(null);

//     if (activeAction) {
//       document.addEventListener("click", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, [activeAction]);

  // Prevent closing when clicking on action buttons
  const handleActionClick = (action: "upload" | "audio" | "video") => {
    setActiveAction(action);
  };

  const handleUpload = (file: File) => {
     setUploadedFile(file);
     setIsUploadModalOpen(true)
  };

  const handleAudioRecordingStart = () => {
    setActiveAction("audio");
    setRecordingDuration(0); // Reset duration
    setPreviewContent(<AudioPulse />);

    // Start the timer
    recordingInterval.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 1;
        setPreviewContent(<AudioPulse duration={newDuration} />);
        return newDuration;
      });
    }, 1000);
  };

const handleVideoRecordingStart = (stream: MediaStream) => {
  setActiveAction("video");
  streamRef.current = stream;
  setVideoRecordingDuration(0); // Reset duration
  setPreviewContent(<VideoPreview stream={stream} duration={0} />);

  // Start the timer
  videoRecordingInterval.current = setInterval(() => {
    setVideoRecordingDuration((prev) => {
      const newDuration = prev + 1;
      setPreviewContent(
        <VideoPreview stream={stream} duration={newDuration} />
      );
      return newDuration;
    });
  }, 1000);
};

  const handleRecordingStop = () => {
     if (recordingInterval.current) {
       clearInterval(recordingInterval.current);
       recordingInterval.current = null;
     }else if (videoRecordingInterval.current) {
       clearInterval(videoRecordingInterval.current);
       videoRecordingInterval.current = null;
     }
    setActiveAction(null);
    setPreviewContent(null);
    setRecordingState("stopped");
    streamRef.current = null;
  };

  const handleRecordingStateChange = (
    state: "recording" | "paused" | "stopped"
  ) => {
    setRecordingState(state);
    if (state === "paused") {
      setPreviewContent(<div className="text-sm">Recording paused</div>);
    } else if (state === "recording") {
      setPreviewContent(
        activeAction === "audio" ? (
          <AudioPulse />
        ) : (
          <VideoPreview stream={streamRef.current!} />
        )
      );
    }
  };

  return (
    <>
      <div
        className="flex justify-center h-12 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex space-x-2 bg-white rounded-full shadow-lg p-2">
          <ActionButton
            icon={<Upload />}
            onClick={() => setActiveAction("upload")}
            isActive={activeAction === "upload"}
          />
          <ActionButton
            icon={<Mic />}
            onClick={() => setActiveAction("audio")}
            isActive={activeAction === "audio"}
          />
          <ActionButton
            icon={<Video />}
            onClick={() => setActiveAction("video")}
            isActive={activeAction === "video"}
          />
        </div>
      </div>

      {activeAction === "upload" && (
        <FileUploader
          onUpload={handleUpload}
          onClose={() => setActiveAction(null)}
        />
      )}
      {activeAction === "audio" && (
        <AudioRecorder
          onRecordingStart={handleAudioRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingStateChange={handleRecordingStateChange}
        />
      )}
      {activeAction === "video" && (
        <VideoRecorder
          onRecordingStart={handleVideoRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingStateChange={handleRecordingStateChange}
        />
      )}

      <Preview>{previewContent}</Preview>

        <UploadModal
          isOpen={isUploadModalOpen}
          file={uploadedFile}
          onClose={() => setUploadedFile(null)}
        />

    </>
  );
};

const ActionButton: React.FC<{
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, isActive, onClick }) => {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents closing when clicking the button
          onClick();
        }}
        className={`p-2 rounded-full flex items-center h-10 w-10 transition-colors ${
          isActive
            ? "bg-green-500 text-white"
            : "text-gray-500 hover:bg-gray-200"
        }`}
      >
        {icon}
      </button>
    );
}
 


const AudioPulse: React.FC<{ duration: number }> = ({ duration }) => {

  const safeDuration = isNaN(duration) ? 0 : duration;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

    return (
      <div className="flex flex-column items-center gap-2">
        <div className="relative w-8 h-8 z-50">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full">
            <Mic className="w-4 h-4 text-white" />
          </div>
        </div>
        <span className="text-gray-500 text-sm">{formatTime(safeDuration)}</span>
      </div>
    );
}

const VideoPreview: React.FC<{ stream: MediaStream; duration: number }> = ({
  stream,
  duration,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const safeDuration = isNaN(duration) ? 0 : duration;

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

   const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60)
       .toString()
       .padStart(2, "0");
     const secs = (seconds % 60).toString().padStart(2, "0");
     return `${mins}:${secs}`;
   };

  return (
    <div className="flex flex-col items-center gap-1">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-16 h-24 rounded-lg object-cover"
      />
      <span className="text-black text-sm">{formatTime(safeDuration)}</span>
    </div>
  );
};
