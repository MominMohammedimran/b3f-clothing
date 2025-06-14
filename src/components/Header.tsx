
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/products';

const Header = () => {
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-brand-navy">PrintDemand</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-brand-navy transition-colors">
              Home
            </Link>
            <Link to="/" className="text-gray-600 hover:text-brand-navy transition-colors">
              All Products
            </Link>
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-gray-600 hover:text-brand-navy transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Cart & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-brand-navy transition-colors" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-coral text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-end p-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center space-y-6 p-8">
            <Link 
              to="/" 
              className="text-lg font-medium text-gray-600 hover:text-brand-navy transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/" 
              className="text-lg font-medium text-gray-600 hover:text-brand-navy transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-lg font-medium text-gray-600 hover:text-brand-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              to="/cart" 
              className="flex items-center space-x-2 text-lg font-medium text-gray-600 hover:text-brand-navy transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart ({getCartCount()})</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
