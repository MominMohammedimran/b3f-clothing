
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!productId) {
          console.warn('No productId provided');
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        // Transform database product to match Product interface
        const transformedProduct: Product = {
          id: data.id,
          code: data.code || '',
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
          tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') : [],
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

        setProduct(transformedProduct);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const seoData = useSEO({
    title: product ? `${product.name} - Custom Design` : 'Product Details',
    description: product ? `Customize ${product.name} with our design tool. ${product.description}` : 'View product details and start customizing',
    image: product?.image,
    type: 'product',
    keywords: product ? `${product.name}, custom ${product.category}, personalized ${product.category}` : undefined
  });

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-8 mt-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div>
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
              <div className="text-xl font-semibold">₹{product.price}</div>

              {/* Add to Cart Button */}
              <Button className="w-full">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              {/* Design Now Button */}
              <Button className="w-full" variant="secondary">
                <a href={`/design-tool/${product.code}`} className="block w-full text-center">
                  Design Now
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Product not found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;
