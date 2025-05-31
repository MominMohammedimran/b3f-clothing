
import React, { useEffect } from 'react';
import { fabric } from 'fabric';

interface BoundaryRestrictorProps {
  canvas: fabric.Canvas | null;
  boundaryId: string;
}

const BoundaryRestrictor: React.FC<BoundaryRestrictorProps> = ({ canvas, boundaryId }) => {
  useEffect(() => {
    if (!canvas) return;

    const restrictToBoundary = () => {
      const boundaryElement = document.getElementById(boundaryId);
      
      if (!boundaryElement) {
        console.warn(`Boundary element with id "${boundaryId}" not found`);
        return;
      }

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

      canvas.on('object:moving', function(e) {
        const obj = e.target;
        if (!obj) return;

        const objBounds = obj.getBoundingRect();

        // Restrict horizontal movement
        if (objBounds.left < boundary.left) {
          obj.set('left', obj.left! + (boundary.left - objBounds.left));
        }
        if (objBounds.left + objBounds.width > boundary.left + boundary.width) {
          obj.set('left', obj.left! - ((objBounds.left + objBounds.width) - (boundary.left + boundary.width)));
        }

        // Restrict vertical movement
        if (objBounds.top < boundary.top) {
          obj.set('top', obj.top! + (boundary.top - objBounds.top));
        }
        if (objBounds.top + objBounds.height > boundary.top + boundary.height) {
          obj.set('top', obj.top! - ((objBounds.top + objBounds.height) - (boundary.top + boundary.height)));
        }
      });

      canvas.on('object:scaling', function(e) {
        const obj = e.target;
        if (!obj) return;

        const objBounds = obj.getBoundingRect();

        // Prevent scaling beyond boundary
        if (objBounds.width > boundary.width || objBounds.height > boundary.height) {
          const scaleX = Math.min(boundary.width / objBounds.width, obj.scaleX!);
          const scaleY = Math.min(boundary.height / objBounds.height, obj.scaleY!);
          const scale = Math.min(scaleX, scaleY);
          
          obj.set({
            scaleX: scale,
            scaleY: scale
          });
        }
      });
    };

    // Apply restrictions after a short delay to ensure DOM is ready
    const timer = setTimeout(restrictToBoundary, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [canvas, boundaryId]);

  return null;
};

export default BoundaryRestrictor;
