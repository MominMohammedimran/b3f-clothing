
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

      // Create a canvas for the print-ready design with WHITE background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set optimal print dimensions (300 DPI for high quality printing)
      const printWidth = 2400;  // 8 inches at 300 DPI
      const printHeight = 3000; // 10 inches at 300 DPI
      
      canvas.width = printWidth;
      canvas.height = printHeight;

      if (!ctx) {
        toast.error('Failed to create canvas context');
        return;
      }

      // Fill with PURE WHITE background for printing
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, printWidth, printHeight);

      // Add order header information
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Order: ${order.order_number}`, printWidth / 2, 80);
      
      ctx.font = '32px Arial';
      ctx.fillText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, printWidth / 2, 140);
      
      // Add customer info
      ctx.font = '28px Arial';
      ctx.fillText(`Customer: ${order.user_email}`, printWidth / 2, 180);

      let yOffset = 250;

      // Process each custom item
      for (let i = 0; i < customItems.length; i++) {
        const item = customItems[i];
        const designData = item.metadata?.designData || item.metadata?.customDesign || item.metadata?.previewImage;
        
        // Add item information with clear spacing
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Item ${i + 1}: ${item.name}`, 50, yOffset);
        yOffset += 50;
        
        ctx.font = '24px Arial';
        ctx.fillText(`Size: ${item.size || 'N/A'} | Quantity: ${item.quantity}`, 50, yOffset);
        yOffset += 80;
        
        if (designData) {
          try {
            let imageUrl = null;
            
            // Handle different design data formats
            if (typeof designData === 'string') {
              if (designData.startsWith('data:image') || designData.startsWith('http')) {
                imageUrl = designData;
              } else {
                // Try to parse as JSON
                try {
                  const parsed = JSON.parse(designData);
                  imageUrl = parsed.canvas || parsed.frontDesign || parsed.imageUrl;
                } catch {
                  imageUrl = designData;
                }
              }
            } else if (designData.frontDesign) {
              imageUrl = designData.frontDesign;
            } else if (designData.canvas) {
              imageUrl = designData.canvas;
            } else if (designData.imageUrl) {
              imageUrl = designData.imageUrl;
            }
            
            if (imageUrl) {
              // Load and process the design image
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  // Create a white background for the design area
                  const designAreaWidth = printWidth - 100;
                  const designAreaHeight = 800;
                  const designX = 50;
                  const designY = yOffset;
                  
                  // Fill design area with white background
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(designX - 20, designY - 20, designAreaWidth + 40, designAreaHeight + 40);
                  
                  // Add a subtle border around the design area
                  ctx.strokeStyle = '#CCCCCC';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(designX - 20, designY - 20, designAreaWidth + 40, designAreaHeight + 40);
                  
                  // Calculate image dimensions maintaining aspect ratio
                  let designWidth = img.width;
                  let designHeight = img.height;
                  
                  // Scale to fit within design area
                  const scaleX = designAreaWidth / designWidth;
                  const scaleY = designAreaHeight / designHeight;
                  const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
                  
                  designWidth *= scale;
                  designHeight *= scale;
                  
                  // Center the design in the area
                  const centeredX = designX + (designAreaWidth - designWidth) / 2;
                  const centeredY = designY + (designAreaHeight - designHeight) / 2;
                  
                  // Draw the design image on WHITE background
                  ctx.drawImage(img, centeredX, centeredY, designWidth, designHeight);
                  
                  // Add design label
                  ctx.fillStyle = '#000000';
                  ctx.font = 'bold 20px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('DESIGN FOR PRINTING', printWidth / 2, designY + designAreaHeight + 60);
                  
                  resolve(null);
                };
                
                img.onerror = () => {
                  console.error('Failed to load design image:', imageUrl);
                  // Draw placeholder on white background
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(50, yOffset, printWidth - 100, 200);
                  ctx.strokeStyle = '#CCCCCC';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(50, yOffset, printWidth - 100, 200);
                  
                  ctx.fillStyle = '#666666';
                  ctx.font = '24px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('Design image could not be loaded', printWidth / 2, yOffset + 100);
                  resolve(null);
                };
                
                img.src = imageUrl;
              });
              
              yOffset += 900; // Space for next item
            } else {
              // No valid image found, show placeholder on white background
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(50, yOffset, printWidth - 100, 150);
              ctx.strokeStyle = '#CCCCCC';
              ctx.lineWidth = 2;
              ctx.strokeRect(50, yOffset, printWidth - 100, 150);
              
              ctx.fillStyle = '#666666';
              ctx.font = '20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Custom design data available but no image found', printWidth / 2, yOffset + 75);
              yOffset += 200;
            }
          } catch (error) {
            console.error('Error processing design:', error);
            // Error placeholder on white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(50, yOffset, printWidth - 100, 150);
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, yOffset, printWidth - 100, 150);
            
            ctx.fillStyle = '#FF0000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Error loading design', printWidth / 2, yOffset + 75);
            yOffset += 200;
          }
        } else {
          // No design data, show placeholder on white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(50, yOffset, printWidth - 100, 150);
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 2;
          ctx.strokeRect(50, yOffset, printWidth - 100, 150);
          
          ctx.fillStyle = '#888888';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No design data available', printWidth / 2, yOffset + 75);
          yOffset += 200;
        }
        
        yOffset += 100; // Space between items
      }

      // Add footer with print instructions
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PRINT INSTRUCTIONS:', printWidth / 2, yOffset + 50);
      ctx.font = '18px Arial';
      ctx.fillText('• Print on white background for best results', printWidth / 2, yOffset + 80);
      ctx.fillText('• Use high-quality transfer paper for t-shirt printing', printWidth / 2, yOffset + 110);
      ctx.fillText('• Follow heat press instructions according to paper manufacturer', printWidth / 2, yOffset + 140);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `PRINT_READY_design-${order.order_number}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('✅ Print-ready design downloaded successfully with white background');
        } else {
          toast.error('Failed to generate download');
        }
      }, 'image/png', 1.0); // Maximum quality for printing

    } catch (error) {
      console.error('Error downloading design:', error);
      toast.error('Failed to download design: ' + (error as Error).message);
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
      className="ml-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
    >
      <Download className="h-4 w-4 mr-1" />
      📄 Download Print Design
    </Button>
  );
};

export default AdminDownloadDesign;
