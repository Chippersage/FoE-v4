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
      // const handleFocus = () => {
      //   setTimeout(() => {
      //     if (!fileInputRef.current?.files?.length) {
      //       onClose(); // Reset if no file is selected
      //     }
      //   }, 500); // Delay to ensure the dialog has fully closed
      // };

      // fileInputRef.current.addEventListener("click", handleFocus);

      // return () => {
      //   fileInputRef.current?.removeEventListener("click", handleFocus);
      // };
    }
  }, [onClose]);

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  
  if (!file) return;

  // Allowed file types
  const allowedTypes = [
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "image/png", 
    "image/jpeg", 
    "image/jpg",
    "image/gif"
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type! Only PDF, DOCX, and image files (PNG, JPG, GIF) are allowed.");
    event.target.value = ""; // Reset input
    return;
  }

  // File size limit
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    alert("File size limit exceeded! Please select a file less than 10MB.");
    event.target.value = ""; // Reset input
    return;
  }

  onUpload(file);
};

  return (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      accept=".pdf, .docx, .png, .jpg, .jpeg, .gif"
      onChange={handleFileChange}
    />
  );
};
