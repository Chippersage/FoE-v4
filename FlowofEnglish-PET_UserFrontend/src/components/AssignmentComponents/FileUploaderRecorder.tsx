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

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FileUploaderRecorderProps {
  onUploadSuccess: () => void;
  assignmentStatus?: any;
  uploadMeta: {
    programId: string;
    cohortId: string;
    stageId: string;
    unitId: string;
    subconceptId: string;
  };
  isMobile?: boolean;
}

type RecordingState = "recording" | "paused" | "stopped";
type ActiveAction = "upload" | "audio" | "video" | "photo" | null;

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

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

const MAX_SIZE = 10 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const FileUploaderRecorder: React.FC<FileUploaderRecorderProps> = ({
  onUploadSuccess,
  assignmentStatus,
  uploadMeta,
  isMobile = false,
}) => {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [recordingState, setRecordingState] =
    useState<RecordingState>("recording");
  const [previewContent, setPreviewContent] = useState<ReactNode | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedMedia, setRecordedMedia] = useState<{
    type: "audio" | "video" | "photo";
    blob: Blob;
  } | null>(null);

  const isDisabled =
    assignmentStatus &&
    (assignmentStatus?.status === "waiting_for_feedback" ||
      assignmentStatus?.status === "approved" ||
      assignmentStatus === "waiting_for_feedback" ||
      assignmentStatus === "approved");

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                   */
  /* -------------------------------------------------------------------------- */

  const startRecordingTimer = () => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
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

  /* -------------------------------------------------------------------------- */
  /* Actions                                                                   */
  /* -------------------------------------------------------------------------- */

  const handleUpload = (file: File) => {
    if (isDisabled) return;
    if (!validateFile(file, file.type)) return;

    setUploadedFile(file);
    setIsUploadModalOpen(true);
  };

  const handleAudioRecordingStart = () => {
    if (isDisabled) return;

    setActiveAction("audio");
    startRecordingTimer();
    setPreviewContent(<AudioPulse />);
  };

  const handleVideoRecordingStart = (stream: MediaStream) => {
    if (isDisabled) return;

    setActiveAction("video");
    streamRef.current = stream;
    startRecordingTimer();
    setPreviewContent(<VideoPreview stream={stream} />);
  };

  const handleRecordingStop = (blob: Blob, type: "audio" | "video") => {
    stopRecordingTimer();
    setRecordingState("stopped");
    setActiveAction(null);
    setPreviewContent(null);
    streamRef.current = null;

    if (!validateFile(blob, blob.type)) return;

    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
  };

  const handleRecordingStateChange = (state: RecordingState) => {
    setRecordingState(state);

    if (state === "paused") {
      stopRecordingTimer();
      setPreviewContent(<div className="text-sm">Recording paused</div>);
    }

    if (state === "recording") {
      startRecordingTimer();
      setPreviewContent(
        activeAction === "audio" ? (
          <AudioPulse />
        ) : (
          <VideoPreview stream={streamRef.current!} />
        )
      );
    }

    if (state === "stopped") {
      stopRecordingTimer();
      setRecordingDuration(0);
    }
  };

  const handlePhotoCapture = (blob: Blob, type: "photo") => {
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

  /* -------------------------------------------------------------------------- */
  /* Render                                                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      {!assignmentStatus && (
        <div
          className="flex justify-center items-center py-0.5 md:py-1" // Reduced top-bottom padding for PC
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex space-x-2 sm:space-x-2.5 bg-white rounded-full shadow-sm p-1.5 sm:p-2 border border-gray-100">
            <ActionButton
              icon={<Upload className="w-5 h-5 sm:w-5 sm:h-5" />} // Bigger on mobile: w-5
              isActive={activeAction === "upload"}
              onClick={() => setActiveAction("upload")}
              activeAction={activeAction}
              disabled={isDisabled}
            />
            <ActionButton
              icon={<Mic className="w-5 h-5 sm:w-5 sm:h-5" />} // Bigger on mobile: w-5
              isActive={activeAction === "audio"}
              onClick={() => setActiveAction("audio")}
              activeAction={activeAction}
              disabled={isDisabled}
            />
            <ActionButton
              icon={<Video className="w-5 h-5 sm:w-5 sm:h-5" />} // Bigger on mobile: w-5
              isActive={activeAction === "video"}
              onClick={() => setActiveAction("video")}
              activeAction={activeAction}
              disabled={isDisabled}
            />
            <ActionButton
              icon={<Camera className="w-5 h-5 sm:w-5 sm:h-5" />} // Bigger on mobile: w-5
              isActive={activeAction === "photo"}
              onClick={() => setActiveAction("photo")}
              activeAction={activeAction}
              disabled={isDisabled}
            />
          </div>
        </div>
      )}

      {activeAction === "upload" && !isDisabled && (
        <div className="mt-2 sm:mt-3"> {/* Reduced top margin for PC */}
          <FileUploader onUpload={handleUpload} onClose={() => setActiveAction(null)} />
        </div>
      )}

      {activeAction === "audio" && !isDisabled && (
        <div className="mt-2 sm:mt-3"> {/* Reduced top margin for PC */}
          <AudioRecorder
            onRecordingStart={handleAudioRecordingStart}
            onRecordingStop={handleRecordingStop}
            onRecordingStateChange={handleRecordingStateChange}
          />
        </div>
      )}

      {activeAction === "video" && !isDisabled && (
        <div className="mt-2 sm:mt-3"> {/* Reduced top margin for PC */}
          <VideoRecorder
            onRecordingStart={handleVideoRecordingStart}
            onRecordingStop={handleRecordingStop}
            onRecordingStateChange={handleRecordingStateChange}
          />
        </div>
      )}

      {activeAction === "photo" && !isDisabled && (
        <div className="mt-2 sm:mt-3"> {/* Reduced top margin for PC */}
          <PhotoCapture
            onCapture={handlePhotoCapture}
            onClose={() => setActiveAction(null)}
          />
        </div>
      )}

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
        onUploadSuccess={onUploadSuccess}
        programId={uploadMeta.programId}
        cohortId={uploadMeta.cohortId}
        stageId={uploadMeta.stageId}
        unitId={uploadMeta.unitId}
        subconceptId={uploadMeta.subconceptId}
      />

      {isDisabled && (
        <div className="text-center text-sm text-gray-500 mt-1.5 sm:mt-2 px-2"> {/* Reduced top margin */}
          Assignment already submitted. Waiting for mentor feedback.
        </div>
      )}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Small Components                                                           */
/* -------------------------------------------------------------------------- */

const ActionButton = ({
  icon,
  isActive,
  onClick,
  activeAction,
  disabled,
}: any) => {
  return (
    <button
      disabled={disabled || (!isActive && !!activeAction)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        rounded-full flex items-center justify-center transition-all duration-200
        cursor-pointer // Added cursor-pointer
        h-10 w-10 sm:h-10 sm:w-10 p-0 // Same size for mobile and PC
        ${isActive 
          ? "bg-[#0EA5E9] text-white shadow-sm scale-105" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow"
        }
        ${disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-600" : ""}
        ${(!isActive && activeAction) ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {icon}
    </button>
  );
};

const AudioPulse = () => (
  <div className="relative w-9 h-9 sm:w-9 sm:h-9">
    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
    <div className="relative flex items-center justify-center w-full h-full bg-red-500 rounded-full">
      <Mic className="w-5 h-5 text-white" /> {/* Bigger icon */}
    </div>
  </div>
);

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
      className="w-18 h-18 sm:w-20 sm:h-20 rounded-md object-cover border border-gray-200"
    />
  );
};