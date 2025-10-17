// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileUploader } from "./FileUploader";
import { AudioRecorder } from "./AudioRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { Preview } from "./Preview";
import { Upload, Mic, Video, Camera } from "lucide-react";
import UploadModal from "./modals/UploadModal";
import { PhotoCapture } from "./PhotoCapture";

interface FileUploaderRecorderProps {
  onUploadSuccess: () => void;
  onImageAudioEvaluation?: (audioBlob: Blob) => Promise<boolean> | boolean;
  subconceptType?: string;
}

// Add SelectedCohortWithProgram interface
interface SelectedCohortWithProgram {
  cohortId: string;
  cohortName: string;
  cohortEndDate: string;
  enableAiEvaluation?: boolean;
  program: {
    programId: string;
    programName: string;
  };
  // Add other fields as needed
}

export const FileUploaderRecorder: React.FC<FileUploaderRecorderProps> = ({ 
  onUploadSuccess, 
  onImageAudioEvaluation,
  subconceptType 
}) => {
  const [activeAction, setActiveAction] = useState<
    "upload" | "audio" | "video" | "photo" | null
  >(null);
  const [recordingState, setRecordingState] = useState<
    "recording" | "paused" | "stopped"
  >("stopped");
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(
    null
  );
  const streamRef = useRef<MediaStream | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordedMedia, setRecordedMedia] = useState<{
    type: "audio" | "video" | "photo";
    blob: Blob;
  } | null>(null);

  // ✅ FIX: Get selectedCohortWithProgram from localStorage instead of userData
  const selectedCohortWithProgram: SelectedCohortWithProgram = JSON.parse(
    localStorage.getItem("selectedCohortWithProgram") || "{}"
  );

  // DEBUG: Log the AI evaluation status
  useEffect(() => {
    console.log("🔍 FileUploaderRecorder - AI Evaluation Status:", {
      enableAiEvaluation: selectedCohortWithProgram?.enableAiEvaluation,
      subconceptType: subconceptType,
      selectedCohortWithProgram: selectedCohortWithProgram
    });
  }, [selectedCohortWithProgram, subconceptType]);

  const startRecordingTimer = () => {
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    setRecordingDuration(0);

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

  const handleRecordingStop = async (blob: Blob, type: "audio" | "video") => {
    stopRecordingTimer();
    setActiveAction(null);
    setPreviewContent(null);
    setRecordingState("stopped");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (!blob) {
      console.error("handleRecordingStop received an invalid blob:", blob);
      return;
    }

    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (blob.size > maxSize) {
      alert(`File size limit exceeded! ${type} should be less than ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    // Handle audio evaluation for assignment_image type - WITH AI EVALUATION CHECK
    if (type === "audio" && onImageAudioEvaluation && subconceptType === "assignment_image") {
      setRecordedMedia({ type, blob });
      
      // ✅ FIX: Check selectedCohortWithProgram.enableAiEvaluation instead of userData
      // DEBUG: Log the decision process
      console.log("🎯 AI Evaluation Decision:", {
        enableAiEvaluation: selectedCohortWithProgram?.enableAiEvaluation,
        shouldEvaluate: selectedCohortWithProgram?.enableAiEvaluation,
        subconceptType: subconceptType
      });

      // Check if AI evaluation is enabled for this cohort
      if (selectedCohortWithProgram?.enableAiEvaluation) {
        try {
          console.log('✅ AI evaluation enabled - proceeding with evaluation');
          const evaluationComplete = await onImageAudioEvaluation(blob);
          if (evaluationComplete) {
            setIsUploadModalOpen(true);
          }
        } catch (error) {
          console.error('❌ Audio evaluation failed:', error);
          setIsUploadModalOpen(true); // Fallback to normal upload
        }
      } else {
        console.log('⏭️ AI evaluation disabled - proceeding with normal upload');
        setIsUploadModalOpen(true); // Skip AI evaluation and go directly to upload
      }
      return;
    }
    
    // Normal flow for other types
    console.log('📁 Normal upload flow for non-audio or non-assignment_image type');
    setRecordedMedia({ type, blob });
    setIsUploadModalOpen(true);
  };

  const handleRecordingStateChange = (
    state: "recording" | "paused" | "stopped"
  ) => {
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

  const handlePhotoCapture = (blob: Blob) => {
    const maxSize = 10 * 1024 * 1024;
    if (blob.size > maxSize) {
      alert("File size limit exceeded! Image should not be more than 10MB.");
      return;
    }
    setRecordedMedia({ type: "photo", blob });
    setIsUploadModalOpen(true);
    setActiveAction(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <div
        className="flex justify-center h-12 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex space-x-2 bg-white rounded-full shadow-lg p-2">
          <ActionButton
            icon={<Upload size={18} />}
            onClick={() => setActiveAction("upload")}
            isActive={activeAction === "upload"}
            activeAction={activeAction}
          />
          <ActionButton
            icon={<Mic size={18} />}
            onClick={() => setActiveAction("audio")}
            isActive={activeAction === "audio"}
            activeAction={activeAction}
          />
          <ActionButton
            icon={<Video size={18} />}
            onClick={() => setActiveAction("video")}
            isActive={activeAction === "video"}
            activeAction={activeAction}
          />
          <ActionButton
            icon={<Camera size={18} />}
            onClick={() => setActiveAction("photo")}
            isActive={activeAction === "photo"}
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

      {activeAction === "photo" && (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onClose={() => setActiveAction(null)}
        />
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
        onClose={() => {
          setUploadedFile(null);
          setRecordedMedia(null);
          setIsUploadModalOpen(false);
          setRecordingState("stopped");
          setActiveAction(null);
          setRecordingDuration(0);
        }}
        onUploadSuccess={onUploadSuccess}
      />
    </>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  activeAction: string | null;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  isActive, 
  onClick, 
  activeAction 
}) => {
  return (
    <button
      disabled={!isActive && !!activeAction}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`p-2 rounded-full flex items-center justify-center h-10 w-10 transition-colors ${
        isActive 
          ? "bg-green-500 text-white" 
          : "text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
};

interface VideoPreviewProps {
  stream: MediaStream;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-16 h-16 sm:w-36 sm:h-36 lg:w-52 lg:h-52 rounded-lg object-cover border-2 border-red-500"
    />
  );
};