"use client";

import React, { useState, useRef, type ReactNode, useEffect } from "react";
import FileUploader from "./FileUploader";
import AudioRecorder from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { Preview } from "./Preview";
import { Upload, Mic, Video, Camera } from "lucide-react";
import UploadModal from "../modals/UploadModal";
import { PhotoCapture } from "./PhotoCapture";

type RecordingState = "recording" | "paused" | "stopped";
type ActiveAction = "upload" | "audio" | "video" | "photo" | null;

interface FileUploaderRecorderProps {
  onUploadSuccess: () => void;
}

// Core component that manages upload and recording actions
export const FileUploaderRecorder: React.FC<FileUploaderRecorderProps> = ({
  onUploadSuccess,
}) => {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("recording");
  const [previewContent, setPreviewContent] = useState<ReactNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedMedia, setRecordedMedia] = useState<{
    type: "audio" | "video" | "photo";
    blob: Blob;
  } | null>(null);

  // Start a timer for recording duration
  const startRecordingTimer = (): void => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    recordingInterval.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  // Stop the duration timer
  const stopRecordingTimer = (): void => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  // Handle file uploads
  const handleUpload = (file: File): void => {
    setUploadedFile(file);
    setIsUploadModalOpen(true);
  };

  // Handle audio recording start
  const handleAudioRecordingStart = (): void => {
    setActiveAction("audio");
    startRecordingTimer();
    setPreviewContent(<AudioPulse />);
  };

  // Handle video recording start
  const handleVideoRecordingStart = (stream: MediaStream): void => {
    setActiveAction("video");
    streamRef.current = stream;
    startRecordingTimer();
    setPreviewContent(<VideoPreview stream={stream} />);
  };

  // Handle recording stop for both audio and video
  const handleRecordingStop = (blob: Blob, type: "audio" | "video"): void => {
    stopRecordingTimer();
    setActiveAction(null);
    setPreviewContent(null);
    setRecordingState("stopped");
    streamRef.current = null;

    if (!blob) {
      console.error("Invalid blob received:", blob);
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (blob.size > maxSize) {
      alert("File size limit exceeded! Must be less than 50MB.");
      return;
    }

    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
  };

  // Handle recording state changes
  const handleRecordingStateChange = (state: RecordingState): void => {
    setRecordingState(state);
    if (state === "paused") {
      stopRecordingTimer();
      setPreviewContent(<div className="text-sm">Recording paused</div>);
    } else if (state === "recording") {
      startRecordingTimer();
      setPreviewContent(
        activeAction === "audio" ? (
          <AudioPulse />
        ) : (
          <VideoPreview stream={streamRef.current!} />
        )
      );
    } else if (state === "stopped") {
      stopRecordingTimer();
      setRecordingDuration(0);
    }
  };

  // Handle photo capture
  const handlePhotoCapture = (blob: Blob, type: "photo"): void => {
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (blob.size > maxSize) {
      alert("Image should not exceed 10MB.");
      return;
    }

    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
    setActiveAction(null);
  };

  return (
    <>
      {/* Action Buttons (Upload, Audio, Video, Photo) */}
      <div
        className="flex justify-center h-10 sm:h-11 md:h-12 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex space-x-1.5 sm:space-x-2 bg-white rounded-full shadow-md p-1.5 sm:p-2">
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
          <ActionButton
            icon={<Camera />}
            onClick={() => setActiveAction("photo")}
            isActive={activeAction === "photo"}
            activeAction={activeAction}
          />
        </div>
      </div>

      {/* Conditionally render components */}
      {activeAction === "upload" && (
        <FileUploader onUpload={handleUpload} onClose={() => setActiveAction(null)} />
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

      {activeAction === "photo" && (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onClose={() => setActiveAction(null)}
        />
      )}

      {/* Preview Area */}
      <Preview
        recordingDuration={recordingDuration}
        activeAction={activeAction}
        recordingState={recordingState}
      >
        {previewContent}
      </Preview>

      {/* Upload Modal */}
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

// Single reusable action button
interface ActionButtonProps {
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
  activeAction: ActiveAction;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  isActive,
  onClick,
  activeAction,
}) => {
  return (
    <button
      disabled={!isActive && !!activeAction}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    className={`rounded-full flex items-center justify-center transition-colors
      h-10 w-10 sm:h-9 sm:w-9 md:h-8 md:w-8
      p-2 sm:p-1.5
      ${isActive ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-200"}
    `}

    >
      {icon}
    </button>
  );
};

// Audio pulse animation
const AudioPulse: React.FC = () => {
  return (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
      <div className="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full">
        <Mic className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

// Live video preview during recording
interface VideoPreviewProps {
  stream: MediaStream;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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