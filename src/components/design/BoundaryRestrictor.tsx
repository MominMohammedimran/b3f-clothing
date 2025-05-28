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
      
      if (!target || target.data?.isBackground) return;
      
      // Get the object's bounding rect
      const objBounds = target.getBoundingRect();
      
      // Calculate new position ensuring object stays within boundary
      let newLeft = target.left ?? 0;
      let newTop = target.top ?? 0;
      
      // Ensure object doesn't go outside boundary
      const objHalfWidth = objBounds.width / 2;
      const objHalfHeight = objBounds.height / 2;
      
      // Horizontal constraints
      if (newLeft - objHalfWidth < boundary.left) {
        newLeft = boundary.left + objHalfWidth;
      } else if (newLeft + objHalfWidth > boundary.right) {
        newLeft = boundary.right - objHalfWidth;
      }
      
      // Vertical constraints
      if (newTop - objHalfHeight < boundary.top) {
        newTop = boundary.top + objHalfHeight;
      } else if (newTop + objHalfHeight > boundary.bottom) {
        newTop = boundary.bottom - objHalfHeight;
      }
      
      // Only update if position changed
      if (newLeft !== target.left || newTop !== target.top) {
        target.set({
          left: newLeft,
          top: newTop
        });
        target.setCoords();
      }
    };
    
    // Handle object scaling to keep within bounds
    const restrictScaling = (e: fabric.IEvent) => {
      const target = e.target;
      if (!target || target.data?.isBackground) return;
      
      const boundary = calculateBoundaryCoords();
      const objBounds = target.getBoundingRect();
      
      // Check if scaled object exceeds boundary
      if (objBounds.left < boundary.left || 
          objBounds.top < boundary.top || 
          objBounds.left + objBounds.width > boundary.right || 
          objBounds.top + objBounds.height > boundary.bottom) {
        
        // Calculate max scale that fits within boundary
        const maxScaleX = boundary.width / (objBounds.width / (target.scaleX || 1));
        const maxScaleY = boundary.height / (objBounds.height / (target.scaleY || 1));
        const maxScale = Math.min(maxScaleX, maxScaleY, target.scaleX || 1, target.scaleY || 1);
        
        target.set({
          scaleX: maxScale,
          scaleY: maxScale
        });
        target.setCoords();
      }
    };
    
    // Center new objects within boundary
    const centerNewObject = (e: fabric.IEvent) => {
      const boundary = calculateBoundaryCoords();
      const target = e.target;
      
      if (!target || target.data?.isBackground || target.data?.positioned) return;
      
      // Center the object within the boundary
      target.set({
        left: boundary.left + boundary.width / 2,
        top: boundary.top + boundary.height / 2,
        data: { ...target.data, positioned: true }
      });
      
      target.setCoords();
    };
    
    // Add event listeners
    canvas.on('object:moving', restrictToBoundary);
    canvas.on('object:scaling', restrictScaling);
    canvas.on('object:modified', restrictToBoundary);
    canvas.on('object:added', centerNewObject);
    
    return () => {
      // Clean up event listeners
      canvas.off('object:moving', restrictToBoundary);
      canvas.off('object:scaling', restrictScaling);
      canvas.off('object:modified', restrictToBoundary);
      canvas.off('object:added', centerNewObject);
    };
  }, [canvas, boundaryId]);
  
  return null; // This is a logic-only component
};

export default BoundaryRestrictor;
