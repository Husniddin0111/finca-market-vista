
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';
import AirtableConfig from '../components/AirtableConfig';
import { useAirtableData } from '../hooks/useAirtableData';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Airtable configuration
  const [baseId, setBaseId] = useState(localStorage.getItem('airtable_base_id') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('airtable_api_key') || '');
  const [isConfigured, setIsConfigured] = useState(false);

  const {
    records,
    loading,
    error,
    currentPage,
    hasNextPage,
    goToPage,
    goToNextPage,
    goToPrevPage
  } = useAirtableData(baseId, apiKey);

  useEffect(() => {
    setIsConfigured(!!(baseId && apiKey));
  }, [baseId, apiKey]);

  const handleConfigSave = (newBaseId: string, newApiKey: string) => {
    setBaseId(newBaseId);
    setApiKey(newApiKey);
    setIsConfigured(true);
  };

  // Filter and search logic
  const filteredData = records.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesOrigin = selectedOrigin === '' || selectedOrigin === 'all' || item.origin.includes(selectedOrigin);
    const matchesVariety = selectedVariety === '' || selectedVariety === 'all' || item.variety === selectedVariety;
    
    return matchesSearch && matchesPrice && matchesOrigin && matchesVariety;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'stock-asc') return a.stockKg - b.stockKg;
    if (sortBy === 'stock-desc') return b.stockKg - a.stockKg;
    if (sortBy === 'scaa-asc') return a.scaa - b.scaa;
    if (sortBy === 'scaa-desc') return b.scaa - a.scaa;
    return 0;
  });

  const handleAddToCart = (product: any) => {
    toast({
      title: "Added to Cart",
      description: `${product.farm} ${product.variety} has been added to your cart.`,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('');
    setSelectedOrigin('');
    setSelectedVariety('');
    setPriceRange([0, 100]);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AirtableConfig onConfigSave={handleConfigSave} isConfigured={isConfigured} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        selectedVariety={selectedVariety}
        setSelectedVariety={setSelectedVariety}
        resetFilters={resetFilters}
        coffeeData={records}
      />

      <main className="container mx-auto px-4 py-8">
        <AirtableConfig onConfigSave={handleConfigSave} isConfigured={isConfigured} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading data from Airtable...</p>
          </div>
        ) : (
          <>
            <ProductTable 
              data={sortedData}
              onAddToCart={handleAddToCart}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="text-gray-700">
                Page {currentPage}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500">
          2025 © Finca Market. All rights reserved
        </div>
      </footer>
    </div>
  );
};

export default Index;
