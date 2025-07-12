import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, RotateCcw, Share } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import ProductVariantSelector from '../components/products/ProductVariantSelector';
import ShareModal from '../components/products/ShareModal';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';
import { useDesignToolInventory } from '@/hooks/useDesignToolInventory';
import { useDesignProducts } from '@/hooks/useDesignProducts';
import { validateObjectsWithinBoundary, showBoundaryValidationError, moveObjectsIntoBoundary } from '@/components/design/BoundaryValidator';
import { useActiveProduct } from '@/context/ActiveProductContext';

const DesignTool = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { activeProduct, setActiveProduct } = useActiveProduct();
  const [productView, setProductView] = useState<string>('front');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([]);
  const [isDualSided, setIsDualSided] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { sizeInventory, fetchProductInventory, updateInventory } = useDesignToolInventory();
  const { products: apiProducts, loading: productsLoading } = useDesignProducts();
 
  // Define products with variants for proper size/quantity display
  const products = {
    tshirt: { 
      id: 'tshirt',
      name: 'T-Shirt', 
      price: 249, 
      image:' https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/tshirt-print/tshirt-print.webp',
      variants: [
        { size: 'S', stock: sizeInventory.tshirt?.s || 0 },
        { size: 'M', stock: sizeInventory.tshirt?.m || 0 },
        { size: 'L', stock: sizeInventory.tshirt?.l || 0},
        { size: 'XL', stock: sizeInventory.tshirt?.xl || 0 },
        { size: 'XXL', stock: sizeInventory.tshirt?.xxl ||0 }
      ]
    },
    mug: { 
      id: 'mug',
      name: 'Mug', 
      price: 199, 
      image:' https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/mug-print/mug-print.webp',
      variants: [
        { size: 'Standard', stock: sizeInventory.mug?.standard || 0 }
      ]
    },
    cap: { 
      id: 'cap',
      name: 'Cap', 
      price: 179, 
      image:' https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/cap-print/cap-print.webp',
      variants: [
        { size: 'Standard', stock: sizeInventory.cap?.standard || 0 }
      ]
    },
    photo_frame: { 
      id: 'photo_frame',
      name: 'Photo Frame', 
      price: 299, 
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300',
      variants: [
        { size: '8X12inch', stock: 0 },
        { size: '12x16inch', stock: 0 },
        { size: '5x7 inch', stock: 0 }
      ]
    }
  };

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'
  ];

  // Initialize design canvas
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
      } else if (params.productCode.includes('PHOTO_FRAME')) {
        setActiveProduct('photo_frame');
        setProductView('8X12inch');
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
      
      // Set default view based on product type
      if (productId === 'photo_frame') {
        setProductView('8X12inch');
      } else {
        setProductView('front');
      }
      
      setSelectedSizes([]);
      setQuantities({});
      setIsDualSided(false);
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({front: false, back: false});
    }
  };

  const getCanvasDimensions = (view: string) => {
    switch(view) {
      case '8X12inch':
        return { width: 300, height:350 };
      case '12x16inch':
        return { width: 300, height: 320 };
      case '5x7 inch':
        return { width: 300, height: 3200 };
      default:
        return { width: 300, height: 320 };
    }
  };

  const handleViewChange = (view: string) => {
    if (canvas && isDualSided && activeProduct === 'tshirt') {
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

    // Handle canvas resizing for photo_frame
    if (activeProduct === 'photo_frame' && canvas) {
      const dimensions = getCanvasDimensions(view);
      canvas.setWidth(dimensions.width);
      canvas.setHeight(dimensions.height);
      canvas.renderAll();
    }
   
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
        const newQuantities = { ...quantities };
        delete newQuantities[size];
        setQuantities(newQuantities);
        return prev.filter(s => s !== size);
      } else {
        setQuantities(prev => ({ ...prev, [size]: 1 }));
        return [...prev, size];
      }
    });
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [size]: quantity }));
  };

  const handleRemoveSelected = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast.warning('No object selected');
      return;
    }

    canvas.remove(activeObject);
    canvas.renderAll();
    toast.success('Selected object removed');
  };

  const handleClearCanvas = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }

    canvas.clear();
    canvas.backgroundColor = 'black';
    canvas.renderAll();
    
    toast.success('Canvas cleared');
    
    // Automatically refresh the page after clearing
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getTotalPrice = () => {
    const product = products[activeProduct];
    const basePrice = product?.price || 200;
    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0) || 1;
    const dualSidedCost = isDualSided ? 100 * totalQuantity : 0;
    
    return (basePrice * totalQuantity) + dualSidedCost;
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
        multiplier: activeProduct === 'photo_frame' ? 2 : 1
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

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0 || selectedSizes.length === 0) {
      toast.error("Size and quantity required", {
        description: "Please select at least one size with quantity",
      });
      return;
    }

    if (!hasDesignElements()) {
      toast.error("Design required", {
        description: "Please add at least one design element (text, image, or emoji) before adding to cart",
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

    if (!validateDesignWithBoundary()) {
      toast.error("Design elements outside boundary!", {
        description: "Please move all text, images, and emojis within the dotted design area before adding to cart.",
        duration: 4000,
      });
      
      const boundaryId = `design-boundary-${activeProduct}`;
      moveObjectsIntoBoundary(canvas!, boundaryId);
      toast.info("Design elements moved into boundary", {
        description: "We've automatically moved your elements within the design area.",
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      if (!canvas) return;
     
      for (const size of selectedSizes) {
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
     
      const customProduct = {
        product_id: `custom-${activeProduct}-${Date.now()}`,
        name: `Custom ${products[activeProduct]?.name || 'Product'}${isDualSided ? ' (Dual-Sided)' : ''}${activeProduct === 'photo_frame' ? ` (${productView})` : ''}`,
        price: totalPrice,
        image: previewImage || '/placeholder.svg',
        sizes: selectedSizes.map(size => ({ size, quantity: quantities[size] || 1 })),
        metadata: {
          view: isDualSided ? 'Dual-Sided' : productView,
          backImage: isDualSided ? backDesign : null,
          designData: canvasJSON,
          previewImage: previewImage,
          selectedSizes: selectedSizes,
          frameSize: activeProduct === 'photo_frame' ? productView : null
        }
      };
     
      await addToCart(customProduct);
     
      for (const size of selectedSizes) {
        await updateInventory(activeProduct, size, -(quantities[size] || 1));
      }
      
      toast.success("Added to cart", {
        description: `Design added to cart for ${selectedSizes.length} size${selectedSizes.length > 1 ? 's' : ''}`
      });
     
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

  // Create a mock product for sharing
  const currentDesignProduct = {
    id: `design-${activeProduct}`,
    name: `Custom ${products[activeProduct]?.name || 'Product'}`,
    price: getTotalPrice(),
    image: '/placeholder.svg'
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
          <div className="flex flex-cols items-center gap-10 mb-6 mt-10">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1" size={20} />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="flex text-xl  md:text-2xl font-bold text-gray-800">Design Your Product</h1>
            
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
                clearCanvas={handleClearCanvas}
              />

              {/* Action Buttons */}
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  <Trash2 size={16} />
                  Remove Selected
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCanvas}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
                >
                  <RotateCcw size={16} />
                  Clear Canvas
                </Button>
                <Button
              variant="outline"
              size="icon"
              onClick={() => setShowShareModal(true)}
              className="flex items-center  text-green-600 hover:text-green-700 border-black-300 hover:border-black-400"
            >
              <Share className="h-4 w-4" />
            </Button>
              </div>
             
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
           
            <div className="md:col-span-1 space-y-6">
              <CustomizationSidebar
                activeProduct={activeProduct}
                productView={productView}
                onViewChange={handleViewChange}
                selectedSizes={selectedSizes}
                onSizeToggle={handleSizeToggle}
                isDualSided={isDualSided}
                onDualSidedChange={handleDualSidedChange}
                sizeInventory={sizeInventory}
                products={products}
                onOpenTextModal={() => setIsTextModalOpen(true)}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onOpenEmojiModal={() => setIsEmojiModalOpen(true)}
                onAddToCart={handleAddToCart}
                validateDesign={validateDesign}
                getTotalPrice={getTotalPrice}
                quantity={quantity}
                onQuantityChange={setQuantity}
                productId={activeProduct}
                upi_input=""
                quantities={quantities}
                onQuantityChangeForSize={handleQuantityChange}
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

        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          product={products[activeProduct]}
        />
      </DesignContextProviders>
    </Layout>
  );
};

export default DesignTool;