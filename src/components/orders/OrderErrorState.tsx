
import React from 'react';
import Layout from '../layout/Layout';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LoadableContent from '../ui/LoadableContent';

interface OrderErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  onBack?: () => void;
}

const OrderErrorState: React.FC<OrderErrorStateProps> = ({ error, onRetry, onBack }) => {
  const errorContent = (
    <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-lg mx-auto shadow-sm">
      <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Not Found</h2>
      <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist or you may not have permission to view it.'}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onBack ? (
          <Button variant="outline" onClick={onBack}>Back</Button>
        ) : (
          <Link to="/orders">
            <Button variant="outline">View Your Orders</Button>
          </Link>
        )}
        
        {onRetry && (
          <Button variant="default" onClick={onRetry}>Try Again</Button>
        )}
        
        {!onRetry && !onBack && (
          <Link to="/">
            <Button variant="default">Go to Homepage</Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <LoadableContent
          isLoading={false}
          error={error}
          errorContent={errorContent}
          className="bg-transparent"
        >
          <div></div> {/* Providing empty children to satisfy type requirements */}
        </LoadableContent>
      </div>
    </Layout>
  );
};

export default OrderErrorState;
