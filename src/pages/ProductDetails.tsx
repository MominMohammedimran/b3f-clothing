
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { products } from '../lib/data';
import { Product } from '../lib/types';
import ProductDetailsPage from '../components/products/ProductDetailsPage';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (productId) {
      // Try to find product in mock data
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        // Provide fallback product data
        const fallbackProduct: Product = {
          id: productId,
          code: `PROD-${productId.substring(0, 5)}`,
          name: "Sample Product",
          description: "This is a sample product description. This product demonstrates the user interface when a real product isn't found.",
          price: 99.99,
          originalPrice: 129.99,
          discountPercentage: 23,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500",
          rating: 4.5,
          category: "Sample",
          tags: ["featured"],
          stock: 10
        };
        setProduct(fallbackProduct);
      }
    }
  }, [productId]);

  if (!product) {
    // Show basic content while loading instead of a loader
    return (
      <Layout>
        <div className="container mx-auto px-4 py-5 mt-10">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold">Product Details</h1>
            <div className="mt-4">Loading product information...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return <ProductDetailsPage />;
};

export default ProductDetails;
