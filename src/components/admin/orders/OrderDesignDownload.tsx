
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '@/lib/types';

interface OrderDesignDownloadProps {
  items: CartItem[];
  orderNumber: string;
}

const OrderDesignDownload: React.FC<OrderDesignDownloadProps> = ({ items, orderNumber }) => {
  const downloadDesignFiles = async () => {
    try {
      const designItems = items.filter(item => 
        item.metadata?.previewImage || item.metadata?.designData || item.metadata?.backImage || item.image
      );

      if (designItems.length === 0) {
        toast.error('No design files found for this order');
        return;
      }

      for (let i = 0; i < designItems.length; i++) {
        const item = designItems[i];
        
        // Download main preview image
        if (item.metadata?.previewImage) {
          await downloadImage(
            item.metadata.previewImage,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_${item.metadata.view || 'front'}_design.png`
          );
        }

        // Download back image if exists (for dual-sided designs)
        if (item.metadata?.backImage) {
          await downloadImage(
            item.metadata.backImage,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_back_design.png`
          );
        }

        // If no preview image but has design data, try to download the main image
        if (!item.metadata?.previewImage && item.image) {
          await downloadImage(
            item.image,
            `${orderNumber}_${item.name.replace(/\s+/g, '_')}_product_image.png`
          );
        }

        // Small delay between downloads to prevent browser blocking
        if (i < designItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(`Downloaded ${designItems.length} design files for order ${orderNumber}`);
    } catch (error) {
      console.error('Error downloading design files:', error);
      toast.error('Failed to download design files');
    }
  };

  const downloadImage = async (imageUrl: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary canvas to convert data URL to blob if needed
        if (imageUrl.startsWith('data:')) {
          // For data URLs, create a download link directly
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        } else {
          // For regular URLs, fetch and create blob
          fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              resolve();
            })
            .catch(error => {
              console.error('Error fetching image:', error);
              // Fallback to direct link download
              const link = document.createElement('a');
              link.href = imageUrl;
              link.download = filename;
              link.target = '_blank';
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              resolve();
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const hasDesignFiles = items.some(item => 
    item.metadata?.previewImage || item.metadata?.designData || item.metadata?.backImage || item.image
  );

  if (!hasDesignFiles) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Design Files</h4>
      <Button
        onClick={downloadDesignFiles}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download All Design Files ({items.filter(item => 
          item.metadata?.previewImage || item.metadata?.designData || item.metadata?.backImage || item.image
        ).length} files)
      </Button>
    </div>
  );
};

export default OrderDesignDownload;
