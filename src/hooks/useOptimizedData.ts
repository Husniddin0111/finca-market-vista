
import { useState, useEffect, useCallback } from 'react';
import { AirtableService, TransformedCoffeeRecord } from '../services/airtableService';

interface UseOptimizedDataReturn {
  data: TransformedCoffeeRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const airtableService = new AirtableService();

export const useOptimizedData = (): UseOptimizedDataReturn => {
  const [data, setData] = useState<TransformedCoffeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching optimized data...');
      const startTime = Date.now();
      
      const records = await airtableService.fetchStockRecordsWithLinkedData();
      
      const endTime = Date.now();
      console.log(`✅ Data fetched in ${endTime - startTime}ms`);
      
      setData(records);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};
