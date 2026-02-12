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

  const isImage = documentUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  const isPdf = documentUrl?.match(/\.pdf$/i);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[95%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-hidden p-4 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center">
          Sample Answer
        </h2>

        <div className="w-full h-[75vh] flex items-center justify-center overflow-auto">
          
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
