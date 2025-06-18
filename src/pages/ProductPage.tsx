
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant } from '@/lib/types';
import { toast } from 'sonner';
import ProductImage from '@/components/products/ProductImage';
import ProductDetails from '@/components/products/ProductDetails';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Parse JSONB fields with proper type casting
          const parsedProduct: Product = {
            id: data.id,
            code: data.code,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price,
            discountPercentage: data.discount_percentage,
            image: data.image || '',
            category: data.category,
            // Parse JSON arrays properly ensuring they're string arrays
            sizes: Array.isArray(data.sizes) ? data.sizes : 
                  (typeof data.sizes === 'string' ? JSON.parse(data.sizes) : []),
            tags: Array.isArray(data.tags) ? data.tags : 
                 (typeof data.tags === 'string' ? JSON.parse(data.tags) : []),
            // Fix the images type issue
            images: Array.isArray(data.images) ? data.images : 
                   (typeof data.images === 'string' ? JSON.parse(data.images) : []),
            stock: data.stock || 0,
            // Handle variants properly
            variants: Array.isArray(data.variants) 
              ? data.variants.filter((v: any) => 
                  typeof v === 'object' && v && 
                  typeof v.size === 'string' && 
                  typeof v.stock === 'number'
                ).map((v: any) => ({
                  size: v.size as string,
                  stock: v.stock as number
                } as ProductVariant))
              : []
          };
          
          setProduct(parsedProduct);
        }
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-8 mt-10">
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
        <div className="container-custom py-8 mt-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Product not found</h2>
            <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom px-18 py-5 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImage 
            image={product.image} 
            name={product.name} 
            additionalImages={product.images}
          />
          
          <ProductDetails 
            product={product} 
            allowMultipleSizes={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
