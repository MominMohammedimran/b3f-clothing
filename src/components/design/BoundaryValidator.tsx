
import { fabric } from 'fabric';
import { toast } from 'sonner';

export const validateObjectsWithinBoundary = (canvas: fabric.Canvas, boundaryId: string): boolean => {
  if (!canvas) return false;
  
  const boundaryElement = document.getElementById(boundaryId);
  if (!boundaryElement) return false;

  const boundaryRect = boundaryElement.getBoundingClientRect();
  const canvasElement = canvas.getElement();
  const canvasRect = canvasElement.getBoundingClientRect();

  const boundary = {
    left: boundaryRect.left - canvasRect.left,
    top: boundaryRect.top - canvasRect.top,
    width: boundaryRect.width,
    height: boundaryRect.height
  };

  const objects = canvas.getObjects();
  
  for (const obj of objects) {
    if (obj.data?.isBackground) continue;
    
    const objBounds = obj.getBoundingRect();
    
    if (objBounds.left < boundary.left ||
        objBounds.top < boundary.top ||
        objBounds.left + objBounds.width > boundary.left + boundary.width ||
        objBounds.top + objBounds.height > boundary.top + boundary.height) {
      return false;
    }
  }
  
  return true;
};

export const showBoundaryValidationError = () => {
  toast.error('Design elements outside boundary', {
    description: 'Please move all text, images, and emojis within the dotted design area before proceeding.'
  });
};

export const moveObjectsIntoBoundary = (canvas: fabric.Canvas, boundaryId: string): void => {
  if (!canvas) return;
  
  const boundaryElement = document.getElementById(boundaryId);
  if (!boundaryElement) return;

  const boundaryRect = boundaryElement.getBoundingClientRect();
  const canvasElement = canvas.getElement();
  const canvasRect = canvasElement.getBoundingClientRect();

  // Calculate boundary relative to canvas
  const boundary = {
    left: boundaryRect.left - canvasRect.left,
    top: boundaryRect.top - canvasRect.top,
    width: boundaryRect.width,
    height: boundaryRect.height
  };

  const objects = canvas.getObjects();
  
  objects.forEach(obj => {
    // Skip background objects
    if (obj.data?.isBackground) return;
    
    const objBounds = obj.getBoundingRect();
    let newLeft = obj.left;
    let newTop = obj.top;
    
    // Adjust horizontal position
    if (objBounds.left < boundary.left) {
      newLeft = obj.left! + (boundary.left - objBounds.left);
    } else if (objBounds.left + objBounds.width > boundary.left + boundary.width) {
      newLeft = obj.left! - ((objBounds.left + objBounds.width) - (boundary.left + boundary.width));
    }
    
    // Adjust vertical position
    if (objBounds.top < boundary.top) {
      newTop = obj.top! + (boundary.top - objBounds.top);
    } else if (objBounds.top + objBounds.height > boundary.top + boundary.height) {
      newTop = obj.top! - ((objBounds.top + objBounds.height) - (boundary.top + boundary.height));
    }
    
    // Update object position if needed
    if (newLeft !== obj.left || newTop !== obj.top) {
      obj.set({
        left: newLeft,
        top: newTop
      });
    }
  });
  
  canvas.renderAll();
};
