
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Undo, Redo, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DesignCanvas from './design/DesignCanvas';
import DesignToolQuantitySelector from './design/DesignToolQuantitySelector';
import { ColorProvider } from '@/context/ColorContext';
import { FontProvider } from '@/context/FontContext';
import { ImageProvider } from '@/context/ImageContext';
import { TextProvider } from '@/context/TextContext';
import { EmojiProvider } from '@/context/EmojiContext';

interface ProductCustomizerProps {
  product: Product;
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ product }) => {
  const [activeView, setActiveView] = useState('front');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [designImage, setDesignImage] = useState<string | undefined>();
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [designComplete, setDesignComplete] = useState<Record<string, boolean>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (canvas) {
      const checkStatus = () => {
        if (canvas) {
          const isFrontComplete = checkDesignStatus(canvas);
          setDesignComplete(prev => ({ ...prev, [activeView]: isFrontComplete }));
        }
      };

      canvas.on('object:added', checkStatus);
      canvas.on('object:modified', checkStatus);
      canvas.on('object:removed', checkStatus);
      canvas.on('selection:cleared', checkStatus);
      canvas.on('selection:created', checkStatus);

      return () => {
        canvas.off('object:added', checkStatus);
        canvas.off('object:modified', checkStatus);
        canvas.off('object:removed', checkStatus);
        canvas.off('selection:cleared', checkStatus);
        canvas.off('selection:created', checkStatus);
      };
    }
  }, [canvas, activeView]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        const newSizes = prev.filter(s => s !== size);
        const newQuantities = { ...quantities };
        delete newQuantities[size];
        setQuantities(newQuantities);
        return newSizes;
      } else {
        const newQuantities = { ...quantities, [size]: 1 };
        setQuantities(newQuantities);
        return [...prev, size];
      }
    });
  };

  const handleQuantityChange = (size: string, newQuantity: number) => {
    const variant = product.variants?.find(v => v.size === size);
    const maxStock = Number(variant?.stock || 50);
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantities(prev => ({ ...prev, [size]: newQuantity }));
    } else if (newQuantity > maxStock) {
      toast.warning(`Maximum ${maxStock} items available for size ${size}`);
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Please sign in to add to cart.');
      navigate('/signin?redirectTo=/products');
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size.');
      return;
    }

    if (!designComplete[activeView]) {
      toast.error('Please complete your design.');
      return;
    }

    if (!canvas) {
      toast.error('Canvas not initialized.');
      return;
    }

    const canvasData = canvas.toJSON();
    const designData = JSON.stringify(canvasData);

    try {
      const previewImage = canvas.toDataURL();

      // Convert to sizes array format
      const sizesArray = selectedSizes.map(size => ({
        size,
        quantity: quantities[size] || 1
      }));

      const cartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        sizes: sizesArray,
        image: product.image,
        metadata: {
          designData: designData,
          previewImage: previewImage,
          view: activeView,
        },
      };

      await addToCart(cartItem);

      const totalItems = selectedSizes.reduce((sum, size) => sum + (quantities[size] || 1), 0);
      toast.success(`Added ${totalItems} custom items to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart.');
    }
  };

  const handleUndo = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }

    if (undoStack.length <= 1) {
      toast.warning('Nothing to undo');
      return;
    }

    try {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack(prev => [...prev, currentState]);
      setUndoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
        toast.success('✅ Undid last action');
      });
    } catch (error) {
      console.error('Undo error:', error);
      toast.error('Failed to undo');
    }
  };

  const handleRedo = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }

    if (redoStack.length === 0) {
      toast.warning('Nothing to redo');
      return;
    }

    try {
      const nextState = redoStack[redoStack.length - 1];
      
      const currentState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, currentState]);
      
      setRedoStack(prev => prev.slice(0, -1));
      
      canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        toast.success('✅ Redid last action');
      });
    } catch (error) {
      console.error('Redo error:', error);
      toast.error('Failed to redo');
    }
  };

  const clearCanvas = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }

    if (canvas.getObjects().length === 0) {
      toast.warning('Canvas is already empty');
      return;
    }
    
    try {
      const currentState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, currentState]);
      
      canvas.clear();
      canvas.backgroundColor = 'black';
      canvas.renderAll();
      
      const clearedState = JSON.stringify(canvas.toJSON());
      setUndoStack(prev => [...prev, clearedState]);
      setRedoStack([]);
      
      if (designComplete[activeView]) {
        setDesignComplete(prev => ({ ...prev, [activeView]: false }));
      }
      
      toast.success('✅ Canvas cleared successfully');
    } catch (error) {
      console.error('Clear canvas error:', error);
      toast.error('Failed to clear canvas');
    }
  };

  const checkDesignStatus = (canvasInstance?: fabric.Canvas | null): boolean => {
    if (!canvasInstance) return false;
    const objects = canvasInstance.getObjects();
    return objects.length > 0;
  };

  const getTotalPrice = () => {
    return selectedSizes.reduce((sum, size) => sum + (product.price * (quantities[size] || 1)), 0);
  };

  const getTotalQuantity = () => {
    return selectedSizes.reduce((sum, size) => sum + (quantities[size] || 1), 0);
  };

  // Get available sizes from product variants or fallback
  const getAvailableSizes = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => v.size);
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };

  return (
    <ColorProvider>
      <FontProvider>
        <ImageProvider>
          <TextProvider>
            <EmojiProvider>
              <div className="design-tool-container">
                <div className="design-tool-header">
                  <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    🎨 Customize Your {product.name}
                  </h1>
                  
                  {/* Size & Quantity Selection */}
                  <DesignToolQuantitySelector
                    selectedSizes={selectedSizes}
                    quantities={quantities}
                    availableSizes={getAvailableSizes()}
                    onSizeToggle={handleSizeToggle}
                    onQuantityChange={handleQuantityChange}
                    getTotalPrice={getTotalPrice}
                    getTotalQuantity={getTotalQuantity}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="canvas-wrapper md:w-3/4">
                    {/* View Selector */}
                    <div className="flex justify-center items-center mb-6">
                      <button
                        onClick={() => handleViewChange('front')}
                        className={`px-8 py-4 rounded-l-xl font-bold text-lg transition-all duration-300 ${
                          activeView === 'front' 
                            ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🔵 Front
                      </button>
                      <button
                        onClick={() => handleViewChange('back')}
                        className={`px-8 py-4 rounded-r-xl font-bold text-lg transition-all duration-300 ${
                          activeView === 'back' 
                            ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🔴 Back
                      </button>
                    </div>

                    {/* Canvas Control Buttons */}
                    <div className="flex justify-center gap-6 mb-6">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleUndo}
                        disabled={undoStack.length <= 1}
                        className="flex items-center gap-3 px-8 py-4 font-bold text-lg border-2 border-gray-400 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                      >
                        <Undo className="h-6 w-6" />
                        ↶ Undo
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        className="flex items-center gap-3 px-8 py-4 font-bold text-lg border-2 border-gray-400 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                      >
                        <Redo className="h-6 w-6" />
                        ↷ Redo
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={clearCanvas}
                        className="flex items-center gap-3 px-8 py-4 font-bold text-lg text-red-600 hover:text-red-700 border-2 border-red-400 hover:border-red-500 hover:bg-red-50 transition-all duration-300"
                      >
                        <Trash2 className="h-6 w-6" />
                        🗑️ Clear
                      </Button>
                    </div>
                    
                    <DesignCanvas
                      activeProduct={product.category}
                      productView={activeView}
                      canvas={canvas}
                      setCanvas={setCanvas}
                      undoStack={undoStack}
                      redoStack={redoStack}
                      setUndoStack={setUndoStack}
                      setRedoStack={setRedoStack}
                      setDesignImage={setDesignImage}
                      setCanvasInitialized={setCanvasInitialized}
                      canvasRef={canvasRef}
                      fabricCanvasRef={fabricCanvasRef}
                      setDesignComplete={setDesignComplete}
                      designComplete={designComplete}
                      checkDesignStatus={checkDesignStatus}
                      undo={handleUndo}
                      redo={handleRedo}
                      clearCanvas={clearCanvas}
                    />
                  </div>

                  <div className="customization-panel md:w-1/4 p-6 bg-gray-50 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">🎨 Customize</h2>
                    <p className="text-gray-600 text-center mb-6">Use the context menus and tools to customize your design.</p>
                    
                    {/* Design Status */}
                    <div className="mt-6 p-4 rounded-xl border-2">
                      <div className={`text-lg font-bold text-center ${
                        designComplete[activeView] ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {designComplete[activeView] ? '✅ Design Complete!' : '⚠️ Add elements to complete design'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="design-actions mt-8">
                  <div className="flex gap-6 justify-center">
                    <Button
                      onClick={handleAddToCart}
                      className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                      disabled={selectedSizes.length === 0 || getTotalQuantity() < 1}
                    >
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      {selectedSizes.length > 0 
                        ? `🛒 Add ${getTotalQuantity()} Custom Items - ₹${getTotalPrice().toFixed(2)}`
                        : '📦 Select Sizes to Add to Cart'
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </EmojiProvider>
          </TextProvider>
        </ImageProvider>
      </FontProvider>
    </ColorProvider>
  );
};

export default ProductCustomizer;
