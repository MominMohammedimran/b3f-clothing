
import React, { useEffect } from 'react';
import { fabric } from 'fabric';

interface CanvasBackgroundProps {
  canvas: fabric.Canvas | null;
  productType: string;
  view: string;
}

const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  canvas,
  productType,
  view
}) => {
  useEffect(() => {
    if (!canvas) return;

    const setBackgroundImage = () => {
      let imagePath = '';
      
      switch (productType) {
        case 'tshirt':
          imagePath = view === 'back' ? 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/design-tool-page/tshirt-sub-images/tshirt-back.webp' : 
          'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/design-tool-page/tshirt-sub-images/tshirt-front.webp';
          break;
        case 'mug':
          imagePath = 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/design-tool-page/mug-sub-images/mug-plain.webp';
          break;
        case 'cap':
          imagePath = 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/design-tool-page/cap-sub-images/cap-plain.webp';
          break;
        default:
          imagePath = 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/design-tool-page/tshirt-sub-images/tshirt-front.webp';
      }

      fabric.Image.fromURL(imagePath, (img) => {
        if (!img || !canvas) return;
        
        // Scale image to fit canvas
        const scaleX = canvas.width! / img.width!;
        const scaleY = canvas.height! / img.height!;
        const scale = Math.min(scaleX, scaleY, 1);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvas.width! - img.width! * scale) / 2,
          top: (canvas.height! - img.height! * scale) / 2,
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          moveCursor: 'default'
        });
        
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      }, { crossOrigin: 'anonymous' });
    };

    setBackgroundImage();
  }, [canvas, productType, view]);

  return null;
};

export default CanvasBackground;
