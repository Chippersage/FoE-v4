// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, FileIcon } from "lucide-react";
import axios from "axios";
import { SuccessModal } from "./SuccessModal";
import { useUserContext } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  recordedMedia: { type: "audio" | "video" | "photo"; blob: Blob } | null;
  onUploadSuccess: () => void;
}

// Add UserData interface for consistency
interface UserData {
  userId: string;
  unitId: string;
  programId: string;
  stageId: string;
  sessionId: string;
  cohortId: string;
  subconceptId: string;
  userAttemptStartTimestamp: string;
  API_BASE_URL: string;
  enableAiEvaluation?: boolean;
}

export function UploadModal({
  isOpen,
  onClose,
  file,
  recordedMedia,
  onUploadSuccess,
}: UploadModalProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { user, selectedCohortWithProgram } = useUserContext();
  const subconcept = location.state?.subconcept;
  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // URL for preview
  const userData: UserData = JSON.parse(localStorage.getItem("userData") || "{}");

  // console.log("recordedMedia", recordedMedia);
  // console.log("file", file);

  useEffect(() => {
    if (recordedMedia) {
      // Revoke the previous URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // console.log(recordedMedia)
       const newUrl = URL.createObjectURL(recordedMedia.blob);
       setPreviewUrl(newUrl);
      return () => URL.revokeObjectURL(newUrl); // Cleanup when component unmounts
    }
    return () => { 
      if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }};
  }, [recordedMedia]);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null)
    onClose(); // Call the parent function
  };

  // Handle File Preview
  const handleFileClick = () => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } 
  };

  // Handle API Submit
  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        // console.log("file", file);
        formData.append(
          "file",
          file,
          `${user?.userId}-${selectedCohortWithProgram?.cohortId}-${selectedCohortWithProgram?.program?.programId}-${
            subconcept?.subconceptId
          }.${file.name?.split(".")?.pop()}`
        );
      } else if (recordedMedia) {
        const extension =
          recordedMedia.type === "audio"
            ? "mp3"
            : recordedMedia.type === "video"
            ? "mp4"
            : "jpg"; // Default to .jpg for photos
        formData.append(
          "file",
          recordedMedia.blob,
          `${user?.userId}-${selectedCohortWithProgram?.cohortId}-${selectedCohortWithProgram?.program?.programId}-${subconcept?.subconceptId}.${extension}`
        );
      } else {
        throw new Error("No file or media found for upload.");
      }

      const date = new Date();
      const ISTOffset = 5.5 * 60 * 60 * 1000;
      const ISTTime = new Date(date.getTime() + ISTOffset);
      const formattedISTTimestamp = ISTTime.toISOString().slice(0, 19);

      formData.append("userId", user.userId);
      formData.append("cohortId", selectedCohortWithProgram?.cohortId);
      formData.append(
        "programId",
        selectedCohortWithProgram?.program?.programId
      );
      formData.append("stageId", stageId);
      formData.append("unitId", currentUnitId);
      formData.append("subconceptId", subconcept?.subconceptId);
      formData.append("sessionId", userData.sessionId);
      formData.append("userAttemptStartTimestamp", userData.userAttemptStartTimestamp);
      formData.append("userAttemptEndTimestamp", formattedISTTimestamp);
      
      // Get the evaluation score if it exists (for speech activities)
      // This will only exist if AI evaluation was enabled and completed
      const evaluationScore = localStorage.getItem('audioEvaluationScore');
      console.log("evaluationScore", evaluationScore);
      
      // Use evaluation score if available, otherwise use 0
      // When AI evaluation is disabled, this will be null/undefined and default to 0
      formData.append("userAttemptScore", evaluationScore || "0");
      
      // Clean up the stored score
      if (evaluationScore) {
        localStorage.removeItem('audioEvaluationScore');
      }
      formData.append("userAttemptFlag", "true");

      const response = await axios.post(
        ` ${API_BASE_URL}/assignment-with-attempt/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setShowSuccessModal(true);
        onClose(); // Close upload modal on success
      } else {
        throw new Error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data || error.message || "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false); // Close child success modal
    onUploadSuccess(); // Notify parent for further processing
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
                {file ? "Upload File" : `Upload ${recordedMedia?.type}`}
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
                    {file?.name}
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
                  }  transition-colors duration-200`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={18} className="mr-2" />
                  )}
                  {"Submit"}
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
}

export default UploadModal;