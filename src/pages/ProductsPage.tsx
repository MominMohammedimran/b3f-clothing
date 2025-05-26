
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../lib/types';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformedProducts: Product[] = data?.map(item => ({
        id: item.id,
        code: item.code || `PROD-${item.id.slice(0, 8)}`,
        name: item.name,
        description: item.description || '',
        price: item.price,
        originalPrice: item.original_price || item.price,
        discountPercentage: item.discount_percentage || 0,
        image: item.image || '',
        images: Array.isArray(item.images) ? item.images.filter(img => typeof img === 'string') : [],
        category: item.category || '',
        stock: item.stock || 0,
        sizes: Array.isArray(item.sizes) ? item.sizes.filter(size => typeof size === 'string') : [],
        tags: Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : []
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <ProductFilters 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </aside>
          <main className="flex-1">
            <ProductGrid products={products} loading={loading} />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
