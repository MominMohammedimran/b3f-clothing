
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDownloadDesignProps {
  order: any;
}

const AdminDownloadDesign: React.FC<AdminDownloadDesignProps> = ({ order }) => {
  const hasCustomPrint = order.items?.some((item: any) => 
    item.metadata?.designData || item.name?.toLowerCase().includes('custom') || item.name?.toLowerCase().includes('printed')
  );

  const handleDownload = async () => {
    try {
      // Find items with design data
      const customItems = order.items?.filter((item: any) => 
        item.metadata?.designData || item.name?.toLowerCase().includes('custom') || item.name?.toLowerCase().includes('printed')
      );

      if (!customItems || customItems.length === 0) {
        toast.error('No custom design found in this order');
        return;
      }

      // Create a canvas to draw the design on white background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set A4 size dimensions (at 300 DPI)
      const a4Width = 2480; // 8.27 inches * 300 DPI
      const a4Height = 3508; // 11.69 inches * 300 DPI
      
      canvas.width = a4Width;
      canvas.height = a4Height;

      if (!ctx) {
        toast.error('Failed to create canvas context');
        return;
      }

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, a4Width, a4Height);

      // Process each custom item
      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const designData = item.metadata?.designData;
        
        if (designData && designData.frontDesign) {
          // Load and draw the design image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Calculate position to center the design
              const designWidth = Math.min(img.width, a4Width - 200);
              const designHeight = (img.height * designWidth) / img.width;
              const x = (a4Width - designWidth) / 2;
              const y = 200 + (i * (designHeight + 100)); // Offset for multiple designs
              
              ctx.drawImage(img, x, y, designWidth, designHeight);
              
              // Add order information
              ctx.fillStyle = 'black';
              ctx.font = '24px Arial';
              ctx.fillText(`Order: ${order.order_number}`, 50, 100);
              ctx.fillText(`Item: ${item.name}`, 50, 140);
              ctx.fillText(`Size: ${item.size || 'N/A'}`, 50, 180);
              
              resolve(null);
            };
            img.onerror = reject;
            img.src = designData.frontDesign;
          });
        }
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `design-${order.order_number}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Design downloaded successfully');
        } else {
          toast.error('Failed to generate download');
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error downloading design:', error);
      toast.error('Failed to download design');
    }
  };

  if (!hasCustomPrint) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="ml-2"
    >
      <Download className="h-4 w-4 mr-1" />
      Download Design
    </Button>
  );
};

export default AdminDownloadDesign;