"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorResponse {
  error: string;
  deactivationDetails: string;
  contactInfo: string;
}

interface ErrorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  errorModalData?: ErrorResponse;
}

export function ErrorModal({
  isOpen = true,
  onClose,
  errorModalData,
}: ErrorModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const parseContactInfo = (contactInfo: string) => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const phoneRegex = /(\d{10,})/;
    const emailMatch = contactInfo.match(emailRegex);
    const phoneMatch = contactInfo.match(phoneRegex);

    return {
      email: emailMatch?.[1] || null,
      phone: phoneMatch?.[1] || null,
      fullText: contactInfo,
    };
  };

  const data = errorModalData;
  const contactDetails = parseContactInfo(data?.contactInfo || "");

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-red-50 px-5 py-3 border-b border-red-100">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                <h3 className="font-semibold text-base">Access Deactivated</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-red-500 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-lg font-medium text-gray-800 mb-4">
                  {data?.error}
                </p>

                {data?.deactivationDetails && (
                  <div className="bg-gray-50 rounded-md p-3 text-left text-sm text-gray-700 mb-6 border border-gray-200">
                    {data.deactivationDetails}
                  </div>
                )}

                {data?.contactInfo && (
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>{contactDetails.fullText.split(" at ")[0]} at:</p>

                    {contactDetails.email && (
                      <p className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${contactDetails.email}`}
                          className="text-orange-600 hover:underline break-all"
                        >
                          {contactDetails.email}
                        </a>
                      </p>
                    )}

                    {contactDetails.phone && (
                      <p className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${contactDetails.phone}`}
                          className="text-orange-600 hover:underline"
                        >
                          {contactDetails.phone}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex justify-center border-t border-gray-100 p-4">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
