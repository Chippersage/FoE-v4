"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaRocket, FaGraduationCap } from "react-icons/fa";
import Confetti from "react-confetti";

interface KidFriendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageName: string;
}

const KidFriendlyModal: React.FC<KidFriendlyModalProps> = ({
  isOpen,
  onClose,
  stageName,
}) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfettiActive(true);
      const timer = setTimeout(() => setConfettiActive(false), 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const confettiVariants = {
    initial: { y: -100, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={confettiActive ? 200 : 0}
            recycle={false}
            colors={["#FF69B4", "#00CED1", "#FFD700", "#FF6347", "#00FA9A"]}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="bg-gradient-to-br from-teal-400 to-pink-500 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border-4 border-white relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, rotate: 360 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FaGraduationCap className="text-blue-600 text-7xl mx-auto mb-4" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4 relative z-10"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
            >
              Woohoo! You did it!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-white mb-6 relative z-10"
            >
              You've conquered stage{" "}
              <span className="font-bold underline block">{stageName}!</span>
            </motion.p>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white mb-8 relative z-10"
            >
              Keep up the awesome work, superstar! 🌟
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-xl hover:bg-blue-600 transition duration-300 shadow-lg relative z-10"
              onClick={onClose}
            >
              Let's Go! 🚀
            </motion.button>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={confettiVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: "absolute",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                }}
              >
                {i % 2 === 0 ? (
                  <FaStar className="text-yellow-300" />
                ) : (
                  <FaRocket className="text-blue-500" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KidFriendlyModal;
