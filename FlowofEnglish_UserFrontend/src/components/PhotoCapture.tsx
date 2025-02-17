"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, RotateCw, X } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (imageBlob: Blob, type: "photo") => void;
  onClose: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onCapture,
  onClose,
}) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]); // Removed isFrontCamera from dependencies

  const startCamera = async () => {
    setIsLoading(true); // Added loading indicator
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: { facingMode: isFrontCamera ? "user" : "environment" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraReady(false);
    } finally {
      setIsLoading(false); // Added loading indicator
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            onCapture(blob, "photo");
          }
        }, "image/jpeg");
      }
    }
  };

  const toggleCamera = () => {
    setIsFrontCamera((prev) => !prev);
    setIsCameraReady(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg">
        <video ref={videoRef} className="w-full h-auto" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        {isLoading && ( // Added loading indicator
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
            disabled={!isCameraReady}
          >
            <Camera size={32} className="text-black" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleCamera}
            className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <RotateCw size={24} className="text-white" />
          </motion.button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white">
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
