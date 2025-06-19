
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  items: any[];
}

interface AdminDownloadDesignProps {
  order: Order;
}

const AdminDownloadDesign: React.FC<AdminDownloadDesignProps> = ({ order }) => {
  const downloadDesignAsImage = async (designData: any, fileName: string) => {
    try {
      // Create a canvas to render the design
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size
      canvas.width = 800;
      canvas.height = 800;
      
      // Make background transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (designData && designData.objects) {
        // Render each design object
        for (const obj of designData.objects) {
          try {
            if (obj.type === 'text' || obj.type === 'i-text') {
              // Render text
              ctx.font = `${obj.fontSize || 20}px ${obj.fontFamily || 'Arial'}`;
              ctx.fillStyle = obj.fill || '#000000';
              ctx.textAlign = 'left';
              ctx.fillText(obj.text || '', obj.left || 50, (obj.top || 50) + (obj.fontSize || 20));
            } else if (obj.type === 'image') {
              // For images, we'll create a placeholder since we can't load the actual image
              ctx.fillStyle = obj.fill || '#CCCCCC';
              ctx.fillRect(obj.left || 50, obj.top || 50, obj.width || 100, obj.height || 100);
              ctx.fillStyle = '#666666';
              ctx.font = '12px Arial';
              ctx.fillText('Image', (obj.left || 50) + 10, (obj.top || 50) + 20);
            } else if (obj.type === 'circle') {
              // Render circle/emoji
              ctx.beginPath();
              ctx.arc(
                (obj.left || 50) + (obj.radius || 25), 
                (obj.top || 50) + (obj.radius || 25), 
                obj.radius || 25, 
                0, 
                2 * Math.PI
              );
              ctx.fillStyle = obj.fill || '#FFFF00';
              ctx.fill();
              
              // If it's an emoji, try to render the text
              if (obj.text) {
                ctx.font = `${(obj.radius || 25) * 1.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000000';
                ctx.fillText(
                  obj.text, 
                  (obj.left || 50) + (obj.radius || 25), 
                  (obj.top || 50) + (obj.radius || 25) + ((obj.radius || 25) * 0.5)
                );
              }
            }
          } catch (objError) {
            console.error('Error rendering object:', objError);
          }
        }
      }
      
      // Download the canvas as PNG with transparent background
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Design downloaded successfully');
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error downloading design:', error);
      toast.error('Failed to download design');
    }
  };

  const handleDownloadDesign = async () => {
    try {
      const customItems = order.items.filter((item: any) => 
        item.metadata?.designData || item.metadata?.previewImage
      );
      
      if (customItems.length === 0) {
        toast.error('No custom designs found in this order');
        return;
      }

      // Download designs for each custom item
      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const fileName = `design_${order.order_number}_item_${i + 1}.png`;
        
        if (item.metadata?.designData) {
          // Parse the design data if it's a string
          let designData = item.metadata.designData;
          if (typeof designData === 'string') {
            try {
              designData = JSON.parse(designData);
            } catch (parseError) {
              console.error('Error parsing design data:', parseError);
              continue;
            }
          }
          
          await downloadDesignAsImage(designData, fileName);
          
          // Add delay between downloads
          if (i < customItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else if (item.metadata?.previewImage) {
          // If only preview image is available, download that
          const link = document.createElement('a');
          link.href = item.metadata.previewImage;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
    } catch (error) {
      console.error('Error in handleDownloadDesign:', error);
      toast.error('Failed to download designs');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownloadDesign}
      className="h-8 w-8 p-0"
      title="Download Design"
    >
      <Download size={14} />
    </Button>
  );
};

export default AdminDownloadDesign;