// @ts-nocheck
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Square, Play, Pause, RotateCcw } from "lucide-react";

interface VideoRecorderProps {
  onRecordingStart: (stream: MediaStream) => void;
  onRecordingStop: (blob: Blob, type: "audio" | "video") => void; // ✅ Accepts blob & type
  onRecordingStateChange: (state: "recording" | "paused" | "stopped") => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  onRecordingStateChange,
}) => {
  const [recordingState, setRecordingState] = useState<
    "recording" | "paused" | "stopped"
  >("stopped");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) =>
        chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        // Here you can handle the recorded video blob (e.g., upload it or play it back)
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
      onRecordingStart(stream);
      onRecordingStateChange("recording");
    } catch (error) {
      console.error("Error starting video recording:", error);
    }
  };

  const restartRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setRecordingState("stopped");
      // onRecordingStop();
      onRecordingStateChange("stopped");
    }

    chunksRef.current = [];
    startRecording();
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setRecordingState("stopped");
      // onRecordingStop();
      onRecordingStateChange("stopped");

       mediaRecorderRef.current.onstop = () => {
         const blob = new Blob(chunksRef.current, { type: "video/webm" });
         onRecordingStop(blob, "video"); // Pass recorded video to parent
       };
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      onRecordingStateChange("paused");
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      onRecordingStateChange("recording");
    }
  };

  // const restartRecording = () => {
  //   stopRecording();
  //   chunksRef.current = [];
  //   startRecording();
  // };

  return (
    <div className="fixed bottom-20 left-4 right-4 flex justify-center space-x-4">
      {recordingState === "recording" && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={pauseRecording}
          className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center"
        >
          <Pause size={24} />
        </motion.button>
      )}
      {recordingState === "paused" && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={resumeRecording}
          className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center"
        >
          <Play size={24} />
        </motion.button>
      )}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={stopRecording}
        className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center"
      >
        <Square size={24} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={restartRecording}
        className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center"
      >
        <RotateCcw size={24} />
      </motion.button>
    </div>
  );
};
