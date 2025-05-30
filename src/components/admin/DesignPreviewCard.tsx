
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { fabric } from 'fabric';

interface DesignPreviewCardProps {
  designData?: any;
  previewImage?: string;
  orderNumber: string;
  productName: string;
}

const DesignPreviewCard: React.FC<DesignPreviewCardProps> = ({
  designData,
  previewImage,
  orderNumber,
  productName
}) => {
  const downloadDesignAsWebP = async () => {
    try {
      console.log('Starting download process...', { designData, previewImage });
      
      if (!designData && !previewImage) {
        console.error('No design data or preview image available');
        return;
      }

      // If we have design data, recreate the canvas and export
      if (designData && typeof designData === 'object') {
        console.log('Processing design data:', designData);
        
        // Create a temporary canvas element
        const tempCanvasElement = document.createElement('canvas');
        tempCanvasElement.width = designData.width || 500;
        tempCanvasElement.height = designData.height || 600;
        
        // Create fabric canvas
        const tempCanvas = new fabric.Canvas(tempCanvasElement, {
          width: designData.width || 500,
          height: designData.height || 600,
          backgroundColor: 'white'
        });

        // Load the design data into the temporary canvas
        await new Promise<void>((resolve, reject) => {
          tempCanvas.loadFromJSON(designData, () => {
            try {
              console.log('Canvas loaded, generating export...');
              
              // Filter out background objects for design-only export
              const designObjects = tempCanvas.getObjects().filter(obj => 
                !obj.data?.isBackground
              );

              if (designObjects.length === 0) {
                console.log('No design elements found, downloading preview image');
                tempCanvas.dispose();
                downloadPreviewImage();
                resolve();
                return;
              }

              // Create a new canvas with only design elements
              const exportCanvas = document.createElement('canvas');
              exportCanvas.width = tempCanvas.width!;
              exportCanvas.height = tempCanvas.height!;
              const ctx = exportCanvas.getContext('2d');
              
              if (ctx) {
                // Set white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
                
                // Render each design object
                designObjects.forEach(obj => {
                  try {
                    obj.render(ctx);
                  } catch (err) {
                    console.warn('Error rendering object:', err);
                  }
                });
                
                // Generate WebP data URL
                const dataURL = exportCanvas.toDataURL('image/webp', 0.9);
                
                // Create download link
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `${orderNumber}-${productName}-design.webp`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('Download completed successfully');
              }

              // Clean up
              tempCanvas.dispose();
              resolve();
            } catch (error) {
              console.error('Error during export:', error);
              tempCanvas.dispose();
              // Fallback to preview image
              downloadPreviewImage();
              resolve();
            }
          });
        });
      } else {
        // Fall back to preview image
        console.log('Using preview image for download');
        downloadPreviewImage();
      }
    } catch (error) {
      console.error('Error downloading design:', error);
      // Fallback to preview image download
      downloadPreviewImage();
    }
  };

  const downloadPreviewImage = () => {
    if (previewImage) {
      try {
        console.log('Downloading preview image:', previewImage);
        
        // Create download link
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = `${orderNumber}-${productName}-preview.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading preview image:', error);
      }
    } else {
      console.error('No preview image available for download');
    }
  };

  const viewDesign = () => {
    if (previewImage) {
      window.open(previewImage, '_blank');
    }
  };

  if (!designData && !previewImage) {
    return (
      <div className="text-sm text-gray-500">
        No design data available
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Custom Design</h4>
        <div className="flex gap-2">
          {previewImage && (
            <Button
              size="sm"
              variant="outline"
              onClick={viewDesign}
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              View
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadDesignAsWebP}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Download WebP
          </Button>
        </div>
      </div>
      
      {previewImage && (
        <div className="mb-3">
          <img
            src={previewImage}
            alt="Design Preview"
            className="w-full max-w-32 h-auto border rounded"
            onError={(e) => {
              console.error('Preview image failed to load:', previewImage);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        Product: {productName}
      </div>
    </div>
  );
};

export default DesignPreviewCard;
