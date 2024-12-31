import { useState, useCallback } from "react";

export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setFiles((prevFiles) => [
          ...prevFiles,
          ...Array.from(event.target.files!),
        ]);
      }
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  return { files, handleFileUpload, removeFile };
}
