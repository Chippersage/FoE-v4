// @ts-nocheck
import React from "react";

interface AssignmentModalProps {
  onClose: () => void;
  submissionDate?: string | number;
  status?: string;
  fileUrl?: string;
  correctedFile?: {
    fileName?: string;
    downloadUrl?: string;
    fileType?: string;
    fileId?: string;
  };
  correctedDate?: string | number;
  remarks?: string;
  score?: number;
}

const formatStatus = (status?: string) => {
  if (!status) return "Not Submitted";
  const s = status.toLowerCase();
  if (s === "not_corrected") return "Not Corrected";
  if (s === "corrected") return "Corrected";
  // fallback: replace underscores and capitalize words
  return s
    .split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatSubmissionDate = (d?: string | number): string | null => {
  if (d === undefined || d === null || d === "") return null;

  // If it's a number or numeric string, handle seconds / milliseconds / fractional seconds
  const tryNumber = (val: any) => {
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "") {
      const parsed = Number(val);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  };

  const num = tryNumber(d);
  if (num !== null) {
    // if number is very large (>1e12) treat as milliseconds
    // if it's around 1e9 - 1e11 treat as seconds (common)
    let ms = num;
    if (Math.abs(num) < 1e12) {
      // could be seconds (including fractional), convert to ms
      ms = Math.round(num * 1000);
    } else {
      // already ms
      ms = Math.round(num);
    }

    const date = new Date(ms);
    if (!isNaN(date.getTime())) return date.toLocaleString();
    return null;
  }

  // else try parsing as ISO/string date
  try {
    const parsed = Date.parse(String(d));
    if (!isNaN(parsed)) {
      return new Date(parsed).toLocaleString();
    }
  } catch (e) {
    // ignore
  }

  return null;
};

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  onClose,
  submissionDate,
  status,
  fileUrl,
  correctedFile,
  correctedDate,
  remarks,
  score,
}) => {
  const prettyStatus = formatStatus(status);
  const prettyDate = formatSubmissionDate(submissionDate);
  const prettyCorrectedDate = formatSubmissionDate(correctedDate);
  const isCorrected = (status || "").toLowerCase() === "corrected";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">
          Assignment Details
        </h2>

        <div className="space-y-4 text-gray-700">
          {/* Status and Score Row */}
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`font-medium ${
                  (status || "").toLowerCase() === "not_corrected"
                    ? "text-yellow-600"
                    : (status || "").toLowerCase() === "corrected"
                    ? "text-green-600"
                    : "text-gray-800"
                }`}
              >
                {prettyStatus}
              </span>
            </div>
            {score !== undefined && (
              <div className="text-right">
                <span className="font-semibold">Score:</span>{" "}
                <span className="font-medium text-blue-600">{score}</span>
              </div>
            )}
          </div>

          {/* Submission Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
              Submission Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {prettyDate ?? "N/A"}
              </p>
              {fileUrl && (
                <p>
                  <span className="font-medium">File:</span>{" "}
                  <a
                    href={`${fileUrl}?t=${Date.now()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Submitted File
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Correction Details - Only show if corrected */}
          {isCorrected && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-800 mb-2 text-sm uppercase tracking-wide">
                Correction Details
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Corrected:</span>{" "}
                  {prettyCorrectedDate ?? "N/A"}
                </p>
                {correctedFile?.downloadUrl && (
                  <p>
                    <span className="font-medium">Feedback File:</span>{" "}
                    <a
                      href={`${correctedFile.downloadUrl}?t=${Date.now()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline hover:text-green-900"
                    >
                      View Corrected File
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Remarks - Only show if available */}
          {remarks && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm uppercase tracking-wide">
                Remarks
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {remarks}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-medium px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;