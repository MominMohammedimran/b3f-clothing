
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductDetailsContent from '../components/products/details/ProductDetailsContent';
import RelatedProducts from '../components/products/RelatedProducts';
import { supabase } from '../integrations/supabase/client';
import { Product, ProductVariant } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          const transformedProduct: Product = {
            id: data.id,
            productId: data.productId,
            code: data.code || `PROD-${(data.id || '').slice(0, 8)}`,
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
              ? data.variants
                  .filter((v: any) =>
                    typeof v === 'object' &&
                    typeof v.size === 'string' &&
                    (typeof v.stock === 'string' || typeof v.stock === 'number')
                  )
                  .map((v: any) => ({
                    size: v.size,
                    stock: Number(v.stock ?? 0)
                  }) as ProductVariant)
              : [],
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
  }, [productId]);

  console.log(product)

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
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
            <Link to="/" className="mr-2">
              <ArrowLeft size={24} className="back-arrow" />
            </Link>
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center mb-4">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-2xl font-bold text-green-600">
            {product.name || 'Product Details'}
          </h1>
        </div>

        <ProductDetailsContent product={product} />

        <RelatedProducts
          product={product}
          onProductClick={(product) => navigate(`/product/details/${product.id}`)}
        />
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
