
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
  const downloadDesignAsPNG = async () => {
    try {
      if (!designData && !previewImage) {
        console.error('No design data or preview image available');
        return;
      }

      // If we have design data, recreate the canvas and export
      if (designData) {
        // Create a temporary canvas element
        const tempCanvasElement = document.createElement('canvas');
        tempCanvasElement.width = designData.width || 500;
        tempCanvasElement.height = designData.height || 600;
        
        // Create fabric canvas
        const tempCanvas = new fabric.Canvas(tempCanvasElement, {
          width: designData.width || 500,
          height: designData.height || 600,
          backgroundColor: 'transparent'
        });

        // Load the design data into the temporary canvas
        tempCanvas.loadFromJSON(designData, () => {
          // Filter out background objects for clean export
          const designObjects = tempCanvas.getObjects().filter(obj => !obj.data?.isBackground);
          
          if (designObjects.length > 0) {
            // Create a new canvas with only design elements
            const exportCanvasElement = document.createElement('canvas');
            exportCanvasElement.width = tempCanvas.width!;
            exportCanvasElement.height = tempCanvas.height!;
            
            const exportCanvas = new fabric.Canvas(exportCanvasElement, {
              width: tempCanvas.width!,
              height: tempCanvas.height!,
              backgroundColor: 'transparent'
            });

            // Add only design objects
            designObjects.forEach(obj => {
              const clonedObj = fabric.util.object.clone(obj);
              exportCanvas.add(clonedObj);
            });

            exportCanvas.renderAll();

            // Generate PNG data URL
            const dataURL = exportCanvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: 2
            });

            // Create download link
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `${orderNumber}-${productName}-design.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            exportCanvas.dispose();
            tempCanvas.dispose();
          } else {
            // Fall back to preview image if no design objects
            downloadPreviewImage();
          }
        });
      } else {
        // Fall back to preview image
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
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = `${orderNumber}-${productName}-preview.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading preview image:', error);
      }
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
            onClick={downloadDesignAsPNG}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Download PNG
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
