import { useState, useCallback, useRef, useEffect } from "react";

type MediaType = "audio" | "video";

export function useMediaRecorder(mediaType: MediaType) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(isRecording){
      timerRef.current = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mediaType === "audio" ? { audio: true } : { audio: true, video: true }
      );
      setLiveStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaType === "audio" ? "audio/webm" : "video/webm",
        });
        setRecordedBlob(blob);
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      // console.log("Starting timer:", timerRef.current);
      // timerRef.current = setInterval(() => {
      //   setDuration((prevDuration) => prevDuration + 1);
      // }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, [mediaType]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopLiveStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
  }, []);

  const stopLiveStream = useCallback(() => {
    if (liveStream) {
      liveStream.getTracks().forEach((track) => track.stop());
      setLiveStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setDuration(0);
  }, [liveStream]);

  useEffect(() => {
    return () => {
      stopLiveStream();
    };
  }, [stopLiveStream]);

  return {
    isRecording,
    recordedBlob,
    liveStream,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    stopLiveStream,
  };
}
