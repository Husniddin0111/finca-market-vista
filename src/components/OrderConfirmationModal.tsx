
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransformedCoffeeRecord } from '../services/airtableService';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TransformedCoffeeRecord;
}

const OrderConfirmationModal = ({ isOpen, onClose, product }: OrderConfirmationModalProps) => {
  const [selectedWeight, setSelectedWeight] = useState('100');

  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log(`Ordering ${selectedWeight}g sample of ${product.variety}`);
    // Here you would typically send the order to your backend
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order confirmation</h2>
        
        <p className="text-gray-600 text-center mb-8">
          You're about to order a sample. Please review the details<br />
          below and click Confirm to proceed.
        </p>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Variety</h3>
              <p className="text-gray-900">{product.variety}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Process</h3>
              <p className="text-gray-900">{product.process}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">SCAA</h3>
              <p className="text-gray-900">{product.scaa}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Samples</h3>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 grams OR 250 grams</SelectItem>
                  <SelectItem value="250">250 grams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
