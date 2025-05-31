
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from "@/components/ui/button";
import { products as mockProducts } from '@/lib/data';

// This is a placeholder ProductDetails page
const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  
  // Find product from mock data or fetch from API
  // Now using original_price instead of originalPrice
  const productData = {
    id: productId || '1',
    code: 'PROD-001',
    name: 'Example Product',
    description: 'This is an example product with a detailed description. It showcases various features and benefits that users might be interested in.',
    price: 49.99,
    original_price: 59.99,
    discount_percentage: 15,
    image: '/lovable-uploads/main-categorie/shirt-image.png',
    rating: 4.5,
    category: 'shirts',
    tags: ['casual', 'formal', 'cotton'],
    sizes: ['S', 'M', 'L', 'XL'], // Adding sizes to productData
    stock: 25
  };
  
  // Get actual product if it exists in mock data
  const product = mockProducts.find(p => p.id === productId) || productData;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    console.log('Adding to cart:', product.id, 'Quantity:', quantity, 'Size:', selectedSize);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={product.image || '/placeholder.svg'} 
                alt={product.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={`${product.name} view ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Information */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="mb-4">
              <div className="flex items-center">
                {/* Rating stars */}
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} 
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">{product.rating} (24 reviews)</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-2xl font-bold">${product.price}</p>
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center">
                  <p className="text-gray-500 line-through mr-2">${product.original_price}</p>
                  <p className="text-green-600">Save ${(product.original_price - product.price).toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Size Selection */}
            {(product.sizes || []).length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Size</h2>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || []).map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className="w-12 h-12"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Quantity</h2>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="mx-4 w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button variant="outline" className="flex-1">
                Add to Wishlist
              </Button>
            </div>
            
            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>SKU: {product.code}</li>
                <li>Category: {product.category}</li>
                {product.tags && <li>Tags: {product.tags.join(', ')}</li>}
                <li>In Stock: {product.stock} items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
