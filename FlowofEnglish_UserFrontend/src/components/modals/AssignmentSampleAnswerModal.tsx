import { useEffect } from "react";

interface AssignmentSampleAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
}

const AssignmentSampleAnswerModal = ({
  isOpen,
  onClose,
  documentUrl,
}: AssignmentSampleAnswerModalProps) => {

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(documentUrl);
  const isPdf = /\.pdf$/i.test(documentUrl);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3 md:px-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full md:w-[85%] lg:w-[65%] max-h-[92vh] overflow-hidden p-4 md:p-6 relative shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-base md:text-lg font-semibold mb-4 text-center">
          Sample Answer
        </h2>

        {/* Content Area */}
        <div className="w-full flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded-lg">
          
          {isImage ? (
            <img
              src={documentUrl}
              alt="Assignment Answer"
              className="max-h-[75vh] max-w-full object-contain rounded-lg"
            />
          ) : isPdf ? (
            <iframe
              src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title="PDF Viewer"
              className="w-full h-[75vh] rounded-lg border"
            />
          ) : (
            <div className="text-sm text-gray-500 text-center p-6">
              Preview not supported for this file type.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssignmentSampleAnswerModal;
