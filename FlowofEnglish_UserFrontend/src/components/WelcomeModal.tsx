"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface WelcomeModalProps {
  userName: string;
  programName: string;
  onClose: () => void;
}

export default function WelcomeModal(
  { userName, programName, onClose }: WelcomeModalProps = {
    userName: "Student",
    programName: "English Learning",
    onClose: () => {},
  }
) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for the exit animation to complete
  };

  //   if (typeof window === "undefined") return null; // Server-side rendering check

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-300`}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-[#5bc3cd] mb-4">
            Welcome to Flow of English &apos;s <br /> {programName}! 🌟
          </h2>
          <div className="space-y-4 text-center">
            <p
              className={`text-lg font-semibold transform transition-all duration-500 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              Hi {userName}! We&apos;re so excited you&apos;re here!
            </p>
            <p
              className={`transform transition-all duration-500 delay-100 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              Get ready to explore, learn new words, and try fun activities to
              become a champion in English! <br /> Let&apos;s Go! 🌈
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleClose}
              className={`w-full bg-[#F67D0A] hover:bg-[#DB5788] text-white font-semibold py-2 px-4 rounded transition-all duration-300 transform ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              Start Exploring!
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
