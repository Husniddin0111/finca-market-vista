
import { useState } from 'react';
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';
import { useToast } from '../hooks/use-toast';

// Sample coffee data
const coffeeData = [
  {
    id: 1,
    supplier: "John Wick",
    farm: "Sweet & Flowers",
    variety: "Pink Bourbon",
    flavors: "Sweet Chocolate, Honey, Citric, Floral, Fruity",
    origin: "Huila",
    stockKg: 1000,
    scaa: 85,
    price: 5
  },
  {
    id: 2,
    supplier: "James Alen",
    farm: "La Cereza",
    variety: "Pink Bourbon", 
    flavors: "Panela, Chocolate, Cocoa, Beer, Clean",
    origin: "Huila - El Tablon",
    stockKg: 40,
    scaa: 87,
    price: 4
  },
  {
    id: 3,
    supplier: "Robert Richard",
    farm: "La Natura",
    variety: "Geisha",
    flavors: "Honey, Panela, Orange",
    origin: "Huila",
    stockKg: 574,
    scaa: 88,
    price: 5
  },
  {
    id: 4,
    supplier: "Linda Elizabeth",
    farm: "Buena Vista",
    variety: "Pink Bourbon",
    flavors: "Cacao Nibs, Orange, Citrus, Tangerine, Silky, Clean",
    origin: "Huila",
    stockKg: 345,
    scaa: 88,
    price: 5
  },
  {
    id: 5,
    supplier: "Mary Susan",
    farm: "La Miel",
    variety: "Geisha",
    flavors: "Floral, Panela, Floral",
    origin: "Huila",
    stockKg: 1234,
    scaa: 85,
    price: 5
  },
  {
    id: 6,
    supplier: "Sarah Lisa",
    farm: "Juranambu",
    variety: "Pink Bourbon",
    flavors: "Cherry, Honey",
    origin: "Huila - San Agustin",
    stockKg: 1200,
    scaa: 85.5,
    price: 9.8
  },
  {
    id: 7,
    supplier: "Joseph William",
    farm: "La Natura",
    variety: "Wush Wush",
    flavors: "High Acidity, Honey",
    origin: "Huila - El Tablon",
    stockKg: 987,
    scaa: 88,
    price: 50
  },
  {
    id: 8,
    supplier: "Sandra Betty",
    farm: "Juranambu",
    variety: "Caturra",
    flavors: "Clean, Honey",
    origin: "Huila - San Agustin",
    stockKg: 786,
    scaa: 85,
    price: 7
  },
  {
    id: 9,
    supplier: "Steven Andrew",
    farm: "Juranambu",
    variety: "Caturra",
    flavors: "Balanced, Honey, Silky",
    origin: "Huila - El Tablon",
    stockKg: 5000,
    scaa: 86,
    price: 5
  },
  {
    id: 10,
    supplier: "Paul Donna",
    farm: "La Natura",
    variety: "Geisha",
    flavors: "Fruity, Honey, Milky, Delicate Jam, Clean",
    origin: "Huila - San Agustin",
    stockKg: 4044,
    scaa: 89,
    price: 4.5
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Filter and search logic
  const filteredData = coffeeData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesOrigin = selectedOrigin === '' || item.origin.includes(selectedOrigin);
    const matchesVariety = selectedVariety === '' || item.variety === selectedVariety;
    
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

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (product) => {
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
    setCurrentPage(1);
  };

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
        coffeeData={coffeeData}
      />

      <main className="container mx-auto px-4 py-8">
        <ProductTable 
          data={paginatedData}
          onAddToCart={handleAddToCart}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
