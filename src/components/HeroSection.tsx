
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative bg-brand-navy text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Create <span className="text-brand-coral">Custom</span> Products
              <br />
              <span className="text-brand-lightBlue">Your Design</span>, Our Quality
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-lg">
              Upload your designs and we'll print them on premium products.
              No minimum orders, fast shipping, and satisfaction guaranteed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-brand-coral hover:bg-opacity-90">
                <Link to="/">
                  Start Shopping
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-brand-navy">
                <Link to="#how-it-works">
                  How It Works
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] flex items-center justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-brand-lightBlue rounded-full opacity-50 absolute -right-20 -top-20"></div>
            <div className="w-full h-full relative z-10">
              <img 
                src="/placeholder.svg" 
                alt="Product Showcase" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-48 h-48 md:w-64 md:h-64 bg-brand-coral rounded-full opacity-30 absolute -bottom-10 -left-10"></div>
          </div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-12 sm:h-16 text-white"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,11,5,139.39,45.99"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
