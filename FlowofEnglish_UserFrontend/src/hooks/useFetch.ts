import { useEffect, useRef, useState, useCallback } from "react";

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export function useFetch<T = unknown>(
  fetcher: () => Promise<T> | null,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    const fn = fetcher();
    if (!fn) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fn;
      if (!mounted.current) return;
      setData(result);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return {
    data,
    isLoading,
    error,
    refresh: execute,
  } as {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
  };
}