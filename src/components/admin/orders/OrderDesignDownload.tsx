import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '@/lib/types';

interface OrderDesignDownloadProps {
  items: CartItem[];
  orderNumber: string;
}

const OrderDesignDownload: React.FC<OrderDesignDownloadProps> = ({ items, orderNumber }) => {
  
  const isCustomProduct = (item: CartItem) => {
    return item.productId?.includes('custom-') && 
           (item.productId?.includes('tshirt') || item.productId?.includes('mug') || item.productId?.includes('cap'));
  };

  const captureDesignScreenshot = async (item: CartItem): Promise<string | null> => {
    try {
      // Create a canvas for high-resolution screenshot
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set high resolution
      canvas.width = 1200;
      canvas.height = 1400;
      
      if (!ctx) return null;

      // Create product template
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw product outline (T-shirt shape)
      if (item.productId?.includes('tshirt')) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simple T-shirt outline
        ctx.moveTo(300, 200);
        ctx.lineTo(900, 200);
        ctx.lineTo(900, 400);
        ctx.lineTo(800, 400);
        ctx.lineTo(800, 1200);
        ctx.lineTo(400, 1200);
        ctx.lineTo(400, 400);
        ctx.lineTo(300, 400);
        ctx.closePath();
        ctx.stroke();
      }

      // Draw design if available
      if (item.metadata?.previewImage) {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Center the design on the product
            const designWidth = 300;
            const designHeight = 300;
            const x = (canvas.width - designWidth) / 2;
            const y = (canvas.height - designHeight) / 2;
            
            ctx.drawImage(img, x, y, designWidth, designHeight);
            
            // Convert to high-quality image
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            resolve(dataUrl);
          };
          img.onerror = () => resolve(item.metadata?.previewImage || null);
          img.src = item.metadata.previewImage;
        });
      }
      
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error creating screenshot:', error);
      return null;
    }
  };

  const downloadDesignFiles = async () => {
    try {
      const customItems = items.filter(isCustomProduct);

      if (customItems.length === 0) {
        toast.error('No custom design files found for this order');
        return;
      }

      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        
        // Create high-resolution screenshot
        const screenshot = await captureDesignScreenshot(item);
        
        if (screenshot) {
          await downloadImage(
            screenshot,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_${item.metadata?.view || 'design'}_print_ready.png`
          );
        }

        // Download original preview if different
        if (item.metadata?.previewImage && item.metadata.previewImage !== screenshot) {
          await downloadImage(
            item.metadata.previewImage,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_original_preview.png`
          );
        }

        // Download back image if exists (for dual-sided designs)
        if (item.metadata?.backImage) {
          await downloadImage(
            item.metadata.backImage,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_back_design.png`
          );
        }

        // Small delay between downloads
        if (i < customItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(`Downloaded ${customItems.length} print-ready design files for order ${orderNumber}`);
    } catch (error) {
      console.error('Error downloading design files:', error);
      toast.error('Failed to download design files');
    }
  };

  const downloadImage = async (imageUrl: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const customProducts = items.filter(isCustomProduct);

  if (customProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Print Files</h4>
      <div className="space-y-2">
        {customProducts.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <span className="font-medium">{item.name}</span>
            {item.metadata?.view && ` • ${item.metadata.view}`}
            {item.size && ` • Size: ${item.size}`}
          </div>
        ))}
      </div>
      <Button
        onClick={downloadDesignFiles}
        variant="outline"
        size="sm"
        className="w-full mt-2"
      >
        <Download className="h-4 w-4 mr-2" />
        <Camera className="h-4 w-4 mr-1" />
        Download Print-Ready Files ({customProducts.length} items)
      </Button>
    </div>
  );
};

export default OrderDesignDownload;