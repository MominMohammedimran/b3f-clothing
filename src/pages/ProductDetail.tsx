
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCustomizer from "@/components/ProductCustomizer";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === id);
  
  useEffect(() => {
    if (!product) {
      // If product doesn't exist, redirect to products page
      navigate('/');
    }
  }, [product, navigate]);
  
  if (!product) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen pb-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center mb-6 text-sm">
            <Link
              to="/products"
              className="text-gray-500 hover:text-brand-navy flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Link>
          </nav>
          
          {/* Product Customizer */}
          <ProductCustomizer product={product} />
          
          {/* Product Details */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                {product.description}
              </p>
              
              {/* Additional product information could go here */}
              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-3">Materials & Care</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Premium quality materials for long-lasting wear</li>
                  <li>Machine washable (check product specific care instructions)</li>
                  <li>Designed and printed in the USA</li>
                  <li>Satisfaction guaranteed</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-3">Shipping Information</h3>
                <p className="text-gray-600">
                  Orders typically process within 2-3 business days. Once shipped, delivery times vary based on your location.
                  Standard shipping typically takes 5-7 business days, while express shipping options are available at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ProductDetail;
