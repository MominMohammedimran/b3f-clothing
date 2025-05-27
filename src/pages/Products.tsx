
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { FilterIcon, X } from "lucide-react";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    // Filter products based on selected filters
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply price filter
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
    
    // Update URL search params for category
    if (selectedCategory) {
      searchParams.set("category", selectedCategory);
    } else {
      searchParams.delete("category");
    }
    setSearchParams(searchParams);
  }, [selectedCategory, priceRange, searchParams, setSearchParams]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleFilterClear = () => {
    setSelectedCategory(null);
    setPriceRange([0, 100]);
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen pb-12">
        {/* Page Header */}
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">Choose a product for your custom design</p>
          </div>
        </div>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden sticky top-16 z-40 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} products
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <FilterIcon className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <ProductFilters
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                  onCategoryChange={handleCategoryChange}
                  onPriceChange={handlePriceChange}
                  onFilterClear={handleFilterClear}
                />
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to find what you're looking for.</p>
                  <Button onClick={handleFilterClear}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Filters Slide-out */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform">
              <div className="h-full overflow-y-auto">
                <ProductFilters
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                  onCategoryChange={handleCategoryChange}
                  onPriceChange={handlePriceChange}
                  onFilterClear={handleFilterClear}
                  className="p-6"
                  isMobile={true}
                  onClose={() => setIsMobileFiltersOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default Products;
