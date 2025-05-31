
import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useColor } from '@/context/ColorContext';
import { useFont } from '@/context/FontContext';
import { useImage } from '@/context/ImageContext';
import { useText } from '@/context/TextContext';
import { useEmoji } from '@/context/EmojiContext';
import BoundaryRestrictor from './BoundaryRestrictor';
import CanvasControls from './CanvasControls';
import BoundaryBox from '../customization/BoundaryBox';
import CanvasBackground from './CanvasBackground';

interface DesignCanvasProps {
  activeProduct?: string;
  productView?: string;
  canvas?: fabric.Canvas | null;
  setCanvas?: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>;
  undoStack?: string[];
  redoStack?: string[];
  setUndoStack?: React.Dispatch<React.SetStateAction<string[]>>;
  setRedoStack?: React.Dispatch<React.SetStateAction<string[]>>;
  setDesignImage?: React.Dispatch<React.SetStateAction<string | undefined>>;
  setCanvasInitialized?: React.Dispatch<React.SetStateAction<boolean>>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef?: React.MutableRefObject<fabric.Canvas | null>;
  setDesignComplete?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  designComplete?: Record<string, boolean>;
  checkDesignStatus?: (canvasInstance?: fabric.Canvas | null) => boolean;
  undo?: () => void;
  redo?: () => void;
  clearCanvas?: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = (props) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const [localCanvas, setLocalCanvas] = useState<fabric.Canvas | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const { selectedColor } = useColor();
  const { selectedFont } = useFont();
  const { selectedImage } = useImage();
  const { text, setText } = useText();
  const { selectedEmoji } = useEmoji();
  
  // Use provided refs or local refs if not provided
  const canvasRef = props.canvasRef || localCanvasRef;
  const canvas = props.canvas || localCanvas;
  const setCanvas = props.setCanvas || setLocalCanvas;
  const undoStack = props.undoStack || [];
  const redoStack = props.redoStack || [];

  useEffect(() => {
    const initializeCanvas = () => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        console.error('Canvas element not found, retrying...');
        setTimeout(initializeCanvas, 100);
        return;
      }

      try {
        // Dispose existing canvas if any
        if (canvas) {
          canvas.dispose();
        }

        const newCanvas = new fabric.Canvas(canvasElement, {
          backgroundColor: 'black',
          height: 400,
          width: 400,
          preserveObjectStacking: true,
          selection: true,
          renderOnAddRemove: true,
          allowTouchScrolling: false,
          imageSmoothingEnabled: false,
        });

        // Enable object selection and manipulation
        newCanvas.selection = true;
        newCanvas.skipTargetFind = false;
        newCanvas.selectable = true;

        setCanvas(newCanvas);
        setCanvasReady(true);
        
        if (props.setCanvasInitialized) {
          props.setCanvasInitialized(true);
        }

        console.log('Canvas initialized successfully');
      } catch (error) {
        console.error('Error initializing canvas:', error);
        setTimeout(initializeCanvas, 100);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeCanvas, 100);

    return () => {
      clearTimeout(timer);
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!canvas || !canvasReady) return;

    const addTextToCanvas = () => {
      if (!text.trim()) return;

      const textObject = new fabric.IText(text, {
        left: 250,
        top: 300,
        fontSize: 24,
        fontFamily: selectedFont,
        fill: selectedColor,
        selectable: true,
        evented: true,
        hasRotatingPoint: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        borderColor: '#4169E1',
        cornerColor: '#4169E1',
        cornerSize: 12,
        transparentCorners: false,
        borderScaleFactor: 2,
        data: {
          type: 'text',
        },
      });

      canvas.add(textObject);
      canvas.setActiveObject(textObject);
      canvas.renderAll();
      setText('');
      
      // Save canvas state if callback provided
      if (props.setUndoStack && props.undoStack) {
        props.setUndoStack([...props.undoStack, JSON.stringify(canvas.toJSON())]);
      }
      
      // Update design status if callback provided
      if (props.checkDesignStatus) {
        props.checkDesignStatus(canvas);
      }
    };

    addTextToCanvas();
  }, [text, selectedFont, selectedColor, canvas, canvasReady, setText]);

  useEffect(() => {
    if (!canvas || !canvasReady || !selectedImage) return;

    const addImageToCanvas = (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: 250,
          top: 300,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
          evented: true,
          hasRotatingPoint: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          borderColor: '#4169E1',
          cornerColor: '#4169E1',
          cornerSize: 12,
          transparentCorners: false,
          borderScaleFactor: 2,
          data: {
            type: 'image',
          },
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        // Save canvas state if callback provided
        if (props.setUndoStack && props.undoStack) {
          props.setUndoStack([...props.undoStack, JSON.stringify(canvas.toJSON())]);
        }
        
        // Update design status if callback provided
        if (props.checkDesignStatus) {
          props.checkDesignStatus(canvas);
        }
      });
    };

    addImageToCanvas(selectedImage);
  }, [selectedImage, canvas, canvasReady]);

  useEffect(() => {
    if (!canvas || !canvasReady || !selectedEmoji) return;

    const addEmojiToCanvas = (emoji: string) => {
      const emojiObject = new fabric.IText(emoji, {
        left: 250,
        top: 300,
        fontSize: 48,
        selectable: true,
        evented: true,
        hasRotatingPoint: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        borderColor: '#4169E1',
        cornerColor: '#4169E1',
        cornerSize: 12,
        transparentCorners: false,
        borderScaleFactor: 2,
        data: {
          type: 'emoji',
        },
      });
      
      canvas.add(emojiObject);
      canvas.setActiveObject(emojiObject);
      canvas.renderAll();
      
      // Save canvas state if callback provided
      if (props.setUndoStack && props.undoStack) {
        props.setUndoStack([...props.undoStack, JSON.stringify(canvas.toJSON())]);
      }
      
      // Update design status if callback provided
      if (props.checkDesignStatus) {
        props.checkDesignStatus(canvas);
      }
    };

    addEmojiToCanvas(selectedEmoji);
  }, [selectedEmoji, canvas, canvasReady]);

  const handleUndo = () => {
    if (props.undo) {
      props.undo();
    }
  };

  const handleRedo = () => {
    if (props.redo) {
      props.redo();
    }
  };

  const handleClear = () => {
    if (props.clearCanvas) {
      props.clearCanvas();
    }
  };

  return (
    <div className="design-canvas-container">
      <CanvasControls
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        canUndo={undoStack.length > 1}
        canRedo={redoStack.length > 0}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-lg"
          style={{ touchAction: 'none' }}
        />
        {!canvasReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-gray-600">Loading canvas...</div>
          </div>
        )}
        <BoundaryBox 
          productType={props.activeProduct || 'tshirt'} 
          view={props.productView || 'front'} 
        />
        <CanvasBackground
          canvas={canvas}
          productType={props.activeProduct || 'tshirt'}
          view={props.productView || 'front'}
        />
        <BoundaryRestrictor canvas={canvas} boundaryId="design-boundary" />
      </div>
    </div>
  );
};

export default DesignCanvas;
