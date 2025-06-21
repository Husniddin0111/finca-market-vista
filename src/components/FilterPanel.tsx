
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterConfig } from '../hooks/useAdvancedTable';

interface FilterPanelProps {
  filters: FilterConfig;
  setFilters: (filters: FilterConfig) => void;
  uniqueValues: {
    varieties: string[];
    processes: string[];
    origins: string[];
  };
  onClose: () => void;
  onReset: () => void;
}

const FilterPanel = ({ filters, setFilters, uniqueValues, onClose, onReset }: FilterPanelProps) => {
  const updateFilter = (key: keyof FilterConfig, value: string | number) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Variety</Label>
          <Select value={filters.variety} onValueChange={(value) => updateFilter('variety', value === 'all' ? '' : value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues.varieties.map(variety => (
                <SelectItem key={variety} value={variety}>{variety}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Process</Label>
          <Select value={filters.process} onValueChange={(value) => updateFilter('process', value === 'all' ? '' : value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues.processes.map(process => (
                <SelectItem key={process} value={process}>{process}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Origin</Label>
          <Select value={filters.origin} onValueChange={(value) => updateFilter('origin', value === 'all' ? '' : value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues.origins.map(origin => (
                <SelectItem key={origin} value={origin}>{origin}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">SCAA Min</Label>
          <Input
            type="number"
            value={filters.scaaMin}
            onChange={(e) => updateFilter('scaaMin', Number(e.target.value))}
            className="mt-1"
            min="0"
            max="100"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">SCAA Max</Label>
          <Input
            type="number"
            value={filters.scaaMax}
            onChange={(e) => updateFilter('scaaMax', Number(e.target.value))}
            className="mt-1"
            min="0"
            max="100"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Price Range</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              type="number"
              value={filters.priceMin}
              onChange={(e) => updateFilter('priceMin', Number(e.target.value))}
              placeholder="Min"
              min="0"
              className="w-20"
            />
            <Input
              type="number"
              value={filters.priceMax}
              onChange={(e) => updateFilter('priceMax', Number(e.target.value))}
              placeholder="Max"
              min="0"
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onReset} size="sm">
          Reset
        </Button>
        <Button variant="outline" onClick={onClose} size="sm">
          Close
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
