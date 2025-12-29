// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, FileIcon } from "lucide-react";
import axios from "axios";
import { SuccessModal } from "./SuccessModal";
import { useUserContext } from "../../context/AuthContext";
import { useCourseContext } from "../../context/CourseContext";

interface RecordedMedia {
  type: "audio" | "video" | "photo";
  blob: Blob;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  recordedMedia: RecordedMedia | null;
  onUploadSuccess: () => void;
}

// Interface for the cohort data structure in localStorage
interface SelectedCohort {
  cohortEndDate: string;
  cohortId: string;
  cohortName: string;
  cohortStartDate: string;
  delayInDays: number;
  delayedStageUnlock: boolean;
  enableAiEvaluation: boolean;
  organization: {
    organizationId: string;
    organizationName: string;
  };
  programDesc: string;
  programId: string;
  programName: string;
  progress: number;
  showLeaderboard: boolean;
  stagesCount: number;
  unitCount: number;
}

// Interface for user data structure
interface UserData {
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhoneNumber: string;
  userAddress: string;
  userType: string;
  status: string;
  createdAt: number;
  deactivatedAt: string | null;
  deactivatedReason: string | null;
  organization: {
    organizationId: string;
    organizationAdminName: string;
  };
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  file,
  recordedMedia,
  onUploadSuccess,
}) => {
  // Keep context imports for other uses, but we'll get data from localStorage
  const { user, cohort } = useUserContext();
  const courseContext = useCourseContext();

  const currentContent = courseContext?.currentContent || {};
  
  // Get data from localStorage
  const [userId, setUserId] = useState<string>("");
  const [cohortId, setCohortId] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [selectedCohort, setSelectedCohort] = useState<SelectedCohort | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  // Get data from localStorage on component mount
  useEffect(() => {
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser: UserData = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserId(parsedUser.userId);
      }

      // Get selected cohort data from localStorage
      const storedCohort = localStorage.getItem("selectedCohort");
      if (storedCohort) {
        const parsedCohort: SelectedCohort = JSON.parse(storedCohort);
        setSelectedCohort(parsedCohort);
        setCohortId(parsedCohort.cohortId);
        setProgramId(parsedCohort.programId);
      }
    } catch (error) {
      console.error("Error parsing data from localStorage:", error);
    }
  }, [isOpen]); // Re-fetch when modal opens

  useEffect(() => {
    if (recordedMedia) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newUrl = URL.createObjectURL(recordedMedia.blob);
      setPreviewUrl(newUrl);
      return () => URL.revokeObjectURL(newUrl);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [recordedMedia]);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
    setSubmissionCompleted(false);
    onClose();
  };

  const handleFileClick = () => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    setSubmissionCompleted(false);

    try {
      // Validate data from localStorage
      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }
      
      if (!cohortId) {
        throw new Error("Cohort ID not found. Please select a cohort.");
      }
      
      if (!programId) {
        throw new Error("Program ID not found. Please select a cohort.");
      }

      const formData = new FormData();
      const { stageId, unitId, subconceptId } = currentContent;
      const sessionId = localStorage.getItem("sessionId") || "";

      // Create filename using data from localStorage
      if (file) {
        const ext = file.name.split(".").pop() || "dat";
        formData.append("file", file, `${userId}-${cohortId}-${programId}-${subconceptId}.${ext}`);
      } else if (recordedMedia) {
        const extension =
          recordedMedia.type === "audio"
            ? "mp3"
            : recordedMedia.type === "video"
            ? "mp4"
            : "jpg";

        formData.append(
          "file",
          recordedMedia.blob,
          `${userId}-${cohortId}-${programId}-${subconceptId}.${extension}`
        );
      } else {
        throw new Error("No file or media found for upload.");
      }

      const now = new Date();
      const ISTOffset = 5.5 * 60 * 60 * 1000;
      const ISTNow = new Date(now.getTime() + ISTOffset);
      const userAttemptEndTimestamp = ISTNow.toISOString().slice(0, 19);
      const userAttemptStartTimestamp = new Date(now.getTime() - 15000 + ISTOffset)
        .toISOString()
        .slice(0, 19);

      // Use data from localStorage instead of context
      formData.append("userId", userId);
      formData.append("cohortId", cohortId);
      formData.append("programId", programId);
      formData.append("stageId", stageId || "");
      formData.append("unitId", unitId || "");
      formData.append("subconceptId", subconceptId || "");
      formData.append("sessionId", sessionId ?? "");
      formData.append("userAttemptStartTimestamp", userAttemptStartTimestamp);
      formData.append("userAttemptEndTimestamp", userAttemptEndTimestamp);
      formData.append("userAttemptScore", "0");
      formData.append("userAttemptFlag", "true");

      // Optional: Also send organization info if needed
      if (selectedCohort?.organization?.organizationId) {
        formData.append("organizationId", selectedCohort.organization.organizationId);
      }

      const response = await axios.post(`${API_BASE_URL}/assignment-with-attempt/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setSubmissionCompleted(true);
        setShowSuccessModal(true);
      } else {
        throw new Error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      
      // Provide more specific error messages
      if (error.message.includes("User ID not found") || 
          error.message.includes("Cohort ID not found") ||
          error.message.includes("Program ID not found")) {
        setErrorMessage(error.message + " Please refresh the page or login again.");
      } else {
        setErrorMessage(error.response?.data?.message || error.message || "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (submissionCompleted) {
      onUploadSuccess();
    }
    handleClose();
  };

  // For debugging: Log the data we're getting from localStorage
  useEffect(() => {
    if (isOpen) {
      console.log("UploadModal - Data from localStorage:", {
        userId,
        cohortId,
        programId,
        selectedCohort,
        userData
      });
    }
  }, [isOpen, userId, cohortId, programId, selectedCohort, userData]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg p-6 bg-white rounded-[3px] shadow-xl"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-4">
                {file ? "Upload File" : `Upload ${recordedMedia?.type ?? ""}`}
              </h2>

              {/* Optional: Show data from localStorage for debugging */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <p>User: {userId}</p>
                  <p>Cohort: {cohortId}</p>
                  <p>Program: {programId}</p>
                </div>
              )}

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center p-2 rounded-md bg-gray-100 cursor-pointer"
                  onClick={handleFileClick}
                >
                  <FileIcon className="w-8 h-8 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                </motion.div>
              )}

              {recordedMedia && previewUrl && (
                <div className="mt-4 p-2 rounded-md bg-gray-100">
                  {recordedMedia.type === "audio" ? (
                    <audio controls>
                      <source src={previewUrl} type={recordedMedia.blob.type} />
                      Your browser does not support the audio element.
                    </audio>
                  ) : recordedMedia.type === "video" ? (
                    <video controls className="w-full rounded-lg">
                      <source src={previewUrl} type={recordedMedia.blob.type} />
                      Your browser does not support the video element.
                    </video>
                  ) : (
                    <img src={previewUrl} alt="Captured" className="w-full rounded-lg" />
                  )}
                </div>
              )}

              {errorMessage && <p className="text-sm text-red-500 mt-4">{errorMessage}</p>}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !userId || !cohortId || !programId}
                  className={`flex items-center px-4 py-2 rounded-[3px] text-white ${
                    isLoading || !userId || !cohortId || !programId
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={18} className="mr-2" />
                  )}
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessModalClose} />
    </>
  );
};

export default UploadModal;