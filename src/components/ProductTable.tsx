
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ProductTable = ({ data, onAddToCart, sortBy, setSortBy }) => {
  const handleSort = (column) => {
    const isAsc = sortBy === `${column}-asc`;
    setSortBy(isAsc ? `${column}-desc` : `${column}-asc`);
  };

  const getSortIcon = (column) => {
    if (sortBy === `${column}-asc`) return <ArrowUp className="h-4 w-4" />;
    if (sortBy === `${column}-desc`) return <ArrowDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Supplier</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Farm</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Variety</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Flavors</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Origin</th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stock KG</span>
                  {getSortIcon('stock')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('scaa')}
              >
                <div className="flex items-center space-x-1">
                  <span>SCAA</span>
                  {getSortIcon('scaa')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  {getSortIcon('price')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{item.supplier}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.farm}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.variety}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.flavors}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.origin}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.stockKg.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.scaa}</td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">${item.price}</td>
                <td className="px-6 py-4">
                  <Button 
                    onClick={() => onAddToCart(item)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
                  >
                    Add
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{item.farm}</h3>
                <p className="text-sm text-gray-600">{item.supplier}</p>
              </div>
              <span className="text-lg font-bold text-green-600">${item.price}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Variety:</span> {item.variety}</div>
              <div><span className="font-medium">Origin:</span> {item.origin}</div>
              <div><span className="font-medium">Stock:</span> {item.stockKg.toLocaleString()} KG</div>
              <div><span className="font-medium">SCAA:</span> {item.scaa}</div>
              <div><span className="font-medium">Flavors:</span> {item.flavors}</div>
            </div>
            
            <Button 
              onClick={() => onAddToCart(item)}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
            >
              Add to Cart
            </Button>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
