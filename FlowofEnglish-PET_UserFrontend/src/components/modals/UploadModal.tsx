"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, FileIcon } from "lucide-react";
import axios from "axios";
import { SuccessModal } from "./SuccessModal";
import { useCourseContext } from "../../pages/CoursePage";

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

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  file,
  recordedMedia,
  onUploadSuccess,
}) => {
  const courseContext = useCourseContext();
  
  // Safely destructure with fallbacks
  const currentContent = courseContext?.currentContent || {};
  const user = courseContext?.user || {};
  const selectedCohort = courseContext?.selectedCohort || {};
  const programId = courseContext?.programId || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // Manage preview URL
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

    try {
      const formData = new FormData();

      // Use data from context with safe access
      const stageId = currentContent?.stageId || "";
      const unitId = currentContent?.unitId || "";
      const subconceptId = currentContent?.subconceptId || "";
      const programIdValue = programId || selectedCohort?.programId || "";
      const cohortId = selectedCohort?.cohortId || "";
      const userId = user?.userId || "";
      const sessionId = localStorage.getItem("sessionId") || "";
      

      if (file) {
        const ext = file.name.split(".").pop() || "dat";
        formData.append(
          "file",
          file,
          `${userId}-${cohortId}-${programIdValue}-${subconceptId}.${ext}`
        );
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
          `${userId}-${cohortId}-${programIdValue}-${subconceptId}.${extension}`
        );
      } else {
        throw new Error("No file or media found for upload.");
      }

      const date = new Date();
      const ISTOffset = 5.5 * 60 * 60 * 1000;
      const ISTTime = new Date(date.getTime() + ISTOffset);
      const formattedISTTimestamp = ISTTime.toISOString().slice(0, 19);
      
      // Start time: 15 seconds before current time
      const startTime = new Date(date.getTime() - 15000); // Subtract 15 seconds
      const ISTStartTime = new Date(startTime.getTime() + ISTOffset);
      const userAttemptStartTimestamp = ISTStartTime.toISOString().slice(0, 19);

      formData.append("userId", userId);
      formData.append("cohortId", cohortId);
      formData.append("programId", programIdValue);
      formData.append("stageId", stageId);
      formData.append("unitId", unitId);
      formData.append("subconceptId", subconceptId);
      formData.append("sessionId", sessionId ?? "");
      formData.append(
        "userAttemptStartTimestamp",
        userAttemptStartTimestamp ?? ""
      );
      formData.append("userAttemptEndTimestamp", formattedISTTimestamp);
      formData.append("userAttemptScore", "0");
      formData.append("userAttemptFlag", "true");

      console.log("FormData being sent:", {
        userId: userId,
        cohortId: cohortId,
        programId: programIdValue,
        stageId: stageId,
        unitId: unitId,
        subconceptId: subconceptId,
        sessionId: sessionId
      });

      const response = await axios.post(
        `${API_BASE_URL}/assignment-with-attempt/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setShowSuccessModal(true);
        onClose();
      } else {
        throw new Error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onUploadSuccess();
  };

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
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <X size={24} />
              </button>

              {/* Header */}
              <h2 className="text-2xl font-bold mb-4">
                {file ? "Upload File" : `Upload ${recordedMedia?.type ?? ""}`}
              </h2>

              {/* File Preview */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center p-2 rounded-md bg-gray-100 cursor-pointer"
                  onClick={handleFileClick}
                >
                  <FileIcon className="w-8 h-8 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                </motion.div>
              )}

              {/* Recorded Media Preview */}
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
                    <img
                      src={previewUrl}
                      alt="Captured"
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`flex items-center px-4 py-2 rounded-[3px] text-white ${
                    isLoading
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </>
  );
};

export default UploadModal;