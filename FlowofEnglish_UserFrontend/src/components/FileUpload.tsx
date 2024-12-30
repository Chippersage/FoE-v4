import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { FileIcon, X } from "lucide-react";

interface FileUploadProps {
  onContentChange: (hasContent: boolean) => void;
  disabled: boolean;
}

export function FileUpload({ onContentChange, disabled }: FileUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const lastFile = event.target.files[event.target.files.length - 1];
        setFile(lastFile);
        onContentChange(true);
      }
    },
    [onContentChange]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    onContentChange(false);
  }, [onContentChange]);

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="font-medium text-gray-600">
              Drop file to Attach, or{" "}
              <span className="text-blue-600 underline">browse</span>
            </span>
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,image/*,video/*,audio/*"
            disabled={disabled}
          />
        </label>
      </div>
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative flex items-center p-2 bg-gray-100 rounded-md"
        >
          <FileIcon className="w-8 h-8 mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {file.name}
          </span>
          <button
            onClick={removeFile}
            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
            disabled={disabled}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
