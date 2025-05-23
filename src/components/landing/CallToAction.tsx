
import React from "react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <div id="pricing" className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
            Join thousands of businesses that are already using our platform to build amazing products.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
