
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import DesignContextProviders from '@/context/DesignContextProviders';
import TextModal from '../components/design/TextModal';
import ImageModal from '../components/design/ImageModal';
import EmojiModal from '../components/design/EmojiModal';
import ProductSelector from '../components/design/ProductSelector';
import DesignCanvas from '../components/design/DesignCanvas';
import CustomizationSidebar from '../components/design/CustomizationSidebar';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';
import { useDesignToolInventory } from '@/hooks/useDesignToolInventory';
import { useDesignProducts } from '@/hooks/useDesignProducts';
import { validateObjectsWithinBoundary, showBoundaryValidationError, moveObjectsIntoBoundary } from '@/components/design/BoundaryValidator';

const DesignTool = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [activeProduct, setActiveProduct] = useState<string>('tshirt');
  const [productView, setProductView] = useState<string>('front');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const [isDualSided, setIsDualSided] = useState(false);
 const [quantity, setQuantity] = useState(1);

  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { sizeInventory, fetchProductInventory, updateInventory } = useDesignToolInventory();
  const { products, loading: productsLoading } = useDesignProducts();
 
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'
  ];

  // Initialize design canvas with new controls
  const {
    canvas,
    canvasRef,
    fabricCanvasRef,
    designImage,
    canvasInitialized,
    undoStack,
    redoStack,
    frontDesign,
    backDesign,
    designComplete,
    setCanvas,
    setUndoStack,
    setRedoStack,
    setDesignImage,
    setCanvasInitialized,
    setFrontDesign,
    setBackDesign,
    setDesignComplete,
    hasDesignElements,
    loadDesignToCanvas,
    addTextToCanvas,
    handleAddImage,
    addEmojiToCanvas,
    checkDesignStatus,
    undo,
    redo,
    clearCanvas
  } = useDesignCanvas({
    activeProduct
  });

  useEffect(() => {
    if (params.productCode) {
      if (params.productCode.includes('TSHIRT')) {
        setActiveProduct('tshirt');
      } else if (params.productCode.includes('MUG')) {
        setActiveProduct('mug');
      } else if (params.productCode.includes('CAP')) {
        setActiveProduct('cap');
      }
    }
  }, [params.productCode]);

  useEffect(() => {
    fetchProductInventory();
  }, []);

  useEffect(() => {
    if (!emojiSearch) {
      setFilteredEmojis(emojis);
      return;
    }
   
    const filtered = emojis.filter(emoji => {
      return emoji.includes(emojiSearch);
    });
   
    setFilteredEmojis(filtered.length > 0 ? filtered : emojis);
  }, [emojiSearch]);

  const handleProductChange = (productId: string) => {
    if (products[productId]) {
      setActiveProduct(productId);
      setProductView('front');
      setSelectedSize(productId === 'tshirt' ? 'M' : 'Standard');
      setSelectedSizes([]);
      setIsDualSided(false);
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({front: false, back: false});
    }
  };

  const handleViewChange = (view: string) => {
    if (canvas && isDualSided) {
      if (productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({...prev, front: hasDesignElements()}));
      } else if (productView === 'back') {
        const backDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9 });
        setBackDesign(backDataUrl);
        setDesignComplete(prev => ({...prev, back: hasDesignElements()}));
      }
    }
   
    setProductView(view);
   
    setTimeout(() => {
      if (view === 'front' && frontDesign && isDualSided) {
        loadDesignToCanvas(frontDesign);
      } else if (view === 'back' && backDesign && isDualSided) {
        loadDesignToCanvas(backDesign);
      }
    }, 300);
  };

  const handleDualSidedChange = (checked: boolean) => {
    setIsDualSided(checked);
   
    if (checked) {
      if (canvas && productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({...prev, front: hasDesignElements()}));
      }
     
      toast("Dual-sided printing enabled", {
        description: "Please design both front and back sides",
      });
     
    } else {
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({front: false, back: false});
    }
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
    
    if (!selectedSizes.includes(size)) {
      setSelectedSize(size);
    }
  };

  const getTotalPrice = () => {
    const product = products[activeProduct];
    const basePrice = product?.price || 200;
    const effectiveSizes = selectedSizes.length > 0 ? selectedSizes : (selectedSize ? [selectedSize] : []);
    const sizeMultiplier = effectiveSizes.length > 1 ? effectiveSizes.length : 1;
    const dualSidedCost = isDualSided ? 100 : 0;
    
    return (basePrice * sizeMultiplier) + dualSidedCost;
  };

  const validateDesign = () => {
    if (!hasDesignElements()) {
      return false;
    }
    
    if (!isDualSided) {
      return hasDesignElements();
    }
   
    return designComplete.front && designComplete.back;
  };

  const validateDesignWithBoundary = () => {
    if (!canvas) return false;
    
    if (!hasDesignElements()) {
      return false;
    }
    
    const boundaryId = `design-boundary-${activeProduct}`;
    return validateObjectsWithinBoundary(canvas, boundaryId);
  };

  const generateDesignPreview = () => {
    if (!canvas) return null;
    
    try {
      const previewDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      });
      
      return previewDataUrl;
    } catch (error) {
      console.error('Error generating design preview:', error);
      return canvas.toDataURL({ format: 'png', quality: 1.0 });
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error("Sign in required", {
        description: "Please sign in to add items to cart",
      });
      navigate('/signin');
      return;
    }

    const effectiveSizes = selectedSizes.length > 0 ? selectedSizes : (selectedSize ? [selectedSize] : []);
    if (effectiveSizes.length === 0) {
      toast.error("Size required", {
        description: "Please select at least one size",
      });
      return;
    }

    if (!validateDesign()) {
      if (isDualSided) {
        toast.error("Incomplete design", {
          description: "Please add design elements to both front and back sides",
        });
      } else {
        toast.error("Empty design", {
          description: "Please add at least one design element (text, image, or emoji)",
        });
      }
      return;
    }

    // ENHANCED BOUNDARY VALIDATION - Check if elements are within dotted line
    if (!validateDesignWithBoundary()) {
      toast.error("Design elements outside boundary!", {
        description: "Please move all text, images, and emojis within the dotted design area before adding to cart.",
        duration: 4000,
      });
      
      // Optional: Auto-move elements into boundary
      const boundaryId = `design-boundary-${activeProduct}`;
      moveObjectsIntoBoundary(canvas!, boundaryId);
      toast.info("Design elements moved into boundary", {
        description: "We've automatically moved your elements within the design area.",
      });
      return;
    }

    if (isDualSided && activeProduct === 'tshirt') {
      if (canvas) {
        const currentDesign = canvas.toDataURL({ format: 'webp', quality: 0.9 });
        if (productView === 'front') {
          setFrontDesign(currentDesign);
        } else {
          setBackDesign(currentDesign);
        }
      }

      if (!frontDesign || !backDesign) {
        toast.error("Incomplete design", {
          description: "Please design both front and back sides for dual-sided printing",
        });
        return;
      }
    }

    try {
      if (!canvas) return;
     
      for (const size of effectiveSizes) {
        if (sizeInventory[activeProduct] && sizeInventory[activeProduct][size.toLowerCase()] <= 0) {
          toast.error("Out of stock", {
            description: `${products[activeProduct]?.name} in size ${size} is currently out of stock`,
          });
          return;
        }
      }

      const canvasJSON = canvas.toJSON();
      const previewImage = generateDesignPreview();
      const totalPrice = getTotalPrice();
     
      if (isDualSided && activeProduct === 'tshirt') {
        const customProduct = {
          product_id: `custom-${activeProduct}-dual-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'} (Dual-Sided)`,
          price: totalPrice,
          image: frontDesign,
          quantity: 1,
          size: effectiveSizes.join(', '),
          metadata: {
            view: 'Dual-Sided',
            backImage: backDesign,
            designData: canvasJSON,
            previewImage: frontDesign,
            selectedSizes: effectiveSizes
          }
        };
       
        await addToCart(customProduct);
       
        for (const size of effectiveSizes) {
          await updateInventory(activeProduct, size, -1);
        }
        
        toast.success("Added to cart", {
          description: `Dual-sided design added to cart for ${effectiveSizes.length} size${effectiveSizes.length > 1 ? 's' : ''}`
        });
       
      } else {
        const customProduct = {
          product_id: `custom-${activeProduct}-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'}`,
          price: totalPrice,
          image: previewImage || '/placeholder.svg',
          quantity: 1,
          size: effectiveSizes.join(', '),
          metadata: {
            view: productView,
            designData: canvasJSON,
            previewImage: previewImage,
            selectedSizes: effectiveSizes
          }
        };
       
        await addToCart(customProduct);
       
        for (const size of effectiveSizes) {
          await updateInventory(activeProduct, size, -1);
        }
        
        toast.success("Added to cart", {
          description: `Design added to cart for ${effectiveSizes.length} size${effectiveSizes.length > 1 ? 's' : ''}`
        });
      }
     
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
     
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add to cart", {
        description: "An error occurred while adding the design to cart"
      });
    }
  };

  const saveDesign = async () => {
    if (!canvas || !currentUser) {
      toast.error("Sign in required", {
        description: "Please sign in to save your design"
      });
      navigate('/signin');
      return;
    }

    try {
      const designDataUrl = generateDesignPreview();
     
      if (designDataUrl) {
        localStorage.setItem(`design-${Date.now()}`, designDataUrl);
        toast.success("Design saved", {
          description: "Your design has been saved successfully"
        });
      }
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error("Save failed", {
        description: "Failed to save your design"
      });
    }
  };

  if (productsLoading) {
    return (
      <Layout>
        <div className="container-custom px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DesignContextProviders>
        <div className="container-custom px-4">
          <div className="flex items-center justify-between mb-6 mt-10">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1" size={20} />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Design Your Product</h1>
            <div className="w-20"></div>
          </div>
         
          <ProductSelector
            products={products}
            activeProduct={activeProduct}
            isDualSided={isDualSided}
            onProductSelect={handleProductChange}
          />
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 justify-items-center">
              <DesignCanvas
                activeProduct={activeProduct}
                productView={productView}
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
                undo={undo}
                redo={redo}
                clearCanvas={clearCanvas}
              />
             
              {isDualSided && activeProduct === 'tshirt' && (
                <div className="mt-2 text-center">
                  <span className="text-blue-600 font-medium">
                    Currently designing: {productView === 'front' ? 'Front Side' : 'Back Side'}
                    {productView === 'front' && designComplete.front && ' ✅'}
                    {productView === 'back' && designComplete.back && ' ✅'}
                  </span>
                </div>
              )}
            </div>
           
            <div className="md:col-span-1">
              <CustomizationSidebar
                activeProduct={activeProduct}
                productView={productView}
                onViewChange={handleViewChange}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                isDualSided={isDualSided}
                onDualSidedChange={handleDualSidedChange}
                sizeInventory={sizeInventory}
                products={products}
                onOpenTextModal={() => setIsTextModalOpen(true)}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onOpenEmojiModal={() => setIsEmojiModalOpen(true)}
                onAddToCart={handleAddToCart}
                validateDesign={validateDesign}
                selectedSizes={selectedSizes}
                onSizeToggle={handleSizeToggle}
                getTotalPrice={getTotalPrice}
                quantity={quantity}
                productId={activeProduct}
                upi_input=""
                  onQuantityChange={setQuantity} 
                

              />
            </div>
          </div>
        </div>
       
        <TextModal
          isOpen={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          onAddText={addTextToCanvas}
        />
       
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onAddImage={handleAddImage}
        />
       
        <EmojiModal
          isOpen={isEmojiModalOpen}
          onClose={() => setIsEmojiModalOpen(false)}
          onAddEmoji={(emoji) => {
            addEmojiToCanvas(emoji);
            setIsEmojiModalOpen(false);
          }}
        />
      </DesignContextProviders>
    </Layout>
  );
};

export default DesignTool;