// @ts-nocheck
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, FileIcon } from "lucide-react";
import { FileUpload } from "../FileUpload";
import { MediaRecorder } from "../MediaRecorder";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { SuccessModal } from "./SuccessModal";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  file: File | null;
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  file
}: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<
    "upload" | "recordAudio" | "recordVideo"
  >("upload");
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useUserContext();
  const location = useLocation();
  const subconcept = location.state?.subconcept;
  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isMediaRecording, setIsMediaRecording] = useState(false); // Lifted state to disable other tabs when recording is in progress
  const navigate = useNavigate();

    const handleFileClick = () => {
      const previewUrl = URL.createObjectURL(file); 
        window.open(previewUrl, "_blank", "noopener,noreferrer"); // Open the file in a new tab
    };

  const handleSubmit = async () => {
    setErrorMessage(null); // Clear previous error
    setIsLoading(true);
    try {
      const formData = new FormData();

      if (activeTab === "upload" && uploadedFile) {
        formData.append(
          "file",
          uploadedFile,
          `${user?.userId}-${subconcept?.subconceptId}.${uploadedFile?.name
            ?.split(".")
            ?.pop()}`
        );
        console.log("Uploaded file:", uploadedFile);
      } else if (
        (activeTab === "recordAudio" || activeTab === "recordVideo") &&
        recordedBlob
      ) {
        formData.append(
          "file",
          recordedBlob,
          `${user?.userId}-${subconcept?.subconceptId}.${recordedBlob?.type}`
        );
        console.log("Recorded blob:", recordedBlob);
      } else {
        throw new Error("Please select a file or record media to upload.");
      }

      formData.append("userId", user.userId);
      formData.append("cohortId", user?.cohort?.cohortId);
      formData.append("programId", user?.program?.programId);
      formData.append("stageId", stageId);
      formData.append("unitId", currentUnitId);
      formData.append("subconceptId", subconcept?.subconceptId);

      const response = await axios.post(
        `${API_BASE_URL}/assignments/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Upload successful");
        onClose();
        setShowSuccessModal(true);
      } else {
        throw new Error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      console.log("in catch block: ", error);
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
  console.log(file)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 max-h-screen"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl p-6 bg-white rounded-[8px] shadow-xl ml-10 mr-10"
            >
              <button
                onClick={() => {
                  onClose();
                  setErrorMessage(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Uploaded File</h2>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`relative flex items-center p-2 rounded-md bg-gray-100`}
                  onClick={handleFileClick}
                  style={{ cursor: "pointer" }} // Indicate that it's clickable
                >
                  <FileIcon className="w-8 h-8 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file?.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the file open on button click
                      handleRemoveFile();
                    }}
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                    // disabled={disabled}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
              {errorMessage && (
                <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  // disabled={!hasContent || isLoading}
                  className={`flex items-center px-4 py-2 rounded-[5px] text-white bg-green-500 hover:bg-green-600 transition-colors duration-200`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={18} className="mr-2" />
                  )}
                  {isLoading ? "Uploading..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </>
  );
}
