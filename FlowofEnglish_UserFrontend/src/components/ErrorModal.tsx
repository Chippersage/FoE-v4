"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
            className="w-full max-w-md"
          >
            <Card className="border-red-200 shadow-lg">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between bg-red-50 text-red-700 rounded-t-lg py-3 px-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                  <CardTitle className="text-base font-semibold">
                    Access Deactivated
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="rounded-full text-red-500 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              {/* Body */}
              <CardContent className="px-6 pt-6 pb-2 text-center">
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
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{contactDetails.fullText.split(" at ")[0]} at:</p>

                      {contactDetails.email && (
                        <p className="flex items-center justify-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <a
                            href={`mailto:${contactDetails.email}`}
                            className="text-blue-600 hover:underline"
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
                            className="text-blue-600 hover:underline"
                          >
                            {contactDetails.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              </CardContent>

              {/* Footer */}
              <CardFooter className="flex justify-center py-4">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
