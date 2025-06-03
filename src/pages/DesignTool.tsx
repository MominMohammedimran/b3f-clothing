
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
import { validateObjectsWithinBoundary, showBoundaryValidationError } from '@/components/design/BoundaryValidator';

const DesignTool = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [activeProduct, setActiveProduct] = useState<string>('tshirt');
  const [productView, setProductView] = useState<string>('front');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const [isDualSided, setIsDualSided] = useState(false);
 
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

  // Fetch product inventory on component mount
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

  const validateDesign = () => {
    if (!isDualSided) {
      return hasDesignElements();
    }
   
    return designComplete.front && designComplete.back;
  };

  const validateDesignWithBoundary = () => {
    if (!canvas) return false;
    
    // Check if there are design elements
    if (!hasDesignElements()) {
      return false;
    }
    
    // Check if all elements are within boundary
    const boundaryId = `design-boundary-${activeProduct}`;
    return validateObjectsWithinBoundary(canvas, boundaryId);
  };

  const generateDesignPreview = () => {
    if (!canvas) return null;
    
    try {
      // Generate the full canvas with both background and design elements
      const previewDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      });
      
      return previewDataUrl;
    } catch (error) {
      console.error('Error generating design preview:', error);
      // Fallback to full canvas export
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

    // Validate design elements exist
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

    // Validate boundary for current view
    if (!validateDesignWithBoundary()) {
      showBoundaryValidationError();
      return;
    }

    // For dual-sided designs, check both sides
    if (isDualSided && activeProduct === 'tshirt') {
      // Save current side first
      if (canvas) {
        const currentDesign = canvas.toDataURL({ format: 'webp', quality: 0.9 });
        if (productView === 'front') {
          setFrontDesign(currentDesign);
        } else {
          setBackDesign(currentDesign);
        }
      }

      // Check if both sides are designed
      if (!frontDesign || !backDesign) {
        toast.error("Incomplete design", {
          description: "Please design both front and back sides for dual-sided printing",
        });
        return;
      }
    }

    try {
      if (!canvas) return;
     
      // Check inventory
      if (sizeInventory[activeProduct] && sizeInventory[activeProduct][selectedSize] <= 0) {
        toast.error("Out of stock", {
          description: `${products[activeProduct]?.name} in size ${selectedSize} is currently out of stock`,
        });
        return;
      }

      // Get canvas data for storage and generate proper preview
      const canvasJSON = canvas.toJSON();
      const previewImage = generateDesignPreview();
     
      if (isDualSided && activeProduct === 'tshirt') {
        const customProduct = {
          product_id: `custom-${activeProduct}-dual-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'} (Dual-Sided)`,
          price: 300,
          image: frontDesign,
          quantity: 1,
          size: selectedSize,
          metadata: {
            view: 'Dual-Sided',
            backImage: backDesign,
            designData: canvasJSON,
            previewImage: frontDesign
          }
        };
       
        await addToCart(customProduct);
       
        // Update inventory
        const success = await updateInventory(activeProduct, selectedSize, -1);
        if (success) {
          toast.success("Added to cart", {
            description: "Dual-sided design added to cart successfully"
          });
         
          setTimeout(() => {
            navigate('/cart');
          }, 1000);
        }
       
      } else {
        const customProduct = {
          product_id: `custom-${activeProduct}-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'}`,
          price: products[activeProduct]?.price || 200,
          image: previewImage || '/placeholder.svg',
          quantity: 1,
          size: selectedSize,
          metadata: {
            view: productView,
            designData: canvasJSON,
            previewImage: previewImage
          }
        };
       
        await addToCart(customProduct);
       
        // Update inventory
        const success = await updateInventory(activeProduct, selectedSize, -1);
        if (success) {
          toast.success("Added to cart", {
            description: "Design added to cart successfully"
          });
         
          setTimeout(() => {
            navigate('/cart');
          }, 1000);
        }
      }
     
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
          <div className="flex items-center justify-between mb-6">
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
