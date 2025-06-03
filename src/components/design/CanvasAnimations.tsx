
import { fabric } from 'fabric';

export const enableSmoothMovement = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  // Add smooth animations for object movement
  fabric.Object.prototype.animate = function(property: string, value: any, options?: any) {
    const defaultOptions = {
      duration: 300,
      easing: fabric.util.ease.easeOutCubic,
      onChange: () => canvas.renderAll(),
      ...options
    };
    
    return fabric.util.animate({
      startValue: this.get(property),
      endValue: value,
      duration: defaultOptions.duration,
      easing: defaultOptions.easing,
      onChange: (value: any) => {
        this.set(property, value);
        defaultOptions.onChange();
      },
      onComplete: defaultOptions.onComplete
    });
  };

  // Enable smooth selection transitions
  canvas.on('selection:created', (e) => {
    const target = e.selected?.[0];
    if (target) {
      target.animate('opacity', 1, { duration: 200 });
    }
  });

  // Add smooth scaling on hover (optional)
  canvas.on('mouse:over', (e) => {
    if (e.target && e.target.type !== 'rect') { // Don't animate boundary boxes
      e.target.animate('scaleX', (e.target.scaleX || 1) * 1.05, { duration: 150 });
      e.target.animate('scaleY', (e.target.scaleY || 1) * 1.05, { duration: 150 });
    }
  });

  canvas.on('mouse:out', (e) => {
    if (e.target && e.target.type !== 'rect') { // Don't animate boundary boxes
      e.target.animate('scaleX', (e.target.scaleX || 1) / 1.05, { duration: 150 });
      e.target.animate('scaleY', (e.target.scaleY || 1) / 1.05, { duration: 150 });
    }
  });

  // Smooth object movement
  canvas.on('object:moving', (e) => {
    if (e.target) {
      e.target.shadow = new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 3,
        offsetY: 3
      });
    }
  });

  canvas.on('object:modified', (e) => {
    if (e.target) {
      e.target.shadow = null;
      canvas.renderAll();
    }
  });
};

export const animateObjectEntry = (obj: fabric.Object, canvas: fabric.Canvas) => {
  if (!obj || !canvas) return;

  // Start with small scale and fade in
  obj.set({
    scaleX: 0.1,
    scaleY: 0.1,
    opacity: 0
  });

  canvas.add(obj);
  canvas.setActiveObject(obj);

  // Animate to full size and opacity
  obj.animate('scaleX', 1, { duration: 300, easing: fabric.util.ease.easeOutBack });
  obj.animate('scaleY', 1, { duration: 300, easing: fabric.util.ease.easeOutBack });
  obj.animate('opacity', 1, { duration: 300 });
};

export const animateObjectExit = (obj: fabric.Object, canvas: fabric.Canvas, onComplete?: () => void) => {
  if (!obj || !canvas) return;

  obj.animate('scaleX', 0.1, { duration: 200 });
  obj.animate('scaleY', 0.1, { duration: 200 });
  obj.animate('opacity', 0, { 
    duration: 200,
    onComplete: () => {
      canvas.remove(obj);
      if (onComplete) onComplete();
    }
  });
};
