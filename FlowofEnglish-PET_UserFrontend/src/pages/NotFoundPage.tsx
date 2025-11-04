"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-6 py-10 text-center">
      {/* 404 Animation */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-[8rem] sm:text-[10rem] font-extrabold text-gray-800 tracking-tight"
      >
        404
      </motion.h1>

      {/* Underline animation */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="h-1 bg-blue-500 rounded-full mx-auto mb-8"
      />

      {/* Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showText ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-3 text-gray-800">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          It looks like this page has been moved, deleted, or never existed.
        </p>

        {/* Back button */}
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </motion.div>

      {/* Floating Question Mark */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="mt-12 text-7xl font-bold text-blue-400 select-none"
      >
        ?
      </motion.div>

      {/* Breadcrumb */}
      <div className="mt-10 text-sm text-gray-500 flex items-center justify-center gap-1">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <span>/</span>
        <span>Page Not Found</span>
      </div>
    </div>
  );
}