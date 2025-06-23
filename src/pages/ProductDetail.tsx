
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdvancedTable } from '../hooks/useAdvancedTable';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useAdvancedTable();
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the product by ID
  const product = data.find(item => item.id === id);

  console.log('Product ID from URL:', id);
  console.log('Available products:', data);
  console.log('Found product:', product);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const images = [
    '/lovable-uploads/e10a1e6f-809e-4bd6-9eed-b9a73629fb0e.png',
    '/lovable-uploads/51981cb7-98fe-4a41-9309-ff14384f1480.png',
    '/lovable-uploads/3a836092-b484-4d42-9c7f-50d341dac042.png'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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

      {/* Breadcrumb */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => navigate('/')}
            className="hover:text-gray-900"
          >
            Home
          </button>
          <span>›</span>
          <span>{product.variety}, {product.process}, {product.scaa}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
              <img 
                src={images[currentImageIndex]} 
                alt="Coffee beans"
                className="w-full h-80 object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Farm</h3>
                <p className="text-lg text-gray-900">{product.farm}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variety</h3>
                <p className="text-lg text-gray-900">{product.variety}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">SCAA</h3>
                <p className="text-lg text-gray-900">{product.scaa}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Process</h3>
                <p className="text-lg text-gray-900">{product.process}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                <p className="text-lg text-gray-900">${product.price}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Origin</h3>
                <p className="text-lg text-gray-900">{product.origin}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Samples</h3>
                <p className="text-lg text-gray-900">100 or 250 gr</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Stock (KG)</h3>
                <p className="text-lg text-gray-900">{product.stockKg.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Altitude</h3>
              <p className="text-lg text-gray-900">------</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Flavors Notes</h3>
              <p className="text-lg text-gray-900">{product.flavorsNotes}</p>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
            >
              Order Sample
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        2025 © Finca Market. All rights reserved
      </footer>

      {/* Order Confirmation Modal with zoom-in animation */}
      <OrderConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetail;
