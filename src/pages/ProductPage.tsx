
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import ProductImage from '@/components/products/ProductImage';
import ProductDetails from '@/components/products/ProductDetails';
import ProductActionButtons from '@/components/products/ProductActionButtons';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
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
            ...data,
            id: data.id,
            code: data.code,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price,
            discountPercentage: data.discount_percentage,
            image: data.image || '',
            rating: data.rating || 0,
            category: data.category,
            // Parse JSON arrays properly ensuring they're string arrays
            sizes: Array.isArray(data.sizes) ? data.sizes : 
                  (typeof data.sizes === 'string' ? JSON.parse(data.sizes) : []),
            tags: Array.isArray(data.tags) ? data.tags : 
                 (typeof data.tags === 'string' ? JSON.parse(data.tags) : []),
            // Fix the images/additionalImages type issue
            additionalImages: Array.isArray(data.images) ? data.images : 
                             (typeof data.images === 'string' ? JSON.parse(data.images) : []),
            images: Array.isArray(data.images) ? data.images : 
                   (typeof data.images === 'string' ? JSON.parse(data.images) : []),
            stock: data.stock || 0
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
      <div className="container-custom px-18 py-5 mt-10" >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImage 
            image={product.image} 
            name={product.name} 
            additionalImages={product.additionalImages}
          />
          
          <div>
            <ProductDetails 
              product={product} 
              selectedSize={selectedSize} 
              setSelectedSize={setSelectedSize}
            />
            
            <ProductActionButtons 
              product={product} 
              selectedSize={selectedSize}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
