
import React from 'react';
import { X, Star, ShoppingCart, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product, useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetail = ({ product, isOpen, onClose }: ProductDetailProps) => {
  const { dispatch } = useCart();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', product });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Image Section */}
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl"
                />
                
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="text-3xl font-bold text-blue-600 mb-6">
                    ${product.price}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>2-year warranty included</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                    <span>30-day return policy</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </button>
                    
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Buy Now
                  </button>
                </div>

                {/* Additional Info */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>SKU:</strong> {product.id.toUpperCase()}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Availability:</strong> <span className="text-green-600">In Stock</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
