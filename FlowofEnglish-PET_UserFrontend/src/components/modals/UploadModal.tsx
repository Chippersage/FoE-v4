// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  FileIcon,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { SuccessModal } from "./SuccessModal";
import { useUserContext } from "../../context/AuthContext";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

  programId: string;
  cohortId: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
}

<<<<<<< HEAD
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
=======
/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
>>>>>>> modern-pet-ui-sidebar-fix-branch

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  file,
  recordedMedia,
  onUploadSuccess,
  programId,
  cohortId,
  stageId,
  unitId,
  subconceptId,
}) => {
<<<<<<< HEAD
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
=======
  const { user } = useUserContext();
>>>>>>> modern-pet-ui-sidebar-fix-branch

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Add ref to prevent double submission
  const isSubmittingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

<<<<<<< HEAD
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

=======
  /* -------------------------------------------------------------------------- */
  /* Reset state when modal opens/closes                                        */
  /* -------------------------------------------------------------------------- */
>>>>>>> modern-pet-ui-sidebar-fix-branch
  useEffect(() => {
    if (isOpen) {
      // Reset submission flags when modal opens
      isSubmittingRef.current = false;
      hasSubmittedRef.current = false;
      setErrorMessage(null);
    } else {
      // Clean up when modal closes
      cleanupPreview();
    }
  }, [isOpen]);

  /* -------------------------------------------------------------------------- */
  /* Preview Handling                                                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    if (recordedMedia) {
      const url = URL.createObjectURL(recordedMedia.blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, recordedMedia, isOpen]);

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Submit - with double-click prevention                                      */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async () => {
    // PREVENT DOUBLE SUBMISSION
    if (isSubmittingRef.current || hasSubmittedRef.current) return;
    
    if (!user?.userId || !programId || !cohortId || !stageId || !unitId || !subconceptId) {
      setErrorMessage("Missing upload metadata. Please reload the course.");
      return;
    }

    if (!file && !recordedMedia) {
      setErrorMessage("No file selected for upload.");
      return;
    }

    try {
<<<<<<< HEAD
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
=======
      isSubmittingRef.current = true;
      setIsLoading(true);
      setErrorMessage(null);
>>>>>>> modern-pet-ui-sidebar-fix-branch

      const formData = new FormData();
      const sessionId = localStorage.getItem("sessionId") || "";

<<<<<<< HEAD
      // Create filename using data from localStorage
      if (file) {
        const ext = file.name.split(".").pop() || "dat";
        formData.append("file", file, `${userId}-${cohortId}-${programId}-${subconceptId}.${ext}`);
=======
      /* -------------------- File -------------------- */
      if (file) {
        const ext = file.name.split(".").pop() || "dat";
        formData.append(
          "file",
          file,
          `${user.userId}-${cohortId}-${programId}-${subconceptId}.${ext}`
        );
>>>>>>> modern-pet-ui-sidebar-fix-branch
      } else if (recordedMedia) {
        const ext =
          recordedMedia.type === "audio"
            ? "mp3"
            : recordedMedia.type === "video"
            ? "mp4"
            : "jpg";

        formData.append(
          "file",
          recordedMedia.blob,
<<<<<<< HEAD
          `${userId}-${cohortId}-${programId}-${subconceptId}.${extension}`
=======
          `${user.userId}-${cohortId}-${programId}-${subconceptId}.${ext}`
>>>>>>> modern-pet-ui-sidebar-fix-branch
        );
      }

      /* -------------------- Attempt Metadata -------------------- */
      const now = new Date();
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;

      const attemptEnd = new Date(now.getTime() + IST_OFFSET);
      const attemptStart = new Date(attemptEnd.getTime() - 15000);

      const userAttemptStartTimestamp = attemptStart
        .toISOString()
        .slice(0, 19);

<<<<<<< HEAD
      // Use data from localStorage instead of context
      formData.append("userId", userId);
=======
      const userAttemptEndTimestamp = attemptEnd
        .toISOString()
        .slice(0, 19);

      /* -------------------- Payload -------------------- */
      formData.append("userId", user.userId);
>>>>>>> modern-pet-ui-sidebar-fix-branch
      formData.append("cohortId", cohortId);
      formData.append("programId", programId);
      formData.append("stageId", stageId);
      formData.append("unitId", unitId);
      formData.append("subconceptId", subconceptId);
      formData.append("sessionId", sessionId);

      formData.append(
        "userAttemptStartTimestamp",
        userAttemptStartTimestamp
      );
      formData.append("userAttemptEndTimestamp", userAttemptEndTimestamp);
      formData.append("userAttemptScore", "0");
      formData.append("userAttemptFlag", "true");

<<<<<<< HEAD
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
=======
      await axios.post(
        `${API_BASE_URL}/assignment-with-attempt/submit`,
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          // Add timeout to prevent hanging requests
          timeout: 30000 
        }
      );

      // Mark as successfully submitted
      hasSubmittedRef.current = true;
      setShowSuccessModal(true);
      
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
      // Reset submission flags on error
      isSubmittingRef.current = false;
      hasSubmittedRef.current = false;
>>>>>>> modern-pet-ui-sidebar-fix-branch
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    cleanupPreview();
    setErrorMessage(null);
    onClose();
  };

  /* -------------------------------------------------------------------------- */
  /* Handle success modal close                                                 */
  /* -------------------------------------------------------------------------- */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (onUploadSuccess) {
      onUploadSuccess();
    }
    handleClose();
  };

<<<<<<< HEAD
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
=======
  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */
>>>>>>> modern-pet-ui-sidebar-fix-branch

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-sky-100"
            >
<<<<<<< HEAD
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
=======
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-sky-100 bg-sky-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-sky-600" />
                  <h3 className="text-sm font-semibold text-sky-700">
                    Submit Assignment
                  </h3>
>>>>>>> modern-pet-ui-sidebar-fix-branch
                </div>
                <button 
                  onClick={handleClose}
                  disabled={isSubmittingRef.current}
                >
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3">
                {file && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 border border-sky-100">
                    <FileIcon size={16} className="text-sky-600" />
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {file.name}
                    </span>
                  </div>
                )}

                {recordedMedia && previewUrl && (
                  <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
                    {recordedMedia.type === "audio" && (
                      <audio controls src={previewUrl} className="w-full" />
                    )}
                    {recordedMedia.type === "video" && (
                      <video
                        controls
                        src={previewUrl}
                        className="w-full rounded-md"
                      />
                    )}
                    {recordedMedia.type === "photo" && (
                      <img
                        src={previewUrl}
                        className="w-full rounded-md object-cover"
                      />
                    )}
                  </div>
                )}

                {errorMessage && (
                  <p className="text-xs text-red-500">{errorMessage}</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 flex justify-end border-t border-gray-100">
                <button
                  onClick={handleSubmit}
<<<<<<< HEAD
                  disabled={isLoading || !userId || !cohortId || !programId}
                  className={`flex items-center px-4 py-2 rounded-[3px] text-white ${
                    isLoading || !userId || !cohortId || !programId
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } transition-colors duration-200`}
=======
                  disabled={isLoading || isSubmittingRef.current || hasSubmittedRef.current}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
>>>>>>> modern-pet-ui-sidebar-fix-branch
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting
                    </>
                  ) : hasSubmittedRef.current ? (
                    <>
                      <CheckCircle2 size={14} />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default UploadModal;