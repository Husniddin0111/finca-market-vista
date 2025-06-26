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

  // Special debugging for Manabu product
  if (id === 'recaZzHjYaaFT3Lx9') {
    console.log('🔍 MANABU PRODUCT DETAIL DEBUG:');
    console.log('Product data:', product);
    console.log('Product imageUrl:', product?.imageUrl);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-48"></div>
        </div>
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

  // Use the correct image from coffee_type table, fallback to placeholder if not available
  const productImage = product.imageUrl || '/lovable-uploads/e10a1e6f-809e-4bd6-9eed-b9a73629fb0e.png';
  
  console.log('Final productImage being displayed:', productImage);
  
  // Create array with the main product image
  const images = [productImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-script text-purple-600">Finca Market</h1>
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-gray-700 transition-colors"
            >
              Home
            </button>
            <span>›</span>
            <span className="text-gray-900">{product.variety}, {product.process}, {product.scaa}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100">
              <img 
                src={productImage} 
                alt={`${product.variety} coffee beans`}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', productImage);
                  e.currentTarget.src = '/lovable-uploads/e10a1e6f-809e-4bd6-9eed-b9a73629fb0e.png';
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Farm</h3>
                <p className="text-lg text-gray-900 font-medium">{product.farm}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variety</h3>
                <p className="text-lg text-gray-900 font-medium">{product.variety}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">SCAA</h3>
                <p className="text-lg text-gray-900 font-medium">{product.scaa}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Process</h3>
                <p className="text-lg text-gray-900 font-medium">{product.process}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                <p className="text-lg text-gray-900 font-medium">${product.price}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Origin</h3>
                <p className="text-lg text-gray-900 font-medium">{product.origin}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Samples</h3>
                <p className="text-lg text-gray-900 font-medium">100 or 250 gr</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Stock (KG)</h3>
                <p className="text-lg text-gray-900 font-medium">{product.stockKg.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Altitude</h3>
              <p className="text-lg text-gray-900 font-medium">------</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Flavors Notes</h3>
              <p className="text-lg text-gray-900 leading-relaxed">{product.flavorsNotes}</p>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setShowModal(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg font-medium rounded-xl transition-colors"
              >
                Order Sample
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-center py-8 mt-16">
        <p className="text-gray-400 text-sm">2025 © Finca Market. All rights reserved</p>
      </footer>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetail;
