
import React from 'react';
import LoadableContent from '../ui/LoadableContent';

const WishlistLoader = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Saved Items</h2>
      </div>
      
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex animate-pulse">
            <div className="w-24 h-24 rounded-md bg-gray-200"></div>
            <div className="flex-1 ml-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistLoader;
