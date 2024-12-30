import { useFileUpload } from "../hooks/useFileUpload";
import { motion } from "framer-motion";
import { FileIcon, X } from "lucide-react";

export function FileUpload() {
  const { files, handleFileUpload, removeFile } = useFileUpload();

  return (
    <div>
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-[5px] appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
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
              Drop files to Attach, or{" "}
              <span className="text-blue-600 underline">browse</span>
            </span>
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,image/*,video/*,audio/*"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {files.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative flex items-center p-2 bg-gray-100 rounded-[5px]"
          >
            <FileIcon className="w-8 h-8 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {file.name}
            </span>
            <button
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
