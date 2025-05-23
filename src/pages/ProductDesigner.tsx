
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductSelector from '../components/design/ProductSelector';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { getProductInventory } from '@/utils/productInventory';

const ProductDesigner = () => {
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({
    tshirt: { S: 0, M: 0, L: 0, XL: 0 },
    mug: { Standard: 0 },
    cap: { Standard: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('tshirt');
  
  // Sample product for the Place Order button
  const sampleProduct: Product = {
    id: "custom-design-product",
    code: "CUSTOM-001",
    name: "Custom Design Product",
    description: "Your custom designed product",
    price: 149.99,
    originalPrice: 199.99,
    discountPercentage: 25,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500",
    rating: 5,
    category: "Custom",
    tags: ["custom", "featured"],
    stock: 10
  };
  
  // Fetch inventory data when component mounts
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const data = await getProductInventory();
        setInventory(data);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
        toast.error('Failed to load product availability data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  // Handle product type change
  const handleProductChange = (productType: string) => {
    setSelectedProduct(productType);
    setSelectedSize(''); // Reset size when product changes
  };
  
  // Handle size change
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };
  
  const handlePlaceOrder = () => {
    if (!selectedSize) {
      toast.error('Please select a size before placing your order');
      return;
    }
    
    const availableStock = inventory[selectedProduct]?.[selectedSize] || 0;
    
    if (availableStock <= 0) {
      toast.error(`Sorry, this item is out of stock in size ${selectedSize}`);
      return;
    }
    
    // This would typically get the current design and add it to the order
    toast.info("Your custom design will be prepared for ordering");
    // Navigate to checkout with the custom product
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-24 mt-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-3">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-1" size={20} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Design Your Product</h1>
          <div className="w-20"></div> {/* Empty div for flex balance */}
        </div>
        
        <div className="bg-gradient-to-b from-gray-50 to-blue-50 rounded-xl p-6 mb-8 shadow-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Select Your Product</h2>
            <p className="text-gray-600">
              Choose a product to customize with your own designs
            </p>
          </div>
          
          <ProductSelector 
            onProductChange={handleProductChange}
            onSizeChange={handleSizeChange}
            selectedProduct={selectedProduct}
            selectedSize={selectedSize}
            inventory={inventory}
            isLoading={isLoading}
          />
          
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline">
              Add to Cart
            </Button>
            <Button 
              onClick={handlePlaceOrder}
              disabled={!selectedSize || (inventory[selectedProduct]?.[selectedSize] || 0) <= 0}
            >
              Place Order
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Why Custom Products?</h3>
            <p className="mb-4 text-gray-600">
              Express your unique style with personalized products designed by you.
              Perfect for gifts, events, or building your brand.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 text-xl">1</span>
                </div>
                <span className="text-sm text-gray-700 text-center">Choose Product</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 text-xl">2</span>
                </div>
                <span className="text-sm text-gray-700 text-center">Add Your Design</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 text-xl">3</span>
                </div>
                <span className="text-sm text-gray-700 text-center">Place Order</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDesigner;
