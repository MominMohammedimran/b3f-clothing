
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/lib/types';

interface OrderDesignPreviewProps {
  items: CartItem[];
  orderNumber: string;
}

const OrderDesignPreview: React.FC<OrderDesignPreviewProps> = ({ items, orderNumber }) => {
  const designItems = items.filter(item => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage || 
    (item.image && item.image.startsWith('data:'))
  );

  if (designItems.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Design Previews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {designItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{item.name}</h4>
              <div className="flex gap-2">
                {item.sizes.map((sizeItem, sizeIndex) => (
                  <Badge key={sizeIndex} variant="outline">Size: {sizeItem.size} (Qty: {sizeItem.quantity})</Badge>
                ))}
                {item.metadata?.view && (
                  <Badge variant="secondary">{item.metadata.view}</Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main preview image */}
              {(item.metadata?.previewImage || item.image) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {item.metadata?.view === 'back' ? 'Back Design' : 'Front Design'}
                  </p>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={item.metadata?.previewImage || item.image}
                      alt={`${item.name} design preview`}
                      className="w-full h-48 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Back image for dual-sided designs */}
              {item.metadata?.backImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Back Design</p>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={item.metadata.backImage}
                      alt={`${item.name} back design preview`}
                      className="w-full h-48 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Design metadata */}
            {item.metadata?.designData && (
              <div className="text-xs text-gray-500">
                <p>Design data available for production</p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default OrderDesignPreview;
