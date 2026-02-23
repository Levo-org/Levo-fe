import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 범용 API 호출 훅
 * @param fetcher - API 호출 함수 (AxiosResponse를 반환)
 * @param immediate - 마운트 시 자동 호출 여부 (기본: true)
 */
export function useApi<T>(
  fetcher: () => Promise<{ data: { success: boolean; data: T; message?: string } }>,
  immediate = true,
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || '요청에 실패했습니다');
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || '네트워크 오류가 발생했습니다';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch };
}
