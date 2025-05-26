
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductDetails from '../components/products/ProductDetails';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../lib/types';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const transformedProduct: Product = {
            id: data.id,
            code: data.code || `PROD-${data.id.slice(0, 8)}`,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price || data.price,
            discountPercentage: data.discount_percentage || 0,
            image: data.image || '',
            images: Array.isArray(data.images) ? data.images.filter(img => typeof img === 'string') : [],
            category: data.category || '',
            stock: data.stock || 0,
            sizes: Array.isArray(data.sizes) ? data.sizes.filter(size => typeof size === 'string') : [],
            tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') : []
          };
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <ProductDetails 
          product={product} 
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
        />
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
