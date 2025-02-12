"use client";

import { useEffect, useRef } from "react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  onClose: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();

      // Listen for when the file picker closes (by detecting focus loss)
      const handleFocus = () => {
        setTimeout(() => {
          if (!fileInputRef.current?.files?.length) {
            onClose(); // Reset if no file is selected
          }
        }, 500); // Delay to ensure the dialog has fully closed
      };

      fileInputRef.current.addEventListener("click", handleFocus);

      return () => {
        fileInputRef.current?.removeEventListener("click", handleFocus);
      };
    }
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      onChange={handleFileChange}
    />
  );
};
