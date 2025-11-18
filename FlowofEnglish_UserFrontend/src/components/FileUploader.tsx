// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  onClose: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();

      const handleCancel = () => {
        console.log("File selection cancelled");
        onClose();
      };

      fileInputRef.current.addEventListener("cancel", handleCancel);

      return () => {
        fileInputRef.current?.removeEventListener("cancel", handleCancel);
      };
    }
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      console.log("No file selected");
      return;
    }

    // Allowed file types
    const allowedTypes = [
      // documents
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      // images
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",

      // audio
      "audio/mpeg", // mp3
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/webm",
      "audio/m4a",

      // video
      "video/mp4",
      "video/quicktime", // mov
      "video/x-msvideo", // avi
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Invalid file type! Allowed: PDF, DOCX, images, audio (mp3, wav, m4a), video (mp4, mov, avi, webm)"
      );
      event.target.value = "";
      return;
    }

    // Size limits
    const maxAudioSize = 10 * 1024 * 1024; // 10 MB
    const maxVideoSize = 50 * 1024 * 1024; // 50 MB
    const maxDefaultSize = 10 * 1024 * 1024; // 10 MB for others

    if (file.type.startsWith("audio/") && file.size > maxAudioSize) {
      alert("Audio limit is 10MB. Please upload a smaller audio file.");
      event.target.value = "";
      return;
    }

    if (file.type.startsWith("video/") && file.size > maxVideoSize) {
      alert("Video limit is 50MB. Please upload a smaller video file.");
      event.target.value = "";
      return;
    }

    if (
      !file.type.startsWith("audio/") &&
      !file.type.startsWith("video/") &&
      file.size > maxDefaultSize
    ) {
      alert("File size limit is 10MB. Please upload a smaller file.");
      event.target.value = "";
      return;
    }

    onUpload(file);
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      accept="
        .pdf, .docx,
        .png, .jpg, .jpeg, .gif,
        .mp3, .wav, .m4a,
        .mp4, .mov, .avi, .webm
      "
      onChange={handleFileChange}
    />
  );
};
