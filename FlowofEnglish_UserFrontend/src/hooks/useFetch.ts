import { useEffect, useRef, useState, useCallback } from "react";

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export function useFetch<T = unknown>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Abort any ongoing fetch on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async () => {
    if (!fetcher) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Create new abort controller for this fetch
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mounted.current) return;
      setData(result);
    } catch (err: any) {
      if (!mounted.current) return;
      // Don't set error if fetch was aborted (cohort change)
      if (err.name !== 'AbortError') {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [...deps]);

  useEffect(() => {
    execute();
    
    // Cleanup function to abort fetch if deps change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  // Add abort function
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { data, isLoading, error, refresh: execute, abort };
}