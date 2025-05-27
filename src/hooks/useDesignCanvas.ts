
import { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { toast } from 'sonner';

interface UseDesignCanvasProps {
  activeProduct: string;
  productView: string;
  isDualSided: boolean;
}

export const useDesignCanvas = ({ activeProduct, productView, isDualSided }: UseDesignCanvasProps) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [frontDesign, setFrontDesign] = useState<string | null>(null);
  const [backDesign, setBackDesign] = useState<string | null>(null);
  const [designComplete, setDesignComplete] = useState<Record<string, boolean>>({
    front: false,
    back: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const cleanupCanvas = () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setCanvas(null);
        setCanvasInitialized(false);
      }
    };

    const initCanvas = () => {
      cleanupCanvas();
      const canvasElement = document.getElementById('design-canvas') as HTMLCanvasElement;
      if (!canvasElement) {
        console.error('Canvas element not found');
        return;
      }
      
      try {
        // Set canvas dimensions based on product type and view
        let canvasWidth = 400;
        let canvasHeight = 400;
        
        if (activeProduct === 'tshirt') {
          canvasWidth = 400;
          canvasHeight = 500;
        } else if (activeProduct === 'mug') {
          canvasWidth = 300;
          canvasHeight = 300;
        } else if (activeProduct === 'cap') {
          canvasWidth = 350;
          canvasHeight = 300;
        }
        
        const fabricCanvas = new fabric.Canvas('design-canvas', {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#ffffff'
        });
        
        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas);
        setCanvasInitialized(true);
        
        const initialState = JSON.stringify(fabricCanvas.toJSON());
        setUndoStack([initialState]);
        setRedoStack([]);

        fabricCanvas.on('object:modified', () => {
          saveCanvasState(fabricCanvas);
          updateDesignImage(fabricCanvas);
          checkDesignStatus(fabricCanvas);
        });

        fabricCanvas.on('object:added', () => {
          checkDesignStatus(fabricCanvas);
        });
        
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };
    
    const timer = setTimeout(() => {
      initCanvas();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      cleanupCanvas();
    };
  }, [activeProduct]);

  useEffect(() => {
    if (canvasInitialized && fabricCanvasRef.current) {
      addProductBackgroundImage(fabricCanvasRef.current);
    }
  }, [activeProduct, productView, canvasInitialized]);

  const addProductBackgroundImage = (canvas: fabric.Canvas) => {
    if (!canvas) {
      console.error('Canvas is not initialized');
      return;
    }
    
    try {
      const designObjects = canvas.getObjects().filter(obj => !obj.data?.isBackground);
      canvas.clear();
      
      let imgSrc = '';
      
      if (activeProduct === 'tshirt') {
        switch (productView) {
          case 'front':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/front.png';
            break;
          case 'back':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/back.png';
            break;
          case 'left':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/left.png';
            break;
          case 'right':
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/right.png';
            break;
          default:
            imgSrc = '/lovable-uploads/design-sub-page/tshirt-print.png';
        }
      } else if (activeProduct === 'mug') {
        imgSrc = '/lovable-uploads/design-tool-page/mug-print.png';
      } else if (activeProduct === 'cap') {
        imgSrc = '/lovable-uploads/design-tool-page/cap-print.png';
      }
      
      const img = new Image();
      img.onload = () => {
        fabric.Image.fromURL(imgSrc, (fabricImg) => {
          const scaleFactor = Math.min(
            canvas.getWidth() / fabricImg.width!, 
            canvas.getHeight() / fabricImg.height!
          ) * 0.9;
          
          fabricImg.scale(scaleFactor);
          fabricImg.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            data: { isBackground: true }
          });
          
          canvas.add(fabricImg);
          canvas.sendToBack(fabricImg);
          designObjects.forEach(obj => canvas.add(obj));
          canvas.renderAll();
          updateDesignImage(canvas);
          checkDesignStatus(canvas);
        });
      };
      
      img.onerror = () => {
        console.error(`Error loading ${imgSrc}`);
        canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
        designObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
      };
      
      img.src = imgSrc;
      
    } catch (error) {
      console.error('Error adding background image:', error);
    }
  };

  const updateDesignImage = (canvasInstance: fabric.Canvas | null = null) => {
    const canvasToUse = canvasInstance || canvas;
    if (!canvasToUse) return;
    
    try {
      const dataUrl = canvasToUse.toDataURL({
        format: 'png',
        quality: 1
      });
      setDesignImage(dataUrl);
    } catch (error) {
      console.error('Error updating design image:', error);
    }
  };

  const saveCanvasState = (canvasInstance: fabric.Canvas | null = null) => {
    const canvasToUse = canvasInstance || canvas;
    if (!canvasToUse) return;
    
    try {
      const newState = JSON.stringify(canvasToUse.toJSON());
      setUndoStack(prev => [...prev, newState]);
      setRedoStack([]);
      updateDesignImage(canvasToUse);
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  const checkDesignStatus = (canvasInstance: fabric.Canvas | null = null) => {
    const canvasToUse = canvasInstance || canvas;
    if (!canvasToUse) return false;
    
    try {
      // Get all objects except the background
      const designObjects = canvasToUse.getObjects().filter(obj => !obj.data?.isBackground);
      const hasElements = designObjects.length > 0;
      
      if (isDualSided) {
        if (productView === 'front') {
          setDesignComplete(prev => ({...prev, front: hasElements}));
        } else if (productView === 'back') {
          setDesignComplete(prev => ({...prev, back: hasElements}));
        }
      } else {
        setDesignComplete({front: hasElements, back: false});
      }
      
      return hasElements;
    } catch (error) {
      console.error('Error checking for design elements:', error);
      return false;
    }
  };

  const hasDesignElements = () => {
    if (!canvas) return false;
    
    try {
      // Get all objects except the background
      const designObjects = canvas.getObjects().filter(obj => !obj.data?.isBackground);
      return designObjects.length > 0;
    } catch (error) {
      console.error('Error checking for design elements:', error);
      return false;
    }
  };

  const loadDesignToCanvas = (designDataUrl: string) => {
    if (!canvas) return;
    
    try {
      fabric.Image.fromURL(designDataUrl, (img) => {
        const backgroundImage = canvas.getObjects().find(obj => obj.data?.isBackground);
        canvas.clear();
        if (backgroundImage) {
          canvas.add(backgroundImage);
          canvas.sendToBack(backgroundImage);
        }
        
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          selectable: true
        });
        canvas.add(img);
        canvas.renderAll();
        updateDesignImage();
        checkDesignStatus();
      });
    } catch (error) {
      console.error('Error loading design to canvas:', error);
    }
  };

  const addTextToCanvas = (text: string, color: string, font: string) => {
    if (!canvas) return;
    
    try {
      const textObj = new fabric.Text(text, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontFamily: font,
        fill: color,
        fontSize: 30,
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage(canvas);
      checkDesignStatus(canvas);
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const handleAddImage = (imageUrl: string) => {
    if (!canvas) return;
    
    try {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale image to fit within canvas
        const scaleFactor = Math.min(
          (canvas.width! * 0.5) / img.width!,
          (canvas.height! * 0.5) / img.height!
        );
        
        img.scale(scaleFactor);
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveCanvasState(canvas);
        updateDesignImage(canvas);
        checkDesignStatus(canvas);
      });
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  const addEmojiToCanvas = (emoji: string) => {
    if (!canvas) return;
    
    try {
      const text = new fabric.Text(emoji, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fontSize: 60,
        originX: 'center',
        originY: 'center',
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage(canvas);
      checkDesignStatus(canvas);
    } catch (error) {
      console.error('Error adding emoji:', error);
    }
  };

  return {
    canvas,
    canvasRef,
    fabricCanvasRef,
    designImage,
    canvasInitialized,
    undoStack,
    redoStack,
    frontDesign,
    backDesign,
    designComplete,
    setCanvas,
    setUndoStack,
    setRedoStack,
    setDesignImage,
    setCanvasInitialized,
    setFrontDesign,
    setBackDesign,
    setDesignComplete,
    addProductBackgroundImage,
    updateDesignImage,
    saveCanvasState,
    checkDesignStatus,
    hasDesignElements,
    loadDesignToCanvas,
    addTextToCanvas,
    handleAddImage,
    addEmojiToCanvas
  };
};
