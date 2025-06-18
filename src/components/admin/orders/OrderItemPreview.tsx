
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '@/lib/types';

interface OrderItemPreviewProps {
  item: CartItem;
  orderNumber: string;
}

const OrderItemPreview: React.FC<OrderItemPreviewProps> = ({ item, orderNumber }) => {
  const isCustomProduct = item.product_id?.includes('custom-') && 
    (item.product_id?.includes('tshirt') || item.product_id?.includes('mug') || item.product_id?.includes('cap'));

  const downloadPreviewImage = async () => {
    try {
      const imageUrl = item.metadata?.previewImage || item.image;
      
      if (!imageUrl) {
        toast.error('No preview image available for download');
        return;
      }

      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${orderNumber}_${item.name.replace(/\s+/g, '_')}_preview.png`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Preview image downloaded successfully');
    } catch (error) {
      console.error('Error downloading preview image:', error);
      toast.error('Failed to download preview image');
    }
  };

  if (!isCustomProduct) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-900">Custom Design Preview</h4>
        <Button
          onClick={downloadPreviewImage}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-300 hover:bg-blue-100"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
      
      {item.metadata?.previewImage || item.image ? (
        <div className="flex gap-4">
          <div className="w-20 h-20 border rounded overflow-hidden bg-white">
            <img
              src={item.metadata?.previewImage || item.image}
              alt={`${item.name} preview`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          {item.metadata?.backImage && (
            <div className="w-20 h-20 border rounded overflow-hidden bg-white">
              <img
                src={item.metadata.backImage}
                alt={`${item.name} back preview`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <p className="text-xs text-center text-gray-600 mt-1">Back</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No preview available</p>
      )}
      
      <div className="mt-2 text-xs text-blue-700">
        {item.metadata?.view && <span>View: {item.metadata.view}</span>}
        {item.sizes.map((sizeItem, index) => (
          <span key={index} className="ml-2">Size: {sizeItem.size} (Qty: {sizeItem.quantity})</span>
        ))}
      </div>
    </div>
  );
};

export default OrderItemPreview;
