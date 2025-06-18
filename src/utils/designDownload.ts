
export const downloadDesignWithWhiteBackground = async (designData: any, fileName: string) => {
  return new Promise((resolve) => {
    // Create a temporary canvas for the design
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (adjust as needed)
    canvas.width = 800;
    canvas.height = 800;
    
    if (!ctx) {
      console.error('Could not get canvas context');
      resolve(null);
      return;
    }
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // If there's design data, render it
    if (designData) {
      try {
        // Handle different types of design data
        if (typeof designData === 'string' && designData.startsWith('data:image')) {
          // If it's a base64 image
          const img = new Image();
          img.onload = () => {
            // Center the image on the white background
            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 2;
            ctx.drawImage(img, x, y);
            downloadCanvas(canvas, fileName);
            resolve(true);
          };
          img.src = designData;
        } else if (designData.objects) {
          // If it's Fabric.js JSON data
          renderFabricDataOnCanvas(ctx, designData, canvas.width, canvas.height);
          downloadCanvas(canvas, fileName);
          resolve(true);
        } else {
          // Fallback: just download white background
          downloadCanvas(canvas, fileName);
          resolve(true);
        }
      } catch (error) {
        console.error('Error rendering design:', error);
        downloadCanvas(canvas, fileName);
        resolve(true);
      }
    } else {
      // No design data, just download white background
      downloadCanvas(canvas, fileName);
      resolve(true);
    }
  });
};

const downloadCanvas = (canvas: HTMLCanvasElement, fileName: string) => {
  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};

const renderFabricDataOnCanvas = (ctx: CanvasRenderingContext2D, designData: any, width: number, height: number) => {
  // Basic rendering of Fabric.js objects
  if (designData.objects) {
    designData.objects.forEach((obj: any) => {
      try {
        if (obj.type === 'text' || obj.type === 'i-text') {
          // Render text
          ctx.font = `${obj.fontSize || 20}px ${obj.fontFamily || 'Arial'}`;
          ctx.fillStyle = obj.fill || '#000000';
          ctx.textAlign = 'left';
          ctx.fillText(obj.text || '', obj.left || 50, obj.top || 50);
        } else if (obj.type === 'image') {
          // Render image (would need more complex handling for actual images)
          ctx.fillStyle = '#CCCCCC';
          ctx.fillRect(obj.left || 50, obj.top || 50, obj.width || 100, obj.height || 100);
          ctx.fillStyle = '#666666';
          ctx.font = '12px Arial';
          ctx.fillText('Image', (obj.left || 50) + 10, (obj.top || 50) + 20);
        }
      } catch (error) {
        console.error('Error rendering object:', error);
      }
    });
  }
};
