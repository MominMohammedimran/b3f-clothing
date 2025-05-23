
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../layout/Layout';
import { Product } from '../../lib/types';
import { products } from '../../lib/data';
import ProductDetailsContent from './details/ProductDetailsContent';

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    if (!productId) return;
    
    // Always load product from mock data for now
    const foundProduct = products.find((p) => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Provide a default product if none found
      const defaultProduct = {
        id: productId || "default-product",
        code: "SAMPLE-001",
        name: "Sample Product",
        description: "This is a sample product description.",
        price: 99.99,
        originalPrice: 129.99,
        discountPercentage: 20,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500",
        rating: 4.5,
        category: "Sample Category",
        tags: ["featured", "new"],
        stock: 15
      };
      
      setProduct(defaultProduct);
    }
  }, [productId, navigate]);

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
            <p className="text-gray-500">Product details are not available.</p>
          </div>
        )}

        {product && <RelatedProducts product={product} onProductClick={(product) => navigate(`/product/details/${product.id}`)} />}
      </div>
    </Layout>
  );
};

// Add the import here to fix the reference issue
import WishlistButton from './WishlistButton';
import RelatedProducts from './RelatedProducts';

export default ProductDetailsPage;
