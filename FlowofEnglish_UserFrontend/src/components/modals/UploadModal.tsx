import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { FileUpload } from "../FileUpload";
import { MediaRecorder } from "../MediaRecorder";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext()
  const location = useLocation();
  const subconcept = location.state?.subconcept;
  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);


  const handleContentChange = useCallback((hasContent: boolean) => {
    setHasContent(hasContent);
  }, []);


  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const fileUploadInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;

      const formData = new FormData();

      if (
        fileUploadInput &&
        fileUploadInput.files &&
        fileUploadInput.files.length > 0
      ) {
        formData.append(
          "file",
          fileUploadInput.files[fileUploadInput.files.length - 1]
        );
      } else if (recordedBlob) {
        formData.append(
          "file",
          recordedBlob,
          `recording-${Date.now()}.webm`
        );
      } else {
        throw new Error("No file selected");
      }

      formData.append("userId", user.userId);
      formData.append("cohortId", user?.cohort?.cohortId);
      formData.append("programId", user?.program?.programId);
      formData.append("stageId", stageId);
      formData.append("unitId", currentUnitId);
      formData.append("subconceptId", subconcept?.subconceptId);

      const response = await axios.post(`${API_BASE_URL}/assignments/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("Upload successful");
        onClose();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error during upload:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Upload File</h2>
            <div className="flex mb-4 space-x-4">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "upload"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                disabled={isLoading}
              >
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("record")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "record"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                disabled={isLoading}
              >
                Record Media
              </button>
            </div>
            {activeTab === "upload" ? (
              <FileUpload
                onContentChange={handleContentChange}
                disabled={isLoading}
              />
            ) : (
              <MediaRecorder
                onContentChange={handleContentChange}
                disabled={isLoading}
                onBlobGenerated={setRecordedBlob}
              />
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!hasContent || isLoading}
                className={`flex items-center px-4 py-2 rounded-md text-white ${
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
  );
}
