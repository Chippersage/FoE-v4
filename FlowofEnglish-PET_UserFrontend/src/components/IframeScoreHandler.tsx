// components/IframeScoreHandler.tsx
import { useEffect, useCallback, useRef } from 'react';
import { useUserAttempt } from '../hooks/useUserAttempt';

interface IframeScoreHandlerProps {
  user: any;
  programId: string | undefined;
  currentContent: any;
  isActive: boolean;
  onScoreSubmitted: () => void;
  onError?: (error: Error) => void;
}

export const IframeScoreHandler = ({
  user,
  programId,
  currentContent,
  isActive,
  onScoreSubmitted,
  onError
}: IframeScoreHandlerProps) => {
  const { recordAttempt } = useUserAttempt();
  const isProcessingRef = useRef(false);

  const handleScoreSubmission = useCallback(async (score: number) => {
    if (isProcessingRef.current) {
      console.log('Already processing score, skipping');
      return;
    }
    
    isProcessingRef.current = true;
    
    try {
      console.log('Submitting iframe score:', score);
      
      await recordAttempt({
        user,
        programId,
        currentContent,
        overrideScore: score
      });
      
      console.log('Score submission successful');
      onScoreSubmitted();
      
    } catch (err) {
      console.error('Failed to submit iframe score:', err);
      onError?.(err as Error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [user, programId, currentContent, recordAttempt, onScoreSubmitted, onError]);

  // Message listener for iframe scores
  useEffect(() => {
    if (!isActive) return;
    
    const handleMessage = (event: MessageEvent) => {
      console.log('IframeScoreHandler received message:', event.data);
      
      let score = null;
      
      // Handle different message formats
      if (event.data?.type === 'scoreData') {
        score = event.data.payload?.userAttemptScore || 
                event.data.payload?.score || 
                event.data.payload?.totalScore || 
                event.data.score;
      }
      else if (typeof event.data === 'object' && typeof event.data.score === 'number') {
        score = event.data.score;
      }
      else if (typeof event.data === 'string' && !isNaN(parseFloat(event.data))) {
        score = parseFloat(event.data);
      }
      
      if (score !== null && typeof score === 'number') {
        console.log('Processing score:', score);
        handleScoreSubmission(score);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isActive, handleScoreSubmission]);

  return null; // No UI
};