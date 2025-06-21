
import React, { useState } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdvancedTable } from '../hooks/useAdvancedTable';
import FilterPanel from './FilterPanel';

const AdvancedTable = () => {
  const [showFilters, setShowFilters] = useState(false);
  const {
    data,
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
    totalItems,
    resetFilters,
    uniqueValues
  } = useAdvancedTable();

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const getStatusButton = (status: string, price: number) => {
    const isRequested = status === 'Sample requested';
    return (
      <Button
        size="sm"
        className={`${
          isRequested 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } text-xs px-3 py-1`}
      >
        {isRequested ? 'Sample requested' : 'Request Samples'}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-script text-purple-600">Finca Market</h1>
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-50 border-gray-200"
            >
              <span>Sort By</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-50 border-gray-200"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          uniqueValues={uniqueValues}
          onClose={() => setShowFilters(false)}
          onReset={resetFilters}
        />
      )}

      {/* Table */}
      <div className="bg-white mx-6 mt-6 rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('variety')}
                >
                  Variety {getSortIcon('variety')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('process')}
                >
                  Process {getSortIcon('process')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('scaa')}
                >
                  SCAA {getSortIcon('scaa')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('origin')}
                >
                  Origin {getSortIcon('origin')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('farm')}
                >
                  Farm {getSortIcon('farm')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Flavors Notes
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stockKg')}
                >
                  Stock KG {getSortIcon('stockKg')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  Price {getSortIcon('price')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  ...
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.variety}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.process}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.scaa}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.origin}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.farm}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.flavorsNotes}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.stockKg.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${item.price}</td>
                  <td className="px-6 py-4">
                    {getStatusButton(item.status, item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1"
          >
            &lt;
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 min-w-[32px] ${
                currentPage === page ? 'bg-gray-900 text-white' : ''
              }`}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1"
          >
            &gt;
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        2025 © Finca Market. All rights reserved
      </footer>
    </div>
  );
};

export default AdvancedTable;
