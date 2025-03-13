"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Download, FileText, X } from "lucide-react";

interface AssignmentStatusProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    status: "not_corrected" | "corrected";
    submittedFile: {
      name: string;
      downloadUrl: string;
    };
    correctedFile?: {
      name: string;
      downloadUrl: string;
    };
    score?: number;
    remarks?: string;
  };
  subconceptMaxscore: number;
}

export default function AssignmentStatusModal({
  isOpen,
  onClose,
  assignment,
  subconceptMaxscore,
}: AssignmentStatusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const determineFileExtension = async (blob: Blob): Promise<string> => {
    // Read the blob as an ArrayBuffer
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for WebM file header: 0x1A 0x45 0xDF 0xA3
    if (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    ) {
      return ".webm";
    }

    // Add more file signature checks here as needed.

    return ""; // Default: no extension found
  };

  const handleDownload = async (fullEndpoint: string) => {
    try {
      // const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      // Remove everything before and including "/api/v1/" from the endpoint
      const strippedEndpoint = fullEndpoint.replace(/^.*\/api\/v1\//, "");
      const fullUrl = `${API_BASE_URL}/${strippedEndpoint}`;
      console.log("Downloading file from:", fullUrl);

      const response = await fetch(fullUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Failed to fetch file. Status: ${response.status}`);
      }

      // Log the server provided content type
      let contentType = response.headers.get("Content-Type");
      console.log("Content-Type:", contentType);

      // Retrieve the file as a blob
      const blob = await response.blob();
      console.log("Blob size:", blob.size);
      console.log("Blob type:", blob.type);

      // Attempt to extract a filename from the URL or Content-Disposition header
      let filename = strippedEndpoint.split("/").pop() || "downloaded-file";
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // If filename does not have an extension, try to infer it from the file's binary data.
      if (!filename.includes(".")) {
        const ext = await determineFileExtension(blob);
        filename += ext || "";
      }
      console.log("Final filename:", filename);

      // Create a blob URL and trigger a download
      const fileURL = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999999999] flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-none shadow-lg rounded-[8px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-[#d8f3d0] rounded-t-[8px]">
                <CardTitle className="text-xl font-bold text-[#2d5d3d]">
                  Assignment Status
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-[#c5e8bc]"
                >
                  <X className="w-5 h-5 text-[#2d5d3d]" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* File Information */}
                  <div className="p-4 border rounded-[8px] bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm text-slate-500">
                          Submitted File
                        </p>
                        <p className="font-semibold truncate max-w-[250px]">
                          {assignment.submittedFile.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="flex items-center gap-2 mt-2">
                    {assignment.status === "not_corrected" ? (
                      <>
                        <Badge
                          variant="outline"
                          className="px-3 py-1 bg-amber-50 text-amber-600 border-amber-200"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting for Review
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Badge
                          variant="outline"
                          className="px-3 py-1 bg-green-50 text-green-600 border-green-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Score and Remarks (if corrected) */}
                  {assignment.status === "corrected" &&
                    assignment.score !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mt-4 border rounded-[8px] bg-slate-50"
                      >
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-500">
                            Score
                          </p>
                          <p className="text-2xl font-bold text-[#2d5d3d]">
                            {assignment.score}/{subconceptMaxscore}
                          </p>
                        </div>
                        {assignment.remarks && (
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Remarks
                            </p>
                            <p className="text-sm text-slate-700">
                              {assignment.remarks}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                  {/* Corrected File (if available) */}
                  {assignment.status === "corrected" &&
                    assignment.correctedFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 border rounded-[8px] bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="font-medium text-sm text-slate-500">
                              Corrected File
                            </p>
                            <p className="font-semibold truncate max-w-[250px]">
                              {assignment.correctedFile.name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
                <Button
                  className="w-full bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-[5px]"
                  onClick={() =>
                    handleDownload(assignment.submittedFile.downloadUrl)
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Submission
                </Button>

                {assignment.status === "corrected" &&
                  assignment.correctedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-[#00a86b] text-[#00a86b] hover:bg-[#e6f7f0]"
                        onClick={() =>
                          handleDownload(assignment.correctedFile!.downloadUrl)
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Corrected File
                      </Button>
                    </motion.div>
                  )}
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
