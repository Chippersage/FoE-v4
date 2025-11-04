// hooks/useRedirectHandler.ts
import { useState, useEffect } from 'react';

interface UseRedirectHandlerReturn {
  isRedirecting: boolean;
  redirectCountdown: number;
  showManualButton: boolean;
  handleRedirect: (url: string) => void;
  resetRedirect: () => void;
}

export const useRedirectHandler = (): UseRedirectHandlerReturn => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval>;


    if (isRedirecting && redirectCountdown > 0) {
      countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isRedirecting && redirectCountdown === 0) {
      setIsRedirecting(false);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isRedirecting, redirectCountdown]);

  const handleRedirect = (url: string) => {
    setIsRedirecting(true);
    setRedirectCountdown(3);
    setShowManualButton(false);

    // Try to open automatically after countdown
    setTimeout(() => {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked
        setShowManualButton(true);
      }
      setIsRedirecting(false);
    }, 3000);
  };

  const resetRedirect = () => {
    setIsRedirecting(false);
    setRedirectCountdown(3);
    setShowManualButton(false);
  };

  return {
    isRedirecting,
    redirectCountdown,
    showManualButton,
    handleRedirect,
    resetRedirect
  };
};