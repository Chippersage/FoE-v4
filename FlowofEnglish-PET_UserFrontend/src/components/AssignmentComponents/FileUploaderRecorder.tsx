// @ts-nocheck
"use client";

import React, { useState, useRef, type ReactNode, useEffect } from "react";
import FileUploader from "./FileUploader";
import AudioRecorder from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { Preview } from "./Preview";
import { Upload, Mic, Video, Camera } from "lucide-react";
import UploadModal from "../modals/UploadModal";
import { PhotoCapture } from "./PhotoCapture";

interface FileUploaderRecorderProps {
  onUploadSuccess: () => void;
  assignmentStatus?: any;
}

type RecordingState = "recording" | "paused" | "stopped";
type ActiveAction = "upload" | "audio" | "video" | "photo" | null;

// File type and size validation constants
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "audio/mpeg",
  "audio/ogg",
  "video/mp4",
  "video/webm",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploaderRecorder: React.FC<FileUploaderRecorderProps> = ({
  onUploadSuccess,
  assignmentStatus,
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

  // Determine if the assignment has already been submitted
  const isDisabled =
    assignmentStatus &&
    (assignmentStatus?.status === "waiting_for_feedback" ||
      assignmentStatus?.status === "approved" ||
      assignmentStatus === "waiting_for_feedback" ||
      assignmentStatus === "approved");

  // Start a timer for recording duration
  const startRecordingTimer = (): void => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    recordingInterval.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = (): void => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  // File validation helper
  const validateFile = (file: File | Blob, type: string) => {
    if ((file as File).size > MAX_SIZE) {
      alert("File size must be less than 10MB.");
      return false;
    }

    if (type && type.startsWith("audio/ogg")) return true;
    if (type && !allowedTypes.includes(type)) {
      alert("Invalid file type. Only PDF, DOC, Image, Audio, or Video allowed.");
      return false;
    }
    return true;
  };

  const handleUpload = (file: File): void => {
    if (isDisabled) return;
    if (!validateFile(file, file.type)) return;
    setUploadedFile(file);
    setIsUploadModalOpen(true);
  };

  const handleAudioRecordingStart = (): void => {
    if (isDisabled) return;
    setActiveAction("audio");
    startRecordingTimer();
    setPreviewContent(<AudioPulse />);
  };

  const handleVideoRecordingStart = (stream: MediaStream): void => {
    if (isDisabled) return;
    setActiveAction("video");
    streamRef.current = stream;
    startRecordingTimer();
    setPreviewContent(<VideoPreview stream={stream} />);
  };

  const handleRecordingStop = (blob: Blob, type: "audio" | "video"): void => {
    stopRecordingTimer();
    setActiveAction(null);
    setPreviewContent(null);
    setRecordingState("stopped");
    streamRef.current = null;
    if (!validateFile(blob, blob.type)) return;
    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
  };

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

  const handlePhotoCapture = (blob: Blob, type: "photo"): void => {
    if (isDisabled) return;
    if (!validateFile(blob, blob.type)) return;
    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
    setActiveAction(null);
  };

  const handleCloseModal = () => {
    setUploadedFile(null);
    setRecordedMedia(null);
    setIsUploadModalOpen(false);
    setRecordingState("stopped");
    setActiveAction(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    onUploadSuccess();
  };

  return (
    <>
      {/* Action buttons */}
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
            disabled={isDisabled}
          />
          <ActionButton
            icon={<Mic />}
            onClick={() => setActiveAction("audio")}
            isActive={activeAction === "audio"}
            activeAction={activeAction}
            disabled={isDisabled}
          />
          <ActionButton
            icon={<Video />}
            onClick={() => setActiveAction("video")}
            isActive={activeAction === "video"}
            activeAction={activeAction}
            disabled={isDisabled}
          />
          <ActionButton
            icon={<Camera />}
            onClick={() => setActiveAction("photo")}
            isActive={activeAction === "photo"}
            activeAction={activeAction}
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Conditional components */}
      {activeAction === "upload" && !isDisabled && (
        <FileUploader onUpload={handleUpload} onClose={() => setActiveAction(null)} />
      )}

      {activeAction === "audio" && !isDisabled && (
        <AudioRecorder
          onRecordingStart={handleAudioRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingStateChange={handleRecordingStateChange}
        />
      )}

      {activeAction === "video" && !isDisabled && (
        <VideoRecorder
          onRecordingStart={handleVideoRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingStateChange={handleRecordingStateChange}
        />
      )}

      {activeAction === "photo" && !isDisabled && (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onClose={() => setActiveAction(null)}
        />
      )}

      {/* Preview and upload modal */}
      <Preview
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
        onClose={handleCloseModal}
        onUploadSuccess={handleSuccess}
      />

      {/* Submission state note */}
      {isDisabled && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Assignment already submitted. Waiting for mentor feedback.
        </div>
      )}
    </>
  );
};

// Action button component
const ActionButton = ({ icon, isActive, onClick, activeAction, disabled }: any) => {
  return (
    <button
      disabled={disabled || (!isActive && !!activeAction)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-full flex items-center justify-center transition-colors
      h-10 w-10 sm:h-9 sm:w-9 md:h-8 md:w-8
      p-2 sm:p-1.5
      ${isActive ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-200"}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `}
    >
      {icon}
    </button>
  );
};

// Audio pulse animation for active recording
const AudioPulse = () => (
  <div className="relative w-8 h-8">
    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
    <div className="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full">
      <Mic className="w-4 h-4 text-white" />
    </div>
  </div>
);

// Video preview during recording
const VideoPreview = ({ stream }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
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
