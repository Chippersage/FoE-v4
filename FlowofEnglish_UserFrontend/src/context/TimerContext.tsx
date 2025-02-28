// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [formattedElapsedTime, setFormattedElapsedTime] = useState(null);

  // Function to check if the page was refreshed
  const isPageRefresh = () => {
    return window.performance
      .getEntriesByType("navigation")
      .map((nav) => nav.type)
      .includes("reload");
  };

  useEffect(() => {
    const savedStartTime = localStorage.getItem("sessionStartTime");

    if (savedStartTime && isPageRefresh()) {
      // If page was refreshed, continue the session
      setSessionStartTime(parseInt(savedStartTime, 10));
    } else {
      // If it's a new session or tab was closed, start a fresh session
      const newStartTime = Date.now();
      localStorage.setItem("sessionStartTime", newStartTime);
      setSessionStartTime(newStartTime);
    }
  }, []);

  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      setFormattedElapsedTime(formatTime(elapsedSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Detect true browser/tab close (not just refresh)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isPageRefresh()) {
        localStorage.removeItem("sessionStartTime"); // Reset only if not a refresh
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Function to format time into HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const resetSession = () => {
    localStorage.removeItem("sessionStartTime");
    setSessionStartTime(null);
    setFormattedElapsedTime("00:00:00");
  };

  return (
    <SessionContext.Provider value={{ formattedElapsedTime, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
