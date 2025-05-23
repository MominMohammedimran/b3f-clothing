
import React from 'react';
import Layout from '../layout/Layout';
import LoadableContent from '../ui/LoadableContent';
import { Skeleton } from '../ui/skeleton';

const PaymentPageLoader = () => {
  const customLoading = (
    <div className="container-custom py-8 mt-10">
      <div className="flex items-center mb-6">
        <Skeleton className="h-8 w-8 rounded-full mr-2" />
        <Skeleton className="h-8 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <LoadableContent 
        isLoading={true} 
        loadingContent={customLoading}
        loadingText="Loading payment information..."
      >
        <div></div> {/* Providing empty children to satisfy type requirements */}
      </LoadableContent>
    </Layout>
  );
};

export default PaymentPageLoader;
