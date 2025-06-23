
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ProductImage from '@/components/products/ProductImage';
import ProductDetails from '@/components/products/ProductDetails';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Transform database data to match Product interface
          const transformedProduct: Product = {
            id: data.id,
            code: data.code || `PROD-${data.id.slice(0, 8)}`,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price || undefined,
            discountPercentage: data.discount_percentage || undefined,
            image: Array.isArray(data.images) && data.images.length > 0 ? String(data.images[0]) : (data.image || ''),
            images: Array.isArray(data.images) ? data.images.map(img => String(img)) : [],
            rating: 4.5, // Default rating
            category: data.category || 'uncategorized',
            tags: Array.isArray(data.tags) ? data.tags.map(tag => String(tag)) : [],
            stock: data.stock || 0,
            sizes: Array.isArray(data.sizes) ? data.sizes.map(size => String(size)) : [],
            variants: Array.isArray(data.variants) ? data.variants.map(variant => {
              if (typeof variant === 'object' && variant !== null && 'size' in variant && 'stock' in variant) {
                return {
                  size: String(variant.size || ''),
                  stock: Number(variant.stock || 0)
                };
              }
              return { size: String(variant), stock: 0 };
            }) : []
          };
          
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center items-center h-64">
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
            <h2 className="text-2xl font-bold">Product not found</h2>
            <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
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

export default ProductDetail;
