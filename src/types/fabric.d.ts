
// Type declarations for fabric.js
declare namespace fabric {
  export interface FabricObjectOptions {
    id?: string;
    [key: string]: any;
  }
  
  export class Canvas {
    constructor(element: string | HTMLCanvasElement, options?: any);
    add(...objects: Object[]): Canvas;
    remove(object: Object): Canvas;
    getObjects(): Object[];
    renderAll(): Canvas;
    width: number;
    height: number;
    clear(): Canvas;
    loadFromJSON(json: any, callback?: Function): Canvas;
    toJSON(propertiesToInclude?: string[]): any;
    toDataURL(options?: { format?: string; quality?: number; }): string;
    dispose(): void;
    discardActiveObject(): Canvas;
    setActiveObject(object: Object): Canvas;
    getActiveObject(): Object | null;
    on(event: string, handler: Function): Canvas;
    selection: boolean;
    freeDrawingBrush: {
      color: string;
      width: number;
    };
    isDrawingMode: boolean;
    backgroundColor: string;
    setDimensions(dimensions: {width: number, height: number}): Canvas;
  }

  export class Object {
    constructor(options?: FabricObjectOptions);
    set(properties: Record<string, any>): Object;
    get(property: string): any;
    setCoords(): Object;
    id?: string;
    type?: string;
    selectable: boolean;
    evented: boolean;
    lockMovementX: boolean;
    lockMovementY: boolean;
    lockRotation: boolean;
    lockScalingX: boolean;
    lockScalingY: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    flipX: boolean;
    flipY: boolean;
    opacity: number;
    shadow?: Shadow;
    visible: boolean;
    clipTo?: Function;
    stroke?: string;
    strokeWidth?: number;
    backgroundColor?: string;
    fill?: string;
    borderScaleFactor?: number;
    hasRotatingPoint?: boolean;
    centeredRotation?: boolean;
    centeredScaling?: boolean;
    originX?: string;
    originY?: string;
    cornerSize?: number;
    transparentCorners?: boolean;
    hasBorders?: boolean;
    hasControls?: boolean;
    borderColor?: string;
    cornerColor?: string;
    cornerStrokeColor?: string;
    cornerStyle?: string;
    cornerDashArray?: Array<number>;
    selectionBackgroundColor?: string;
    dirty?: boolean;
    remove(): void;
    setOptions(options: FabricObjectOptions): void;
  }

  export class IText extends Object {
    constructor(text: string, options?: FabricObjectOptions);
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    fontStyle: string;
    textAlign: string;
    lineHeight: number;
    textBackgroundColor: string;
    charSpacing: number;
    styles: any;
  }

  export class Image extends Object {
    constructor(element: HTMLImageElement, options?: FabricObjectOptions);
    static fromURL(url: string, callback: (image: Image) => void, options?: FabricObjectOptions): void;
  }

  export class Shadow {
    constructor(options?: {
      color?: string;
      blur?: number;
      offsetX?: number;
      offsetY?: number;
    });
  }
  
  export class Group extends Object {
    constructor(objects: Object[], options?: FabricObjectOptions);
    addWithUpdate(object: Object): Group;
    removeWithUpdate(object: Object): Group;
    getObjects(): Object[];
  }
  
  export class Rect extends Object {
    constructor(options?: FabricObjectOptions);
  }
  
  export class Circle extends Object {
    constructor(options?: FabricObjectOptions);
  }
  
  export class Triangle extends Object {
    constructor(options?: FabricObjectOptions);
  }
  
  export class Polygon extends Object {
    constructor(points: Array<{x: number, y: number}>, options?: FabricObjectOptions);
  }
  
  export class Path extends Object {
    constructor(path: string, options?: FabricObjectOptions);
  }
  
  export class Text extends Object {
    constructor(text: string, options?: FabricObjectOptions);
    text: string;
  }
}
