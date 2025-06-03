import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface OrderDesignDownloadProps {
  items: any[];
  orderNumber: string;
}

const OrderDesignDownload: React.FC<OrderDesignDownloadProps> = ({ items, orderNumber }) => {
  const designItems = items.filter(item => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage ||
    (item.product_id && item.product_id.includes('custom-'))
  );

  const createPrintReadyImage = async (item: any, side: 'front' | 'back' = 'front'): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set high resolution for print quality
        canvas.width = 2400;  // 8 inches at 300 DPI
        canvas.height = 3000; // 10 inches at 300 DPI
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add border for cutting guide
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.setLineDash([]);

        // Product template area
        const templateArea = {
          x: canvas.width * 0.2,
          y: canvas.height * 0.15,
          width: canvas.width * 0.6,
          height: canvas.height * 0.6
        };

        // Draw product template outline
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 3;
        
        if (item.name?.toLowerCase().includes('t-shirt') || item.name?.toLowerCase().includes('tshirt')) {
          // T-shirt outline
          ctx.beginPath();
          ctx.moveTo(templateArea.x + templateArea.width * 0.2, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.8, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.9, templateArea.y + templateArea.height * 0.2);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width * 0.1, templateArea.y + templateArea.height * 0.2);
          ctx.closePath();
          ctx.stroke();
        } else if (item.name?.toLowerCase().includes('mug')) {
          // Mug outline (rectangular area)
          ctx.strokeRect(templateArea.x, templateArea.y + templateArea.height * 0.2, 
                        templateArea.width, templateArea.height * 0.6);
        } else if (item.name?.toLowerCase().includes('cap')) {
          // Cap outline (curved)
          ctx.beginPath();
          ctx.arc(templateArea.x + templateArea.width / 2, templateArea.y + templateArea.height * 0.4, 
                 templateArea.width * 0.4, 0, Math.PI, false);
          ctx.stroke();
        }

        // Design area boundary
        const designArea = {
          x: templateArea.x + templateArea.width * 0.15,
          y: templateArea.y + templateArea.height * 0.2,
          width: templateArea.width * 0.7,
          height: templateArea.height * 0.5
        };

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.strokeRect(designArea.x, designArea.y, designArea.width, designArea.height);
        ctx.setLineDash([]);

        // Load and draw the design image - FIXED: Properly handle design data
        const processDesignData = () => {
          // Get the design data/image
          let imageUrl = side === 'back' ? item.metadata?.backImage : item.metadata?.previewImage;
          
          // If we have design data instead of preview image, reconstruct the design
          if (!imageUrl && item.metadata?.designData) {
            try {
              const designData = typeof item.metadata.designData === 'string' 
                ? JSON.parse(item.metadata.designData) 
                : item.metadata.designData;
              
              // Create a temporary canvas to render the design elements
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              tempCanvas.width = 800;
              tempCanvas.height = 600;
              
              if (tempCtx) {
                // White background
                tempCtx.fillStyle = '#ffffff';
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Render design elements
                if (designData.elements && Array.isArray(designData.elements)) {
                  designData.elements.forEach((element: any) => {
                    if (element.type === 'text') {
                      tempCtx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
                      tempCtx.fillStyle = element.fill || '#000000';
                      tempCtx.fillText(element.text || '', element.left || 50, element.top || 50);
                    } else if (element.type === 'image') {
                      // For images, we'd need to load them asynchronously
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        tempCtx.drawImage(img, element.left || 0, element.top || 0, 
                                        element.width || 100, element.height || 100);
                      };
                      if (element.src) img.src = element.src;
                    }
                  });
                }
                
                imageUrl = tempCanvas.toDataURL();
              }
            } catch (error) {
              console.error('Error processing design data:', error);
            }
          }
          
          if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              // Calculate scaling to fit within design area while maintaining aspect ratio
              const scaleX = designArea.width / img.width;
              const scaleY = designArea.height / img.height;
              const scale = Math.min(scaleX, scaleY);
              
              const drawWidth = img.width * scale;
              const drawHeight = img.height * scale;
              const drawX = designArea.x + (designArea.width - drawWidth) / 2;
              const drawY = designArea.y + (designArea.height - drawHeight) / 2;
              
              // Draw the design
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              
              // Add print information
              ctx.fillStyle = '#1f2937';
              ctx.font = 'bold 36px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(`Order: ${orderNumber}`, canvas.width / 2, canvas.height - 200);
              
              ctx.font = '28px Arial';
              ctx.fillText(`Product: ${item.name}`, canvas.width / 2, canvas.height - 150);
              ctx.fillText(`Side: ${side.charAt(0).toUpperCase() + side.slice(1)}`, canvas.width / 2, canvas.height - 100);
              
              if (item.size) {
                ctx.fillText(`Size: ${item.size}`, canvas.width / 2, canvas.height - 50);
              }

              // Add print guidelines
              ctx.fillStyle = '#6b7280';
              ctx.font = '20px Arial';
              ctx.textAlign = 'left';
              ctx.fillText('Print Guidelines:', 100, 150);
              ctx.font = '16px Arial';
              ctx.fillText('• Print at 300 DPI for best quality', 100, 180);
              ctx.fillText('• Use white background for transparent areas', 100, 210);
              ctx.fillText('• Blue dashed line shows design placement area', 100, 240);
              
              // Convert to high-quality data URL
              const dataUrl = canvas.toDataURL('image/png', 1.0);
              resolve(dataUrl);
            };
            
            img.onerror = () => {
              // If image fails to load, create text-only version
              ctx.fillStyle = '#ef4444';
              ctx.font = 'bold 48px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('Design Image Not Available', canvas.width / 2, canvas.height / 2);
              
              const dataUrl = canvas.toDataURL('image/png', 1.0);
              resolve(dataUrl);
            };
            
            img.src = imageUrl;
          } else {
            // No design image available
            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No Design Available', canvas.width / 2, canvas.height / 2);
            
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            resolve(dataUrl);
          }
        };

        processDesignData();
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const downloadDesign = async (item: any, side: 'front' | 'back' = 'front') => {
    try {
      toast.info('Generating print-ready file...', {
        description: 'This may take a few seconds'
      });

      const printReadyImage = await createPrintReadyImage(item, side);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${orderNumber}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${side}-PRINT_READY.png`;
      link.href = printReadyImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Print-ready file downloaded!', {
        description: 'High-resolution file ready for printing'
      });
    } catch (error) {
      console.error('Error creating print-ready file:', error);
      toast.error('Failed to create print-ready file');
    }
  };

  const downloadAllDesigns = async () => {
    try {
      toast.info('Generating all print files...', {
        description: 'This may take a moment'
      });

      for (let i = 0; i < designItems.length; i++) {
        const item = designItems[i];
        
        // Download front design
        await downloadDesign(item, 'front');
        
        // Download back design if it exists
        if (item.metadata?.backImage) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between downloads
          await downloadDesign(item, 'back');
        }
        
        // Wait between items
        if (i < designItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      toast.success(`Downloaded ${designItems.length} print-ready files!`);
    } catch (error) {
      console.error('Error downloading all designs:', error);
      toast.error('Failed to download all files');
    }
  };

  const viewDesign = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  if (designItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Custom Print Files</h4>
        <Button
          onClick={downloadAllDesigns}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          <Printer className="h-4 w-4 mr-1" />
          Download All ({designItems.length})
        </Button>
      </div>
      
      <div className="space-y-3">
        {designItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-blue-900">{item.name}</p>
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                {item.size && <span className="bg-blue-100 px-2 py-1 rounded">Size: {item.size}</span>}
                {item.metadata?.view && <span className="bg-blue-100 px-2 py-1 rounded">{item.metadata.view}</span>}
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(item.metadata?.previewImage || item.metadata?.designData) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDesign(item, 'front')}
                    className="bg-white hover:bg-blue-50 border-blue-200"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Front
                  </Button>
                  {item.metadata?.previewImage && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewDesign(item.metadata.previewImage)}
                      className="bg-white hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  )}
                </>
              )}
              {item.metadata?.backImage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadDesign(item, 'back')}
                  className="bg-white hover:bg-blue-50 border-blue-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Back
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
        💡 Print-ready files include templates, guidelines, and high-resolution designs optimized for production.
      </div>
    </div>
  );
};

export default OrderDesignDownload;
