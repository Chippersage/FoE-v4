import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
}

const AssignmentImageAnswerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentUrl,
}) => {
  if (!isOpen) return null;

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
          Check the Answer
        </h2>

        <div className="w-full h-[75vh]">
          <iframe
            src={documentUrl}
            title="PDF Viewer"
            className="w-full h-full rounded-lg border"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentImageAnswerModal;
