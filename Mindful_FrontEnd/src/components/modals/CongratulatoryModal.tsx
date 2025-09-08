// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, CheckCircle, GraduationCap, Trophy } from "lucide-react";
import { generateCertificate } from "../CertificateGenerator";
import { useUserContext } from "@/context/AuthContext";

interface KidFriendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageName?: string;
  programName?: string;
  congratsType: "programCompletion" | "stageCompletion";
}

const KidFriendlyModal: React.FC<KidFriendlyModalProps> = ({
  isOpen,
  onClose,
  stageName = "",
  programName = "",
  congratsType,
}) => {
  const { user, selectedCohortWithProgram } = useUserContext();

  // Professional content for each congratulatory type
  const getCongratsContent = () => {
    if (congratsType === "programCompletion") {
      return {
        icon: (
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
        ),
        heading: "Program Completed Successfully",
        message: `Congratulations on completing the ${programName ? programName : "learning program"}. Your dedication and commitment to professional development are commendable.`,
        buttonText: "Download Certificate",
        subMessage: "You have successfully achieved all learning objectives and milestones.",
      };
    } else {
      return {
        icon: (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
        ),
        heading: "Module Completed Successfully",
        message: `Excellent progress! You have successfully completed ${stageName ? stageName : "this learning module"}.`,
        buttonText: "Continue Learning",
        subMessage: "Your consistent effort and engagement demonstrate strong commitment to your educational journey.",
      };
    }
  };

  const { icon, heading, message, buttonText, subMessage } = getCongratsContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 text-center border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-slate-900 mb-4"
            >
              {heading}
            </motion.h2>

            {/* Main Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 mb-4 leading-relaxed"
            >
              {message}
            </motion.p>

            {/* Sub Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-500 mb-6 leading-relaxed"
            >
              {subMessage}
            </motion.p>

            {/* Achievement Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100"
            >
              <div className="flex items-center justify-center space-x-2 text-slate-700">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">
                  {congratsType === "programCompletion" ? "Program Achievement Unlocked" : "Module Milestone Reached"}
                </span>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-sm ${
                congratsType === "programCompletion"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() => {
                if (congratsType === "programCompletion") {
                  generateCertificate({
                    userName: user?.userName || "",
                    programName: selectedCohortWithProgram?.program?.programName || "",
                    cohortStartDate: selectedCohortWithProgram?.cohortStartDate || "",
                    cohortEndDate: selectedCohortWithProgram?.cohortEndDate || "",
                  });
                }
                onClose();
              }}
            >
              {buttonText}
            </motion.button>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-50 -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-100 to-transparent rounded-full opacity-50 translate-y-12 -translate-x-12" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KidFriendlyModal;
