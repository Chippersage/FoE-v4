// @ts-nocheck
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
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
}

export function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
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
  const navigate = useNavigate();

  const handleContentChange = useCallback((hasContent: boolean) => {
    setHasContent(hasContent);
  }, []);

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file); // Store the uploaded file
    console.log("Uploaded file:", file);
  };

  const handleSubmit = async () => {
    setErrorMessage(null); // Clear previous error
    setIsLoading(true);
    try {
      const formData = new FormData();

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else if (recordedBlob) {
        formData.append("file", recordedBlob);
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
              <h2 className="text-2xl font-bold mb-4">Upload File</h2>
              <div className="flex mb-4 space-x-4">
                {/* Upload File Button */}
                <button
                  onClick={() => {
                    setActiveTab("upload");
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-[5px] ${
                    activeTab === "upload"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  disabled={isLoading}
                >
                  Upload File
                </button>

                {/* Record Audio Button */}
                <button
                  onClick={() => {
                    setActiveTab("recordAudio");
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-[5px] ${
                    activeTab === "recordAudio"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  disabled={isLoading}
                >
                  Record Audio
                </button>

                {/* Record Audio Button */}
                <button
                  onClick={() => {
                    setActiveTab("recordVideo");
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-[5px] ${
                    activeTab === "recordVideo"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  disabled={isLoading}
                >
                  Record Video
                </button>
              </div>
              {activeTab === "upload" ? (
                <FileUpload
                  onContentChange={handleContentChange}
                  disabled={isLoading}
                  setErrorMessage={setErrorMessage}
                  onFileUpload={handleFileUpload} // Pass callback
                />
              ) : (
                <MediaRecorder
                  onContentChange={handleContentChange}
                  disabled={isLoading}
                  onBlobGenerated={setRecordedBlob}
                  setErrorMessage={setErrorMessage}
                  mediaType={activeTab === "recordAudio" ? "audio" : "video"}
                />
              )}
              {errorMessage && (
                <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!hasContent || isLoading}
                  className={`flex items-center px-4 py-2 rounded-[5px] text-white ${
                    hasContent && !isLoading
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-300 cursor-not-allowed"
                  } transition-colors duration-200`}
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
