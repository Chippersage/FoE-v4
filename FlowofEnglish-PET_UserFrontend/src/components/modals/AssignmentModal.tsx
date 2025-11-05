// @ts-nocheck
import React from "react";

interface AssignmentModalProps {
  onClose: () => void;
  submissionDate?: string | number;
  status?: string;
  fileUrl?: string;
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
}) => {
  const prettyStatus = formatStatus(status);
  const prettyDate = formatSubmissionDate(submissionDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">
          Assignment Details
        </h2>

        <div className="space-y-3 text-gray-700">
          <p>
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
          </p>

          <p>
            <span className="font-semibold">Submission Date:</span>{" "}
            {prettyDate ?? "N/A"}
          </p>

          {fileUrl && (
            <p>
              <span className="font-semibold">File:</span>{" "}
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

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
