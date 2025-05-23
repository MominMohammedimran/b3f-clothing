
import React from 'react';
import Layout from '../layout/Layout';
import { Skeleton } from '../ui/skeleton';

const OrderLoadingState: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-6 pt-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderLoadingState;
