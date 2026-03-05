import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
}

const AssignmentSampleAnswerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentUrl,
}) => {
  if (!isOpen) return null;

  // Check if it is a valid URL (starts with http or https)
  const isUrl = /^https?:\/\//i.test(documentUrl || "");

  // Media type checks (only if it's a URL)
  const isImage =
    isUrl && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(documentUrl);
  const isPdf = isUrl && /\.pdf$/i.test(documentUrl);
  const isVideo =
    isUrl && /\.(mp4|webm|ogg|mov)$/i.test(documentUrl);

  // If not URL → treat as text
  const isText = !isUrl;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl w-[95%] md:w-[80%] lg:w-[60%] p-4 relative ${
          isText ? "max-h-[80vh]" : "max-h-[90vh]"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-medium text-gray-500 hover:text-black text-lg cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">
          Sample Answer
        </h2>

        {/* Content Area */}
        <div
          className={`w-full flex items-center justify-center overflow-auto ${
            isText ? "" : "h-[75vh]"
          }`}
        >
          {isImage ? (
            <img
              src={documentUrl}
              alt="Assignment Answer"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : isPdf ? (
            <iframe
              src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title="PDF Viewer"
              className="w-full h-full rounded-lg border"
            />
          ) : isVideo ? (
            <video
              src={documentUrl}
              controls
              controlsList="nodownload"
              className="max-h-full max-w-full rounded-lg"
            />
          ) : isText ? (
              <div className="text-gray-700 font-normal text-base sm:text-lg md:text-xl whitespace-pre-wrap break-words p-2 overflow-y-auto max-h-[70vh]">
                {documentUrl}
              </div>
          ) : (
            <div className="text-sm text-gray-500 text-center">
              Preview not supported for this file type.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSampleAnswerModal;