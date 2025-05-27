
import React from 'react';
import { Skeleton } from '../ui/skeleton';

const CartLoader = () => {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex py-4 border-b border-gray-200 animate-pulse">
                <div className="h-24 w-24 rounded-md bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1 ml-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="flex items-center mt-2">
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-6 w-full mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
            <div className="mt-6">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLoader;
