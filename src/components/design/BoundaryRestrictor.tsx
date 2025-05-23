
import React, { useEffect } from 'react';
import { fabric } from 'fabric';

interface BoundaryRestrictorProps {
  canvas: fabric.Canvas | null;
  boundaryId?: string;
}

const BoundaryRestrictor: React.FC<BoundaryRestrictorProps> = ({ canvas, boundaryId = 'design-boundary' }) => {
  useEffect(() => {
    if (!canvas) return;
    
    // Get the boundary element dimensions
    const boundaryElement = document.getElementById(boundaryId);
    if (!boundaryElement) {
      console.error(`Boundary element with id "${boundaryId}" not found`);
      return;
    }
    
    // Calculate boundary coordinates based on canvas zoom and pan
    const calculateBoundaryCoords = () => {
      const boundaryRect = boundaryElement.getBoundingClientRect();
      const canvasRect = canvas.getElement().getBoundingClientRect();
      
      // Get boundary position relative to canvas
      const relativeLeft = boundaryRect.left - canvasRect.left;
      const relativeTop = boundaryRect.top - canvasRect.top;
      
      return {
        left: relativeLeft / canvas.getZoom(),
        top: relativeTop / canvas.getZoom(),
        right: (relativeLeft + boundaryRect.width) / canvas.getZoom(),
        bottom: (relativeTop + boundaryRect.height) / canvas.getZoom(),
        width: boundaryRect.width / canvas.getZoom(),
        height: boundaryRect.height / canvas.getZoom()
      };
    };
    
    // Restrict objects to boundary during movement
    const restrictToBoundary = (e: fabric.IEvent) => {
      const boundary = calculateBoundaryCoords();
      const target = e.target;
      
      if (!target) return;
      
      // Get the current object's bounding box
      const objBounds = target.getBoundingRect();
      const objLeft = target.left ?? 0;
      const objTop = target.top ?? 0;
      const objWidth = objBounds.width;
      const objHeight = objBounds.height;
      
      // Calculate limits
      let newLeft = objLeft;
      let newTop = objTop;
      
      // Restrict horizontally
      if (objLeft < boundary.left) {
        newLeft = boundary.left;
      } else if (objLeft + objWidth > boundary.right) {
        newLeft = boundary.right - objWidth;
      }
      
      // Restrict vertically
      if (objTop < boundary.top) {
        newTop = boundary.top;
      } else if (objTop + objHeight > boundary.bottom) {
        newTop = boundary.bottom - objHeight;
      }
      
      // Update position if needed
      if (newLeft !== objLeft || newTop !== objTop) {
        target.set({
          left: newLeft,
          top: newTop
        });
        
        target.setCoords();
        canvas.renderAll();
      }
    };
    
    // Add event listeners
    canvas.on('object:moving', restrictToBoundary);
    canvas.on('object:scaling', restrictToBoundary);
    canvas.on('object:modified', restrictToBoundary);
    
    // Handle adding new objects
    canvas.on('object:added', (e) => {
      const boundary = calculateBoundaryCoords();
      const target = e.target;
      
      if (!target) return;
      
      // Center the object within the boundary if it's a new object
      if (!target.data?.positioned) {
        target.set({
          left: boundary.left + boundary.width / 2,
          top: boundary.top + boundary.height / 2,
          data: { ...target.data, positioned: true }
        });
        
        target.setCoords();
        canvas.renderAll();
      }
      
      // Initial boundary check
      restrictToBoundary(e);
    });
    
    return () => {
      // Clean up event listeners
      canvas.off('object:moving', restrictToBoundary);
      canvas.off('object:scaling', restrictToBoundary);
      canvas.off('object:modified', restrictToBoundary);
      canvas.off('object:added');
    };
  }, [canvas, boundaryId]);
  
  return null; // This is a logic-only component
};

export default BoundaryRestrictor;
