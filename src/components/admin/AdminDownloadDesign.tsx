
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDownloadDesignProps {
  order: any;
}

const AdminDownloadDesign: React.FC<AdminDownloadDesignProps> = ({ order }) => {
  const hasCustomPrint = order.items?.some((item: any) => 
    item.metadata?.designData || item.metadata?.customDesign || item.name?.toLowerCase().includes('custom') || item.name?.toLowerCase().includes('printed')
  );

  const handleDownload = async () => {
    try {
      // Find items with design data
      const customItems = order.items?.filter((item: any) => 
        item.metadata?.designData || item.metadata?.customDesign || item.name?.toLowerCase().includes('custom') || item.name?.toLowerCase().includes('printed')
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

      // Add order information at the top
      ctx.fillStyle = 'black';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`Order: ${order.order_number}`, 50, 80);
      ctx.font = '24px Arial';
      ctx.fillText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 50, 120);

      let yOffset = 180;

      // Process each custom item
      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const designData = item.metadata?.designData || item.metadata?.customDesign;
        
        // Add item information
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Item ${i + 1}: ${item.name}`, 50, yOffset);
        yOffset += 40;
        
        ctx.font = '20px Arial';
        ctx.fillText(`Size: ${item.size || 'N/A'} | Quantity: ${item.quantity}`, 50, yOffset);
        yOffset += 60;
        
        if (designData) {
          try {
            // Handle different design data formats
            let imageUrl = null;
            
            if (typeof designData === 'string') {
              // If it's a direct image URL or base64
              imageUrl = designData;
            } else if (designData.frontDesign) {
              // If it has frontDesign property
              imageUrl = designData.frontDesign;
            } else if (designData.imageUrl) {
              // If it has imageUrl property
              imageUrl = designData.imageUrl;
            } else if (designData.canvas) {
              // If it has canvas data
              imageUrl = designData.canvas;
            }
            
            if (imageUrl) {
              // Load and draw the design image
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  // Calculate position and size for the design
                  const maxWidth = a4Width - 200;
                  const maxHeight = 800;
                  
                  let designWidth = img.width;
                  let designHeight = img.height;
                  
                  // Scale down if too large
                  if (designWidth > maxWidth) {
                    designHeight = (designHeight * maxWidth) / designWidth;
                    designWidth = maxWidth;
                  }
                  
                  if (designHeight > maxHeight) {
                    designWidth = (designWidth * maxHeight) / designHeight;
                    designHeight = maxHeight;
                  }
                  
                  const x = (a4Width - designWidth) / 2;
                  const y = yOffset;
                  
                  // Draw a border around the design area
                  ctx.strokeStyle = '#ddd';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(x - 10, y - 10, designWidth + 20, designHeight + 20);
                  
                  // Draw the design
                  ctx.drawImage(img, x, y, designWidth, designHeight);
                  
                  resolve(null);
                };
                img.onerror = () => {
                  console.error('Failed to load design image:', imageUrl);
                  // Draw placeholder text instead
                  ctx.fillStyle = '#666';
                  ctx.font = '20px Arial';
                  ctx.fillText('Design image could not be loaded', 50, yOffset);
                  resolve(null);
                };
                img.src = imageUrl;
              });
              
              yOffset += 850; // Space for next item
            } else {
              // No valid image found, show placeholder
              ctx.fillStyle = '#666';
              ctx.font = '20px Arial';
              ctx.fillText('Custom design data available but no image found', 50, yOffset);
              yOffset += 100;
            }
          } catch (error) {
            console.error('Error processing design:', error);
            ctx.fillStyle = '#666';
            ctx.font = '20px Arial';
            ctx.fillText('Error loading design', 50, yOffset);
            yOffset += 100;
          }
        } else {
          // No design data, show placeholder
          ctx.fillStyle = '#666';
          ctx.font = '20px Arial';
          ctx.fillText('No design data available', 50, yOffset);
          yOffset += 100;
        }
        
        yOffset += 50; // Space between items
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
      toast.error('Failed to download design: ' + error.message);
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
