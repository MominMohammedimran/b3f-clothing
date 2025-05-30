import React, { useState, useEffect } from 'react';
import { useParams,useNavigate ,Link} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductDetails from '../components/products/ProductDetails';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../lib/types';
import { ArrowLeft } from 'lucide-react';
import ProductDetailsContent from '../components/products/details/ProductDetailsContent';
import RelatedProducts from '../components/products/RelatedProducts';
const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
const navigate = useNavigate();
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('productId', productId)
          .single();

        if (error) throw error;

        if (data) {
          const transformedProduct: Product = {
            productId: data.productId,
            code: data.code || `PROD-${(data.productId || '').slice(0, 8)}`,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price || data.price,
            discountPercentage: data.discount_percentage || 0,
            image: data.image || '',
            images: Array.isArray(data.images) ? data.images.filter(img => typeof img === 'string') : [],
            category: data.category || '',
            stock: data.stock || 0,
            id:data.id,
            sizes: Array.isArray(data.sizes) ? data.sizes.filter(size => typeof size === 'string') : [],
            tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') : [],
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
        <div className="flex items-center mb-4 mt-4">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-2xl font-bold text-green-600">{product?.name || 'Product Details'}</h1>
          
          
        </div>

        {product ? (
          <ProductDetailsContent product={product} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
            <p className="text-gray-500">Product details are not available.</p>
          </div>
        )}

        {product && <RelatedProducts product={product} onProductClick={(product) => navigate(`/product/details/${product.id}`)} />}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
