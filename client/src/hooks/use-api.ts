import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

/**
 * Custom hook for fetching data from API endpoints
 * @param fetchFn - Async function that fetches the data
 * @param options - Configuration options
 * @returns Object with data, loading, error states and refetch function
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate !== false,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: errorObj });
      throw errorObj;
    }
  };

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, []);

  return { ...state, refetch: fetchData };
}

/**
 * Hook to handle paginated API responses
 */
export function usePaginatedApi<T>(
  fetchFn: (page: number) => Promise<T[]>,
  pageSize: number = 10
) {
  const [page, setPage] = useState(1);
  const { data: allData, loading, error, refetch } = useApi(
    () => fetchFn(page),
    { immediate: true }
  );

  const displayData = allData?.slice(0, pageSize) || [];
  const hasMore = (allData?.length || 0) > pageSize;

  return {
    data: displayData,
    allData,
    loading,
    error,
    page,
    setPage,
    hasMore,
    refetch,
  };
}
