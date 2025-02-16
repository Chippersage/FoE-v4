// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileUploader } from "./FileUploader";
import { AudioRecorder } from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { Preview } from "./Preview";
import { Upload, Mic, Video } from "lucide-react";
import  UploadModal  from "./modals/UploadModal";

export const FileUploaderRecorder: React.FC<{
  onUploadSuccess: () => void;
}> = ({ onUploadSuccess }) => {
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // Duration in seconds
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedMedia, setRecordedMedia] = useState<{
    type: "audio" | "video";
    blob: Blob;
  } | null>(null);

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
  const startRecordingTimer = () => {
    // setRecordingDuration(0); // Reset duration
    if (recordingInterval.current) clearInterval(recordingInterval.current); // Clear existing timer

    recordingInterval.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  // const handleActionClick = (action: "upload" | "audio" | "video") => {
  //   setActiveAction(action);
  // };

  const handleUpload = (file: File) => {
    setUploadedFile(file);
    setIsUploadModalOpen(true);
  };

  const handleAudioRecordingStart = () => {
    setActiveAction("audio");
    startRecordingTimer();
    setPreviewContent(<AudioPulse />);
  };

  const handleVideoRecordingStart = (stream: MediaStream) => {
    setActiveAction("video");
    streamRef.current = stream;
    startRecordingTimer();
    setPreviewContent(<VideoPreview stream={stream} />);
  };

  const handleRecordingStop = (blob: Blob, type: "audio" | "video") => {
    stopRecordingTimer();
    setActiveAction(null);
    setPreviewContent(null);
    setRecordingState("stopped");
    streamRef.current = null;

    if (!blob) {
      console.error("handleRecordingStop received an invalid blob:", blob);
      return;
    }
    console.log(blob.size)
    const maxSize = 50 * 1024 * 1024; // 10MB in bytes
    if (blob.size > maxSize) {
      alert("File size limit exceeded! Recorded audio/video should be less than 50MB.");
      // event.target.value = ""; // Reset input
      return;
    }
    setRecordedMedia({ type, blob }); // Store recorded media
    setIsUploadModalOpen(true); // Open Upload Modal
  };

  const handleRecordingStateChange = (
    state: "recording" | "paused" | "stopped"
  ) => {
    setRecordingState(state);
    if (state === "paused") {
      stopRecordingTimer(); // Pause timer
      setPreviewContent(<div className="text-sm">Recording paused</div>);
    } else if (state === "recording") {
      startRecordingTimer(); // Resume timer
      setPreviewContent(
        activeAction === "audio" ? (
          <AudioPulse />
        ) : (
          <VideoPreview stream={streamRef.current!} />
        )
      );
    } else if (state === "stopped") {
      stopRecordingTimer();
      setRecordingDuration(0); // Reset duration on stop
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
            activeAction={activeAction}
          />
          <ActionButton
            icon={<Mic />}
            onClick={() => setActiveAction("audio")}
            isActive={activeAction === "audio"}
            activeAction={activeAction}
          />
          <ActionButton
            icon={<Video />}
            onClick={() => setActiveAction("video")}
            isActive={activeAction === "video"}
            activeAction={activeAction}
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

      <Preview
        // recordingState="recording"
        recordingDuration={recordingDuration}
        activeAction={activeAction}
        recordingState={recordingState}
      >
        {previewContent}
      </Preview>

      <UploadModal
        isOpen={isUploadModalOpen}
        file={uploadedFile}
        recordedMedia={recordedMedia}
        onClose={() => {
          setUploadedFile(null);
          setRecordedMedia(null);
          setIsUploadModalOpen(false);
          setRecordingState("stopped");
          setActiveAction(null);
        }}
        onUploadSuccess={onUploadSuccess}
      />
    </>
  );
};

const ActionButton: React.FC<{
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  activeAction;
}> = ({ icon, isActive, onClick, activeAction }) => {
  return (
    <button
      disabled={!isActive && activeAction}
      onClick={(e) => {
        e.stopPropagation(); // Prevents closing when clicking the button
        onClick();
      }}
      className={`p-2 rounded-full flex items-center h-10 w-10 transition-colors ${
        isActive ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-200"
      }`}
    >
      {icon}
    </button>
  );
};
 


const AudioPulse: React.FC = () => {
    return (
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full">
          <Mic className="w-4 h-4 text-white" />
        </div>
      </div>
    );
}

const VideoPreview: React.FC<{ stream: MediaStream}> = ({
  stream
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-16 h-16 sm:w-36 sm:h-36 lg:w-52 lg:h-52 rounded-lg object-cover"
    />
  );
};
