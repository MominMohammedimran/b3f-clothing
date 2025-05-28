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
        let canvasWidth = 500;
        let canvasHeight = 600;
        
        if (activeProduct === 'tshirt') {
          canvasWidth = 500;
          canvasHeight = 600;
        } else if (activeProduct === 'mug') {
          canvasWidth = 400;
          canvasHeight = 400;
        } else if (activeProduct === 'cap') {
          canvasWidth = 450;
          canvasHeight = 350;
        }
        
        const fabricCanvas = new fabric.Canvas('design-canvas', {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true
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
        
        console.log('Canvas initialized successfully');
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
            imgSrc = '/lovable-uploads/design-tool-page/tshirt-sub-images/front.png';
        }
      } else if (activeProduct === 'mug') {
        imgSrc = '/lovable-uploads/design-tool-page/mug-print.png';
      } else if (activeProduct === 'cap') {
        imgSrc = '/lovable-uploads/design-tool-page/cap-print.png';
      }
      
      console.log('Loading background image:', imgSrc);
      
      // Load image with proper error handling and fitting
      fabric.Image.fromURL(imgSrc, (fabricImg) => {
        if (!fabricImg) {
          console.error('Failed to load image:', imgSrc);
          canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
          return;
        }

        // Fit the image to canvas properly
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const imgWidth = fabricImg.width!;
        const imgHeight = fabricImg.height!;
        
        // Calculate scale to fit image to canvas
        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        fabricImg.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          data: { isBackground: true }
        });
        
        canvas.add(fabricImg);
        canvas.sendToBack(fabricImg);
        
        // Re-add design objects with proper properties
        designObjects.forEach(obj => {
          obj.set({
            selectable: true,
            evented: true,
            hasRotatingPoint: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false
          });
          canvas.add(obj);
        });
        
        canvas.renderAll();
        updateDesignImage(canvas);
        checkDesignStatus(canvas);
        console.log('Background image loaded successfully');
      }, { 
        crossOrigin: 'anonymous',
        // Add error handling for failed image loads
        onError: () => {
          console.error('Failed to load background image:', imgSrc);
          canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
        }
      });
      
    } catch (error) {
      console.error('Error adding background image:', error);
      canvas.setBackgroundColor('#f0f0f0', canvas.renderAll.bind(canvas));
    }
  };

  const updateDesignImage = (canvasInstance: fabric.Canvas | null = null) => {
    const canvasToUse = canvasInstance || canvas;
    if (!canvasToUse) return;
    
    try {
      // Get only design objects (exclude background)
      const designObjects = canvasToUse.getObjects().filter(obj => !obj.data?.isBackground);
      
      if (designObjects.length === 0) {
        setDesignImage(undefined);
        return;
      }

      // Create a temporary canvas for preview generation
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasToUse.width!;
      tempCanvas.height = canvasToUse.height!;
      
      const tempFabricCanvas = new fabric.Canvas(tempCanvas, {
        width: canvasToUse.width!,
        height: canvasToUse.height!,
        backgroundColor: 'transparent'
      });

      // Add only design objects to temp canvas
      designObjects.forEach(obj => {
        const clonedObj = fabric.util.object.clone(obj);
        tempFabricCanvas.add(clonedObj);
      });

      tempFabricCanvas.renderAll();

      // Generate preview data URL
      const dataUrl = tempFabricCanvas.toDataURL({
        format: 'png',
        quality: 1
      });

      // Clean up
      tempFabricCanvas.dispose();
      
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

  const undo = () => {
    if (!canvas || undoStack.length <= 1) return;
    
    try {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
        updateDesignImage(canvas);
        checkDesignStatus(canvas);
      });
    } catch (error) {
      console.error('Error during undo:', error);
    }
  };

  const redo = () => {
    if (!canvas || redoStack.length === 0) return;
    
    try {
      const nextState = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, nextState]);
      setRedoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        updateDesignImage(canvas);
        checkDesignStatus(canvas);
      });
    } catch (error) {
      console.error('Error during redo:', error);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    try {
      const backgroundImage = canvas.getObjects().find(obj => obj.data?.isBackground);
      canvas.clear();
      
      if (backgroundImage) {
        canvas.add(backgroundImage);
        canvas.sendToBack(backgroundImage);
      }
      
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage(canvas);
      checkDesignStatus(canvas);
      
      toast.success("Canvas cleared");
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  };

  const checkDesignStatus = (canvasInstance: fabric.Canvas | null = null) => {
    const canvasToUse = canvasInstance || canvas;
    if (!canvasToUse) return false;
    
    try {
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
          selectable: true,
          evented: true,
          hasRotatingPoint: true,
          hasControls: true,
          hasBorders: true
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
        selectable: true,
        evented: true,
        hasRotatingPoint: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false
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
        const scaleFactor = Math.min(
          (canvas.width! * 0.3) / img.width!,
          (canvas.height! * 0.3) / img.height!
        );
        
        img.scale(scaleFactor);
        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
          hasRotatingPoint: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false
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
        selectable: true,
        evented: true,
        hasRotatingPoint: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false
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
    addEmojiToCanvas,
    undo,
    redo,
    clearCanvas
  };
};
