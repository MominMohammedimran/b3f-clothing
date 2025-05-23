
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PriceRangeFilter from '../components/ui/PriceRangeFilter';
import { products } from '../lib/data';
import { Product } from '../lib/types';
import { Button } from '@/components/ui/button';
import SearchBox from '../components/search/SearchBox';
import CategoryFilter from '../components/search/CategoryFilter';
import ProductGrid from '../components/search/ProductGrid';
import Pagination from '../components/search/Pagination';

type SortOption = 'default' | 'price-low-high' | 'price-high-low';
type FilterCategory = string | null;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const queryParam = queryParams.get('query');
  
  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  
  const minProductPrice = Math.min(...products.map(product => product.price));
  const maxProductPrice = Math.max(...products.map(product => product.price));
  
  const uniqueCategories = [...new Set(products.map(product => product.category))];
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    let filtered = [...products];
    
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    } 
    else if (queryParam && !selectedCategory) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(queryParam.toLowerCase()) ||
        product.category.toLowerCase().includes(queryParam.toLowerCase())
      );
    }
    
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    switch (sortOption) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [categoryParam, queryParam, priceRange, sortOption, selectedCategory]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSelectedCategory(null);
    } else {
      navigate('/search');
      setSelectedCategory(null);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    navigate('/search');
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };
  
  const handleProductClick = (product: Product) => {
    if (product.code.includes('TSHIRT-PRINT') || product.code.includes('MUG-PRINT')) {
      navigate(`/design-tool`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };
  
  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };
  
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };
  
  const closeFilters = () => {
    setIsFilterOpen(false);
    setIsSortOpen(false);
  };
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };
  
  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center mb-4 mt-4 animate-fade-in">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-2xl font-bold">Search</h1>
        </div>
        
        <SearchBox 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
        />
        
        <CategoryFilter 
          categories={uniqueCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryClick}
        />
        
        {(searchQuery || categoryParam || selectedCategory) && (
          <>
            <div className="flex justify-between items-center mb-4 animate-fade-in">
              <div className="relative">
                <button 
                  onClick={() => { 
                    setIsFilterOpen(!isFilterOpen); 
                    setIsSortOpen(false); 
                  }}
                  className={`bg-yellow-300 ${isFilterOpen ? 'text-blue-600' : 'text-black'} px-4 py-2 rounded-md flex items-center`}
                >
                  Filter <ChevronDown size={18} className="ml-1" />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 z-40 w-64 bg-white shadow-xl rounded-lg border border-gray-200 p-4">
                    <div className="mb-2 font-medium">Price Range</div>
                    <PriceRangeFilter
                      minPrice={minProductPrice}
                      maxPrice={maxProductPrice}
                      onChange={handlePriceRangeChange}
                    />
                    <Button 
                      onClick={closeFilters}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply Filter
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => { 
                    setIsSortOpen(!isSortOpen); 
                    setIsFilterOpen(false); 
                  }}
                  className={`bg-yellow-300 ${isSortOpen ? 'text-blue-600' : 'text-black'} px-4 py-2 rounded-md flex items-center`}
                >
                  Sort by <ChevronDown size={18} className="ml-1" />
                </button>
                
                {isSortOpen && (
                  <div className="absolute top-full right-0 mt-2 z-40 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => handleSortChange('default')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'default' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => handleSortChange('price-low-high')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'price-low-high' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => handleSortChange('price-high-low')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'price-high-low' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Price: High to Low
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {(selectedCategory || sortOption !== 'default' || priceRange.min > minProductPrice || priceRange.max < maxProductPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    Category: {selectedCategory}
                    <button 
                      onClick={() => {
                        setSelectedCategory(null);
                        navigate('/search');
                      }}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {sortOption !== 'default' && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    Sort: {sortOption === 'price-low-high' ? 'Price Low to High' : 'Price High to Low'}
                    <button 
                      onClick={() => setSortOption('default')}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                {(priceRange.min > minProductPrice || priceRange.max < maxProductPrice) && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    Price: Rs.{priceRange.min} - Rs.{priceRange.max}
                    <button 
                      onClick={() => setPriceRange({ min: minProductPrice, max: maxProductPrice })}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setSelectedCategory(null);
                    setSortOption('default');
                    setPriceRange({ min: minProductPrice, max: maxProductPrice });
                    setSearchQuery('');
                    navigate('/search');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
            
            <ProductGrid 
              products={currentProducts}
              onProductClick={handleProductClick}
            />
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
