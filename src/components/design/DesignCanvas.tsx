
import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useColor } from '@/context/ColorContext';
import { useFont } from '@/context/FontContext';
import { useImage } from '@/context/ImageContext';
import { useText } from '@/context/TextContext';
import { useEmoji } from '@/context/EmojiContext';
import BoundaryRestrictor from './BoundaryRestrictor';

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
}

const DesignCanvas: React.FC<DesignCanvasProps> = (props) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const [localCanvas, setLocalCanvas] = useState<fabric.Canvas | null>(null);
  const { selectedColor } = useColor();
  const { selectedFont } = useFont();
  const { selectedImage } = useImage();
  const { text, setText } = useText();
  const { selectedEmoji } = useEmoji();
  
  // Use provided refs or local refs if not provided
  const canvasRef = props.canvasRef || localCanvasRef;
  const canvas = props.canvas || localCanvas;
  const setCanvas = props.setCanvas || setLocalCanvas;

  useEffect(() => {
    const initializeCanvas = () => {
      const newCanvas = new fabric.Canvas('design-canvas', {
        backgroundColor: '#fff',
        height: 500,
        width: 500,
        preserveObjectStacking: true,
        selection: true,
        renderOnAddRemove: true,
      });

      setCanvas(newCanvas);
      if (props.setCanvasInitialized) {
        props.setCanvasInitialized(true);
      }
    };

    initializeCanvas();

    return () => {
      canvas?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    const addTextToCanvas = () => {
      if (!text) return;

      const textbox = new fabric.Textbox(text, {
        left: 100,
        top: 100,
        fontSize: 20,
        fontFamily: selectedFont,
        fill: selectedColor,
        hasRotatingPoint: true,
        centerTransform: true,
        data: {
          type: 'text',
        },
      });

      canvas.add(textbox);
      canvas.setActiveObject(textbox);
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
  }, [text, selectedFont, selectedColor, canvas, setText]);

  useEffect(() => {
    if (!canvas || !selectedImage) return;

    const addImageToCanvas = (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          hasRotatingPoint: true,
          centerTransform: true,
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
  }, [selectedImage, canvas]);

  useEffect(() => {
    if (!canvas || !selectedEmoji) return;

    const addEmojiToCanvas = (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          hasRotatingPoint: true,
          centerTransform: true,
          data: {
            type: 'emoji',
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

    addEmojiToCanvas(selectedEmoji);
  }, [selectedEmoji, canvas]);

  return (
    <div className="design-canvas-container relative">
      <canvas
        id="design-canvas"
        ref={canvasRef}
        className="border border-gray-300"
      />
      <div 
        id="design-boundary" 
        className="absolute border-2 border-dashed border-blue-500 pointer-events-none"
        style={{
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          zIndex: 10
        }}
      />
      <BoundaryRestrictor canvas={canvas} boundaryId="design-boundary" />
    </div>
  );
};

export default DesignCanvas;
