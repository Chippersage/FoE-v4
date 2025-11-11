// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  onClose: () => void;
}

/**
 * FileUploader Component
 * ----------------------
 * - Automatically opens file picker when mounted.
 * - Accepts PDF, DOC, DOCX, image, audio, and video files.
 * - Limits file size to 10MB.
 * - Calls onUpload when a valid file is selected.
 * - Calls onClose if user cancels the file picker.
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!fileInputRef.current) return;

    // Automatically open file picker
    fileInputRef.current.click();

    const handleCancel = () => {
      console.log("File selection cancelled");
      onClose();
    };

    fileInputRef.current.addEventListener("cancel", handleCancel);

    return () => {
      fileInputRef.current?.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    // Allowed file types (documents, images, audio, video)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "audio/mpeg",
      "audio/ogg",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Invalid file type! Only PDF, DOC, DOCX, Image, Audio, and Video files are allowed."
      );
      event.target.value = "";
      return;
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size limit exceeded! Please select a file smaller than 10MB.");
      event.target.value = "";
      return;
    }

    // Pass file to parent handler
    onUpload(file);
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.mp3,.ogg,.mp4,.webm,.mov,.avi"
      onChange={handleFileChange}
    />
  );
};

export default FileUploader;
