
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]"></div>
      </div>
      
      <div className="relative pt-24 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="mb-8 flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-medium">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-2">New</span>
          Announcing our latest feature update
          <ArrowRight size={14} className="ml-2" />
        </div>

        <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Build beautiful products,
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"> faster than ever</span>
        </h1>
        
        <p className="text-center text-xl text-slate-600 max-w-2xl mb-10">
          Our platform empowers businesses to create stunning digital experiences without writing a single line of code. Launch your ideas in minutes, not months.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg py-6 flex-1">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 text-lg py-6 flex-1">
            View Demo
          </Button>
        </div>

        <div className="mt-16 w-full max-w-4xl rounded-lg shadow-xl overflow-hidden border border-slate-200">
          <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5"></div>
          <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-white p-4">
            <div className="w-full h-64 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
