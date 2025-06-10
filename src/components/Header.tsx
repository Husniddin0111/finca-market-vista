
import { useState } from 'react';
import { Search, Filter, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Header = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  selectedOrigin,
  setSelectedOrigin,
  selectedVariety,
  setSelectedVariety,
  resetFilters,
  coffeeData
}) => {
  // Get unique values for filter options
  const origins = [...new Set(coffeeData.map(item => item.origin))];
  const varieties = [...new Set(coffeeData.map(item => item.variety))];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Finca Market</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <span>Sort By</span>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('price-asc')}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('price-desc')}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('stock-desc')}>
                  Stock: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('stock-asc')}>
                  Stock: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('scaa-desc')}>
                  SCAA Score: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('scaa-asc')}>
                  SCAA Score: Low to High
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Apply filters to find the perfect coffee for you.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  {/* Origin Filter */}
                  <div>
                    <Label className="text-sm font-medium">Origin</Label>
                    <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Origins</SelectItem>
                        {origins.map(origin => (
                          <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variety Filter */}
                  <div>
                    <Label className="text-sm font-medium">Variety</Label>
                    <Select value={selectedVariety} onValueChange={setSelectedVariety}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select variety" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Varieties</SelectItem>
                        {varieties.map(variety => (
                          <SelectItem key={variety} value={variety}>{variety}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset Filters */}
                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                Register
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
