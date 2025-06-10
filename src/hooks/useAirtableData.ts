
import { useState, useEffect } from 'react';
import { AirtableService, AirtableRecord } from '../services/airtableService';

export interface TransformedRecord {
  id: string;
  supplier: string;
  farm: string;
  variety: string;
  flavors: string;
  origin: string;
  stockKg: number;
  scaa: number;
  price: number;
}

export const useAirtableData = () => {
  const [records, setRecords] = useState<TransformedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [offsets, setOffsets] = useState<string[]>(['']);
  
  const pageSize = 10;
  const airtableService = new AirtableService();

  const fetchData = async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = offsets[pageIndex - 1];
      const response = await airtableService.fetchRecords(offset === '' ? undefined : offset, pageSize);
      
      const transformedRecords = response.records.map(record => 
        airtableService.transformRecord(record)
      );
      
      setRecords(transformedRecords);
      setHasNextPage(!!response.offset);
      
      // Store the next offset if it exists
      if (response.offset && !offsets.includes(response.offset)) {
        setOffsets(prev => [...prev.slice(0, pageIndex), response.offset || '']);
      }
      
    } catch (err) {
      setError('Failed to fetch data from Airtable');
      console.error('Airtable fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    records,
    loading,
    error,
    currentPage,
    hasNextPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch: () => fetchData(currentPage)
  };
};
