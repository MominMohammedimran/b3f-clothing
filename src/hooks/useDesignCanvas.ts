
import { useRef, useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';

export interface UseDesignCanvasProps {
  activeProduct?: string;
}

export const useDesignCanvas = (props: UseDesignCanvasProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [frontDesign, setFrontDesign] = useState<string | null>(null);
  const [backDesign, setBackDesign] = useState<string | null>(null);
  const [designComplete, setDesignComplete] = useState<Record<string, boolean>>({front: false, back: false});

  const initCanvas = useCallback(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      console.error('Canvas element not found');
      return null;
    }

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    try {
      const fabricCanvas = new fabric.Canvas(canvasElement, {
        width: 500,
        height: 600,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = fabricCanvas;
      setCanvas(fabricCanvas);
      setCanvasInitialized(true);
     return fabricCanvas;
    } catch (error) {
      console.error('Error initializing canvas:', error);
      return null;
    }
  }, []);

  const exportCanvas = useCallback(() => {
    if (!canvas) return null;
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
  }, [canvas]);

  const clearCanvas = useCallback(() => {
    if (canvas) {
      canvas.clear();
      canvas.renderAll();
    }
  }, [canvas]);

  const addTextToCanvas = useCallback((text: string, options: any = {}) => {
    if (!canvas) return;
    
    const fabricText = new fabric.Text(text, {
      left: 50,
      top: 50,
      fontSize: options.fontSize || 20,
      fill: options.color || '#000000',
      fontFamily: options.fontFamily || 'Arial',
      ...options
    });
    
    canvas.add(fabricText);
    canvas.renderAll();
  }, [canvas]);

  const handleAddImage = useCallback((imageUrl: string) => {
    if (!canvas) return;
    
    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({
        left: 50,
        top: 50,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      canvas.add(img);
      canvas.renderAll();
    });
  }, [canvas]);

  const addEmojiToCanvas = useCallback((emoji: string) => {
    if (!canvas) return;
    
    const emojiText = new fabric.Text(emoji, {
      left: 50,
      top: 50,
      fontSize: 40,
    });
    
    canvas.add(emojiText);
    canvas.renderAll();
  }, [canvas]);

  const hasDesignElements = useCallback(() => {
    return canvas ? canvas.getObjects().length > 0 : false;
  }, [canvas]);

  const checkDesignStatus = useCallback((canvasInstance?: fabric.Canvas | null) => {
    const targetCanvas = canvasInstance || canvas;
    const hasElements = targetCanvas ? targetCanvas.getObjects().length > 0 : false;
    return hasElements;
  }, [canvas]);

  const loadDesignToCanvas = useCallback((designData: any) => {
    if (!canvas || !designData) return;
    
    canvas.loadFromJSON(designData, () => {
      canvas.renderAll();
    });
  }, [canvas]);

  const undo = useCallback(() => {
    if (undoStack.length > 0 && canvas) {
      const currentState = JSON.stringify(canvas.toJSON());
      setRedoStack(prev => [...prev, currentState]);
      
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
      });
    }
  }, [canvas, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length > 0 && canvas) {
      const currentState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, currentState]);
      
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
      });
    }
  }, [canvas, redoStack]);

  useEffect(() => {
    if (canvasRef.current && !canvasInitialized) {
      initCanvas();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [initCanvas, canvasInitialized]);

  return {
    canvas,
    canvasRef,
    canvasInitialized,
    exportCanvas,
    clearCanvas,
    fabricCanvasRef,
    designImage,
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
    hasDesignElements,
    loadDesignToCanvas,
    addTextToCanvas,
    handleAddImage,
    addEmojiToCanvas,
    checkDesignStatus,
    undo,
    redo,
  };
};
