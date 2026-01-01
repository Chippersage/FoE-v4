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

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

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
  const { user } = useUserContext();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Add ref to prevent double submission
  const isSubmittingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  /* -------------------------------------------------------------------------- */
  /* Reset state when modal opens/closes                                        */
  /* -------------------------------------------------------------------------- */
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
      isSubmittingRef.current = true;
      setIsLoading(true);
      setErrorMessage(null);

      const formData = new FormData();
      const sessionId = localStorage.getItem("sessionId") || "";

      /* -------------------- File -------------------- */
      if (file) {
        const ext = file.name.split(".").pop() || "dat";
        formData.append(
          "file",
          file,
          `${user.userId}-${cohortId}-${programId}-${subconceptId}.${ext}`
        );
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
          `${user.userId}-${cohortId}-${programId}-${subconceptId}.${ext}`
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

      const userAttemptEndTimestamp = attemptEnd
        .toISOString()
        .slice(0, 19);

      /* -------------------- Payload -------------------- */
      formData.append("userId", user.userId);
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

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

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
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-sky-100 bg-sky-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-sky-600" />
                  <h3 className="text-sm font-semibold text-sky-700">
                    Submit Assignment
                  </h3>
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
                  disabled={isLoading || isSubmittingRef.current || hasSubmittedRef.current}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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