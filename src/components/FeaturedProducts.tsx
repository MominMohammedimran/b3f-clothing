
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  // Filter featured products only
  const featuredProducts = products.filter(product => product.featured);
  
  return (
    <section className="section-container">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-3">Featured Products</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our most popular products ready for your creative designs. 
          High-quality materials and printing guarantee that your design will look amazing.
        </p>
      </div>
      
      <div className="product-grid">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Button asChild className="btn-primary">
          <Link to="">
            View All Products
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
