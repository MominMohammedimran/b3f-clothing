import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Undo, Redo, Trash, X } from 'lucide-react';

interface DesignCanvasProps {
  activeProduct: string;
  productView: string;
  canvas: fabric.Canvas | null;
  setCanvas: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>;
  undoStack: string[];
  redoStack: string[];
  setUndoStack: React.Dispatch<React.SetStateAction<string[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<string[]>>;
  setDesignImage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setCanvasInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  setDesignComplete: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  designComplete: Record<string, boolean>;
  checkDesignStatus: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  activeProduct,
  productView,
  canvas,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
  setDesignImage,
  canvasRef,
  checkDesignStatus,
  designComplete
}) => {
  const handleUndo = () => {
    if (undoStack.length <= 1 || !canvas) return;
    
    try {
      const currentState = undoStack.pop();
      if (currentState && undoStack.length > 0) {
        setRedoStack([...redoStack, currentState]);
        const prevState = undoStack[undoStack.length - 1];
        canvas.loadFromJSON(JSON.parse(prevState), canvas.renderAll.bind(canvas));
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error handling undo:', error);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !canvas) return;
    
    try {
      const stateToRestore = redoStack.pop();
      if (stateToRestore) {
        setUndoStack([...undoStack, stateToRestore]);
        canvas.loadFromJSON(JSON.parse(stateToRestore), canvas.renderAll.bind(canvas));
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error handling redo:', error);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    try {
      // Keep only background object
      const backgroundObject = canvas.getObjects().find(obj => obj.data?.isBackground);
      canvas.clear();
      
      if (backgroundObject) {
        canvas.add(backgroundObject);
        canvas.sendToBack(backgroundObject);
      }
      
      canvas.renderAll();
      saveCanvasState(canvas);
      updateDesignImage();
      checkDesignStatus();
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  };

  const removeSelectedObject = () => {
    if (!canvas) return;
    
    try {
      const activeObject = canvas.getActiveObject();
      if (activeObject && !activeObject.data?.isBackground) {
        canvas.remove(activeObject);
        canvas.renderAll();
        saveCanvasState(canvas);
        updateDesignImage();
        checkDesignStatus();
      }
    } catch (error) {
      console.error('Error removing selected object:', error);
    }
  };

  const saveCanvasState = (canvasInstance: fabric.Canvas) => {
    if (!canvasInstance) return;
    
    try {
      const newState = JSON.stringify(canvasInstance.toJSON());
      setUndoStack(prev => [...prev, newState]);
      setRedoStack([]);
      updateDesignImage();
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  const updateDesignImage = () => {
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      setDesignImage(dataUrl);
    } catch (error) {
      console.error('Error updating design image:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Design Canvas</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            className={`p-2 rounded-md ${
              undoStack.length <= 1 ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded-md ${
              redoStack.length === 0 ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100"
            title="Clear Canvas"
          >
            <Trash size={20} />
          </button>
          <button
            onClick={removeSelectedObject}
            className="p-2 rounded-md text-red-600 bg-red-50 hover:bg-red-100"
            title="Remove Selected Object"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div 
        className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mt-4" 
        style={{ 
          height: activeProduct === 'tshirt' ? '500px' : activeProduct === 'mug' ? '300px' : '300px', 
          width: '100%' 
        }}
      >
        <canvas id="design-canvas" ref={canvasRef}></canvas>
      </div>
      
      {/* Design guidance and status */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-700">Design Status:</h3>
        <ul className="text-sm text-blue-600 mt-1">
          {Object.entries(designComplete).map(([side, isComplete]) => (
            <li key={side} className="flex items-center">
              <span className={`mr-1 ${isComplete ? 'text-green-500' : 'text-gray-400'}`}>
                {isComplete ? '✓' : '○'}
              </span>
              {side.charAt(0).toUpperCase() + side.slice(1)} design {isComplete ? 'complete' : 'incomplete'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DesignCanvas;
