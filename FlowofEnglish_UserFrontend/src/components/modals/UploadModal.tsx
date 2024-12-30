import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FileUpload } from "../FileUpload";
import { MediaRecorder } from "../MediaRecorder";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl p-6 bg-white rounded-xl shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Upload Files</h2>
            <div className="flex mb-4 space-x-4">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 rounded-[5px] ${
                  activeTab === "upload"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setActiveTab("record")}
                className={`px-4 py-2 rounded-[5px] ${
                  activeTab === "record"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Record Media
              </button>
            </div>
            {activeTab === "upload" ? <FileUpload /> : <MediaRecorder />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
