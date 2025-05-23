
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Horizon
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <a href="#features" className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </a>
              <a href="#testimonials" className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                Pricing
              </a>
              <Button className="ml-4 bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <Button variant="ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
