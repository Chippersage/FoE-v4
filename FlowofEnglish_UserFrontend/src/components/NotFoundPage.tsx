"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Home, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const [searchValue, setSearchValue] = useState("");
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // Set animation complete after initial animations
    const timer = setTimeout(() => setIsAnimationComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-3xl mx-auto text-center">
        {/* Animated 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="text-9xl font-bold text-primary mb-2 tracking-tighter">
            404
          </h1>

          {/* Animated pencil drawing underline */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-2 bg-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          />
        </motion.div>

        {/* Animated message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4">
            Oops! Lesson not found
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            It seems like this learning material has been moved or doesn't
            exist. Let's help you find your way back to your studies.
          </p>
        </motion.div>

        {/* Animated buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/home">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Animated illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 relative"
        >
          <div className="relative mx-auto w-64 h-64">
            {/* Book stack */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2"
            >
              <div className="w-48 h-12 bg-primary/90 rounded-md mb-1 transform rotate-1" />
              <div className="w-52 h-10 bg-secondary/80 rounded-md mb-1 transform -rotate-2" />
              <div className="w-44 h-14 bg-accent/70 rounded-md transform rotate-3" />
            </motion.div>

            {/* Animated question mark */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute left-1/2 top-10 transform -translate-x-1/2"
            >
              <div className="text-7xl font-bold text-primary/50">?</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Breadcrumb navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimationComplete ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowLeft className="h-3 w-3" />
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Page Not Found</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
