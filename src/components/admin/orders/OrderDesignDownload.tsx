
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface OrderDesignDownloadProps {
  items: any[];
  orderNumber: string;
  shippingAddress?: any;
}

const OrderDesignDownload: React.FC<OrderDesignDownloadProps> = ({ items, orderNumber, shippingAddress }) => {
  const designItems = items.filter(item => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage ||
    (item.product_id && item.product_id.includes('custom-')) ||
    item.name.toLowerCase().includes('custom') ||
    item.name.toLowerCase().includes('printed')
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

        // ENSURE WHITE BACKGROUND - Fill entire canvas with white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add print guidelines with light gray
        ctx.strokeStyle = '#E5E7EB';
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

        // Draw product template based on type with light gray
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 3;
        
        const productName = item.name?.toLowerCase() || '';
        
        if (productName.includes('t-shirt') || productName.includes('tshirt')) {
          // T-shirt outline
          ctx.beginPath();
          ctx.moveTo(templateArea.x + templateArea.width * 0.3, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.7, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.85, templateArea.y + templateArea.height * 0.2);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width * 0.15, templateArea.y + templateArea.height * 0.2);
          ctx.closePath();
          ctx.stroke();
        } else if (productName.includes('mug')) {
          ctx.strokeRect(templateArea.x, templateArea.y + templateArea.height * 0.2, 
                        templateArea.width, templateArea.height * 0.6);
        } else if (productName.includes('cap')) {
          ctx.beginPath();
          ctx.arc(templateArea.x + templateArea.width / 2, templateArea.y + templateArea.height * 0.4, 
                 templateArea.width * 0.35, 0, Math.PI, false);
          ctx.stroke();
        } else {
          ctx.strokeRect(templateArea.x, templateArea.y, templateArea.width, templateArea.height);
        }

        // Design area boundary with blue color
        const designArea = {
          x: templateArea.x + templateArea.width * 0.15,
          y: templateArea.y + templateArea.height * 0.2,
          width: templateArea.width * 0.7,
          height: templateArea.height * 0.5
        };

        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.strokeRect(designArea.x, designArea.y, designArea.width, designArea.height);
        ctx.setLineDash([]);

        // Add white background specifically for design area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(designArea.x, designArea.y, designArea.width, designArea.height);

        const finishCanvas = () => {
          // Add order information with dark text on white background
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Order: ${orderNumber}`, canvas.width / 2, canvas.height - 300);
          
          ctx.font = '28px Arial';
          ctx.fillText(`Product: ${item.name}`, canvas.width / 2, canvas.height - 250);
          ctx.fillText(`Side: ${side.charAt(0).toUpperCase() + side.slice(1)}`, canvas.width / 2, canvas.height - 200);
          
          if (item.sizes && item.sizes.length > 0) {
            ctx.fillText(`Sizes: ${item.sizes.map((s: any) => `${s.size}(${s.quantity})`).join(', ')}`, canvas.width / 2, canvas.height - 150);
          }

          // Add shipping address if available
          if (shippingAddress) {
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Shipping Address:', 100, canvas.height - 100);
            ctx.font = '16px Arial';
            let yPos = canvas.height - 70;
            
            if (shippingAddress.fullName || (shippingAddress.firstName && shippingAddress.lastName)) {
              ctx.fillText(`Name: ${shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`}`, 100, yPos);
              yPos += 25;
            }
            if (shippingAddress.addressLine1 || shippingAddress.street) {
              ctx.fillText(`Address: ${shippingAddress.addressLine1 || shippingAddress.street}`, 100, yPos);
              yPos += 25;
            }
            if (shippingAddress.city && shippingAddress.state) {
              ctx.fillText(`City: ${shippingAddress.city}, State: ${shippingAddress.state}`, 100, yPos);
              yPos += 25;
            }
            if (shippingAddress.postalCode || shippingAddress.zipCode) {
              ctx.fillText(`Pincode: ${shippingAddress.postalCode || shippingAddress.zipCode}`, 100, yPos);
              yPos += 25;
            }
            if (shippingAddress.phone) {
              ctx.fillText(`Phone: ${shippingAddress.phone}`, 100, yPos);
            }
          }

          const dataUrl = canvas.toDataURL('image/png', 1.0);
          resolve(dataUrl);
        };

        // Process design data or use preview image
        if (item.metadata?.designData) {
          try {
            const designData = typeof item.metadata.designData === 'string' 
              ? JSON.parse(item.metadata.designData) 
              : item.metadata.designData;
            
            if (designData.elements && Array.isArray(designData.elements)) {
              const elementsToRender = designData.elements.filter((element: any) => 
                element.visible !== false
              );
              
              let elementsProcessed = 0;
              const totalElements = elementsToRender.length;
              
              if (totalElements === 0) {
                finishCanvas();
                return;
              }
              
              elementsToRender.forEach((element: any) => {
                if (element.type === 'text') {
                  // Render text with proper scaling and ensure it's visible on white background
                  const fontSize = Math.max(24, (element.fontSize || 24) * 3);
                  ctx.font = `${element.fontWeight || 'normal'} ${fontSize}px ${element.fontFamily || 'Arial'}`;
                  
                  // Ensure text color is visible on white background
                  let textColor = element.fill || '#000000';
                  if (textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === 'white') {
                    textColor = '#000000'; // Change white text to black for visibility
                  }
                  ctx.fillStyle = textColor;
                  
                  ctx.textAlign = 'left';
                  ctx.textBaseline = 'top';
                  
                  const x = designArea.x + (element.left || 0) * 2.5;
                  const y = designArea.y + (element.top || 0) * 2.5;
                  
                  // Add text shadow for better visibility if needed
                  if (element.shadow) {
                    ctx.shadowColor = element.shadow.color || '#000000';
                    ctx.shadowOffsetX = (element.shadow.offsetX || 2) * 2;
                    ctx.shadowOffsetY = (element.shadow.offsetY || 2) * 2;
                    ctx.shadowBlur = (element.shadow.blur || 4) * 2;
                  }
                  
                  ctx.fillText(element.text || '', x, y);
                  ctx.shadowColor = 'transparent';
                  
                  elementsProcessed++;
                  if (elementsProcessed === totalElements) {
                    finishCanvas();
                  }
                } else if (element.type === 'image') {
                  if (element.src) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = () => {
                      const x = designArea.x + (element.left || 0) * 2.5;
                      const y = designArea.y + (element.top || 0) * 2.5;
                      const width = (element.width || 100) * 2.5;
                      const height = (element.height || 100) * 2.5;
                      
                      // Ensure image stays within design area
                      const maxWidth = Math.min(width, designArea.width - (x - designArea.x));
                      const maxHeight = Math.min(height, designArea.height - (y - designArea.y));
                      
                      // Add white background behind image if it has transparency
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(x, y, maxWidth, maxHeight);
                      
                      ctx.drawImage(img, x, y, maxWidth, maxHeight);
                      
                      elementsProcessed++;
                      if (elementsProcessed === totalElements) {
                        finishCanvas();
                      }
                    };
                    
                    img.onerror = () => {
                      console.warn('Failed to load image:', element.src);
                      elementsProcessed++;
                      if (elementsProcessed === totalElements) {
                        finishCanvas();
                      }
                    };
                    
                    img.src = element.src;
                  } else {
                    elementsProcessed++;
                    if (elementsProcessed === totalElements) {
                      finishCanvas();
                    }
                  }
                } else {
                  elementsProcessed++;
                  if (elementsProcessed === totalElements) {
                    finishCanvas();
                  }
                }
              });
            } else {
              finishCanvas();
            }
          } catch (error) {
            console.error('Error processing design data:', error);
            finishCanvas();
          }
        } else {
          // Use preview image as fallback
          let imageUrl = side === 'back' ? item.metadata?.backImage : item.metadata?.previewImage;
          
          if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              const scaleX = designArea.width / img.width;
              const scaleY = designArea.height / img.height;
              const scale = Math.min(scaleX, scaleY, 1);
              
              const drawWidth = img.width * scale;
              const drawHeight = img.height * scale;
              const drawX = designArea.x + (designArea.width - drawWidth) / 2;
              const drawY = designArea.y + (designArea.height - drawHeight) / 2;
              
              // Ensure white background behind image
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
              
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              finishCanvas();
            };
            
            img.onerror = () => {
              console.warn('Failed to load preview image');
              finishCanvas();
            };
            
            img.src = imageUrl;
          } else {
            finishCanvas();
          }
        }
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const downloadDesign = async (item: any, side: 'front' | 'back' = 'front') => {
    try {
      toast.info('Generating print-ready file...', {
        description: 'Creating high-resolution template with design preview'
      });

      const printReadyImage = await createPrintReadyImage(item, side);
      
      const link = document.createElement('a');
      link.download = `${orderNumber}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${side}-DESIGN_PREVIEW.png`;
      link.href = printReadyImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Design preview downloaded!', {
        description: 'High-resolution template with shipping details ready'
      });
    } catch (error) {
      console.error('Error creating design preview:', error);
      toast.error('Failed to create design preview');
    }
  };

  const downloadAllDesigns = async () => {
    try {
      toast.info('Generating all design previews...', {
        description: 'This may take a moment'
      });

      for (let i = 0; i < designItems.length; i++) {
        const item = designItems[i];
        
        await downloadDesign(item, 'front');
        
        if (item.metadata?.backImage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await downloadDesign(item, 'back');
        }
        
        if (i < designItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      toast.success(`Downloaded ${designItems.length} design previews!`);
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
        <h4 className="text-sm font-medium text-gray-900">Custom Design Downloads</h4>
        <Button
          onClick={downloadAllDesigns}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          <Printer className="h-4 w-4 mr-1" />
          Download All Designs ({designItems.length})
        </Button>
      </div>
      
      <div className="space-y-3">
        {designItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-blue-900">{item.name}</p>
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                {item.sizes && item.sizes.length > 0 && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Sizes: {item.sizes.map((s: any) => `${s.size}(${s.quantity})`).join(', ')}
                  </span>
                )}
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
                    Download Design
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
        💡 Design previews include product templates, design elements, shipping address, and high-resolution output for production.
      </div>
    </div>
  );
};

export default OrderDesignDownload;