import { useState, useEffect, useMemo } from 'react';
import { AirtableService, TransformedCoffeeRecord } from '../services/airtableService';

export interface SortConfig {
  key: keyof TransformedCoffeeRecord | null;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  variety: string;
  process: string;
  origin: string;
  scaaMin: number;
  scaaMax: number;
  priceMin: number;
  priceMax: number;
}

export const useAdvancedTable = () => {
  const [records, setRecords] = useState<TransformedCoffeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({
    variety: '',
    process: '',
    origin: '',
    scaaMin: 0,
    scaaMax: 100,
    priceMin: 0,
    priceMax: 50
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const airtableService = new AirtableService();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting data fetch...');
      const transformedRecords = await airtableService.fetchStockRecordsWithLinkedData();
      console.log('Fetched records:', transformedRecords);
      setRecords(transformedRecords);
    } catch (err) {
      setError('Failed to fetch data from Airtable');
      console.error('Airtable fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAndSearchedData = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchTerm === '' || 
        Object.values(record).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilters = 
        (filters.variety === '' || record.variety.toLowerCase().includes(filters.variety.toLowerCase())) &&
        (filters.process === '' || record.process.toLowerCase().includes(filters.process.toLowerCase())) &&
        (filters.origin === '' || record.origin.toLowerCase().includes(filters.origin.toLowerCase())) &&
        record.scaa >= filters.scaaMin &&
        record.scaa <= filters.scaaMax &&
        record.price >= filters.priceMin &&
        record.price <= filters.priceMax;
      
      return matchesSearch && matchesFilters;
    });
  }, [records, searchTerm, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredAndSearchedData;

    return [...filteredAndSearchedData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [filteredAndSearchedData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: keyof TransformedCoffeeRecord) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setFilters({
      variety: '',
      process: '',
      origin: '',
      scaaMin: 0,
      scaaMax: 100,
      priceMin: 0,
      priceMax: 50
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const uniqueValues = useMemo(() => ({
    varieties: [...new Set(records.map(r => r.variety).filter(Boolean))],
    processes: [...new Set(records.map(r => r.process).filter(Boolean))],
    origins: [...new Set(records.map(r => r.origin).filter(Boolean))]
  }), [records]);

  return {
    data: paginatedData,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: sortedData.length,
    resetFilters,
    uniqueValues,
    refetch: fetchData
  };
};
