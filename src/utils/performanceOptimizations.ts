
// Remove console logs in production for better performance
export const initPerformanceOptimizations = () => {
  if (import.meta.env.PROD) {
    // Disable console logs in production
    const noOp = () => {};
    console.log = noOp;
    console.warn = noOp;
    console.error = noOp;
    console.debug = noOp;
    console.info = noOp;
  }

  // Add additional performance optimizations
  // Enable event passive listeners
  if (typeof window !== 'undefined') {
    try {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options: AddEventListenerOptions | boolean = false
      ) {
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
        
        if (passiveEvents.includes(type)) {
          const newOptions = typeof options === 'object' 
            ? options 
            : { capture: options, passive: true };
            
          originalAddEventListener.call(this, type, listener, newOptions);
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };
    } catch (e) {
      // Silent error if browser doesn't support this optimization
    }
  }
};
