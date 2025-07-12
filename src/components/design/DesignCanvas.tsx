import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useColor } from '@/context/ColorContext';
import { useFont } from '@/context/FontContext';
import { useImage } from '@/context/ImageContext';
import { useText } from '@/context/TextContext';
import { useEmoji } from '@/context/EmojiContext';
import BoundaryRestrictor from './BoundaryRestrictor';
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
  const [localUndoStack, setLocalUndoStack] = useState<string[]>([]);
  const [localRedoStack, setLocalRedoStack] = useState<string[]>([]);
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
  const undoStack = props.undoStack || localUndoStack;
  const redoStack = props.redoStack || localRedoStack;
  const setUndoStack = props.setUndoStack || setLocalUndoStack;
  const setRedoStack = props.setRedoStack || setLocalRedoStack;

  // Get canvas dimensions based on product and view
  const getCanvasDimensions = (productType?: string, view?: string) => {
    if (productType === 'photo_frame') {
       switch(view) {
      case '8X12inch':
        return { width: 300, height:350 };
      case '12x16inch':
        return { width: 300, height: 320 };
      case '5x7 inch':
        return { width: 300, height: 320 };
      default:
        return { width: 300, height: 320 };
    }
    }
    return { width: 300, height: 320 };
  };

  // Save state function for undo/redo
  const saveState = () => {
    if (canvas) {
      const currentState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, currentState]);
      setRedoStack([]); // Clear redo stack when new action is performed
    }
  };

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

        const dimensions = getCanvasDimensions(props.activeProduct, props.productView);
        
        const newCanvas = new fabric.Canvas(canvasElement, {
          backgroundColor: 'black',
          height: dimensions.height,
          width: dimensions.width,
          preserveObjectStacking: true,
          selection: true,
          renderOnAddRemove: true,
          allowTouchScrolling: false,
          imageSmoothingEnabled: true,
          enableRetinaScaling: true,
          devicePixelRatio: window.devicePixelRatio || 1,
        });

        // Enhanced desktop-friendly object styling with better cursors
        fabric.Object.prototype.set({
          cornerStyle: 'arrow',
          cornerSize: 10,
          transparentCorners: false,
          borderScaleFactor: 2,
          borderColor: '#4169E1',
          cornerColor: '#4169E1',
          cornerStrokeColor: '#ffffff',
          borderDashArray: [5, 5],
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          selectable: true,
          evented: true,
          hoverCursor: 'move',
          moveCursor: 'move',
          rotatingPointOffset: 40,
          centeredScaling: false,
          centeredRotation: true,
        });

        fabric.Object.prototype.controls.mtr = new fabric.Control({
          x: 0,
          y: -0.5,
          offsetY: -30,
          cursorStyle: 'crosshair',
          actionHandler: fabric.controlsUtils.rotationWithSnapping,
          cornerSize: 28,
          render: (ctx, left, top, styleOverride, fabricObject) => {
            ctx.save();
            ctx.translate(left, top);

            // Outer circle
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#4169E1';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.closePath();

            // Draw a refresh arrow
            ctx.beginPath();
            ctx.arc(0, 0, 6, Math.PI * 0.2, Math.PI * 1.4, false);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(4, -6);
            ctx.lineTo(8, -8);
            ctx.lineTo(6, -8);
            ctx.fillStyle = 'white';
            ctx.fill();

            ctx.restore();
          }
        });

        // Set up event listeners for undo/redo functionality
        newCanvas.on('object:added', () => saveState());
        newCanvas.on('object:removed', () => saveState());
        newCanvas.on('object:modified', () => saveState());

        // Set custom cursors for different interactions
        newCanvas.hoverCursor = 'move';
        newCanvas.defaultCursor = 'default';
        newCanvas.freeDrawingCursor = 'crosshair';
        newCanvas.rotationCursor = 'grabbing';

        // Enhanced object movement with smooth cursor feedback
        newCanvas.on('object:moving', function(e) {
          const obj = e.target;
          if (obj) {
            newCanvas.setCursor('grabbing');
            obj.animate('left', obj.left, {
              duration: 50,
              easing: fabric.util.ease.easeOutQuad,
              onChange: () => newCanvas.renderAll()
            });
            obj.animate('top', obj.top, {
              duration: 50,
              easing: fabric.util.ease.easeOutQuad,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        // Enhanced scaling with proper cursor management
        newCanvas.on('object:scaling', function(e) {
          const obj = e.target;
          if (obj) {
            newCanvas.setCursor('nw-resize');
            obj.animate('scaleX', obj.scaleX, {
              duration: 100,
              easing: fabric.util.ease.easeOutQuart,
              onChange: () => newCanvas.renderAll()
            });
            obj.animate('scaleY', obj.scaleY, {
              duration: 100,
              easing: fabric.util.ease.easeOutQuart,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        // Enhanced rotation with cursor feedback
        newCanvas.on('object:rotating', function(e) {
          const obj = e.target;
          if (obj) {
            newCanvas.setCursor('grabbing');
            obj.animate('angle', obj.angle, {
              duration: 150,
              easing: fabric.util.ease.easeOutCirc,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        // Mouse hover effects for better desktop UX
        newCanvas.on('mouse:over', function(e) {
          if (e.target) {
            newCanvas.setCursor('move');
            e.target.animate('opacity', 0.9, {
              duration: 100,
              easing: fabric.util.ease.easeInOut,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        newCanvas.on('mouse:out', function(e) {
          if (e.target && !newCanvas.getActiveObject()) {
            newCanvas.setCursor('default');
            e.target.animate('opacity', 1, {
              duration: 100,
              easing: fabric.util.ease.easeInOut,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        // Selection events with cursor management
        newCanvas.on('selection:created', function(e) {
          const obj = e.target;
          if (obj) {
            newCanvas.setCursor('move');
            obj.animate('opacity', 0.95, {
              duration: 150,
              easing: fabric.util.ease.easeInOut,
              onChange: () => newCanvas.renderAll()
            });
          }
        });

        newCanvas.on('selection:cleared', function(e) {
          newCanvas.setCursor('default');
          newCanvas.getObjects().forEach(obj => {
            obj.animate('opacity', 1, {
              duration: 150,
              easing: fabric.util.ease.easeInOut,
              onChange: () => newCanvas.renderAll()
            });
          });
        });

        // Handle mouse down for better interaction feedback
        newCanvas.on('mouse:down', function(e) {
          if (e.target) {
            newCanvas.setCursor('grabbing');
          }
        });

        // Handle mouse up to reset cursor
        newCanvas.on('mouse:up', function(e) {
          if (e.target) {
            newCanvas.setCursor('move');
          } else {
            newCanvas.setCursor('default');
          }
        });

        // Double-click to enter edit mode for text objects
        newCanvas.on('mouse:dblclick', function(e) {
          if (e.target && e.target.type === 'i-text') {
            e.target.enterEditing();
            e.target.selectAll();
          }
        });

        setCanvas(newCanvas);
        setCanvasReady(true);
        
        // Save initial state
        const initialState = JSON.stringify(newCanvas.toJSON());
        setUndoStack([initialState]);
        
        if (props.setCanvasInitialized) {
          props.setCanvasInitialized(true);
        }

       } catch (error) {
        console.error('Error initializing canvas:', error);
        setTimeout(initializeCanvas, 100);
      }
    };

    const timer = setTimeout(initializeCanvas, 100);

    return () => {
      clearTimeout(timer);
      // Safe canvas disposal
      if (canvas && canvas.getElement && canvas.getElement()) {
        try {
          canvas.dispose();
        } catch (error) {
          console.warn('Canvas disposal error (safe to ignore):', error);
        }
      }
    };
  }, [props.activeProduct, props.productView]);

  useEffect(() => {
    if (!canvas || !canvasReady) return;

    const addTextToCanvas = () => {
      if (!text.trim()) return;

      const textObject = new fabric.IText(text, {
        left: 125,
        top: 150,
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
        cornerSize: 14,
        transparentCorners: false,
        borderScaleFactor: 2,
        hoverCursor: 'move',
        moveCursor: 'move',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        data: {
          type: 'text',
        },
      });

      textObject.set({ opacity: 0, scaleX: 0, scaleY: 0 });
      canvas.add(textObject);
      
      textObject.animate('opacity', 1, {
        duration: 300,
        easing: fabric.util.ease.easeOutBack
      });
      textObject.animate('scaleX', 1, {
        duration: 400,
        easing: fabric.util.ease.easeOutBack
      });
      textObject.animate('scaleY', 1, {
        duration: 400,
        easing: fabric.util.ease.easeOutBack,
        onChange: () => canvas.renderAll()
      });

      canvas.setActiveObject(textObject);
      setText('');
      
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
          left: 125,
          top: 150,
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
          cornerSize: 14,
          transparentCorners: false,
          borderScaleFactor: 2,
          hoverCursor: 'move',
          moveCursor: 'move',
          originX: 'center',
          originY: 'center',
          data: {
            type: 'image',
          },
        });
        
        img.set({ opacity: 0, angle: -90 });
        canvas.add(img);
        
        img.animate('opacity', 1, {
          duration: 500,
          easing: fabric.util.ease.easeOutQuart
        });
        img.animate('angle', 0, {
          duration: 600,
          easing: fabric.util.ease.easeOutBounce,
          onChange: () => canvas.renderAll()
        });
        
        canvas.setActiveObject(img);
        
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
        left: 125,
        top: 150,
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
        cornerSize: 14,
        transparentCorners: false,
        borderScaleFactor: 2,
        hoverCursor: 'move',
        moveCursor: 'move',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        data: {
          type: 'emoji',
        },
      });
      
      emojiObject.set({ opacity: 0, scaleX: 2, scaleY: 2 });
      canvas.add(emojiObject);
      
      emojiObject.animate('opacity', 1, {
        duration: 300,
        easing: fabric.util.ease.easeOutQuart
      });
      emojiObject.animate('scaleX', 1, {
        duration: 500,
        easing: fabric.util.ease.easeOutBounce
      });
      emojiObject.animate('scaleY', 1, {
        duration: 500,
        easing: fabric.util.ease.easeOutBounce,
        onChange: () => canvas.renderAll()
      });
      
      canvas.setActiveObject(emojiObject);
      
      if (props.checkDesignStatus) {
        props.checkDesignStatus(canvas);
      }
    };

    addEmojiToCanvas(selectedEmoji);
  }, [selectedEmoji, canvas, canvasReady]);

  // Enhanced undo/redo/clear functions
  const handleUndo = () => {
    if (undoStack.length > 1 && canvas) {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
        if (props.checkDesignStatus) {
          props.checkDesignStatus(canvas);
        }
      });
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && canvas) {
      const nextState = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, nextState]);
      setRedoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        if (props.checkDesignStatus) {
          props.checkDesignStatus(canvas);
        }
      });
    }
  };

  const handleClear = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = 'black';
      canvas.renderAll();
      
      // Save the cleared state
      const clearedState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, clearedState]);
      setRedoStack([]);
      
      if (props.setDesignComplete) {
        props.setDesignComplete(prev => ({ ...prev, [props.productView || 'front']: false }));
      }
      
      if (props.checkDesignStatus) {
        props.checkDesignStatus(canvas);
      }
    }
  };

  const boundaryId = `design-boundary-${props.activeProduct || 'tshirt'}`;

  return (
    <div className="design-canvas-container">
      <div className="relative justify-items-center">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-lg cursor-default"
          style={{ 
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
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
        <BoundaryRestrictor canvas={canvas} boundaryId={boundaryId} />
      </div>
    </div>
  );
};

export default DesignCanvas;