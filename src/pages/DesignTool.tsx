import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import TextModal from '../components/design/TextModal';
import ImageModal from '../components/design/ImageModal';
import EmojiModal from '../components/design/EmojiModal';
import ProductSelector from '../components/design/ProductSelector';
import DesignCanvas from '../components/design/DesignCanvas';
import CustomizationSidebar from '../components/design/CustomizationSidebar';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';
import { useProductInventory } from '@/hooks/useProductInventory';
import { useDesignToolInventory } from '@/hooks/useDesignToolInventory';

// Product interface
interface Product {
  name: string;
  price: number;
  image: string;
}

const products: Record<string, Product> = {
  tshirt: { name: 'T-shirt', price: 200, image: '/lovable-uploads/design-tool-page/tshirt-print.png' },
  mug: { name: 'Mug', price: 200, image: '/lovable-uploads/design-tool-page/mug-print.png' },
  cap: { name: 'Cap', price: 150, image: '/lovable-uploads/design-tool-page/cap-print.png' }
};

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
  const { currentLocation } = useLocation();
  const { addToCart } = useCart();
  const { sizeInventory, fetchProductInventory, updateInventory } = useDesignToolInventory();
  
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
    checkDesignStatus
  } = useDesignCanvas({
    activeProduct,
    productView,
    isDualSided
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
        const frontDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({...prev, front: hasDesignElements()}));
      } else if (productView === 'back') {
        const backDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
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
        const frontDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
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

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error("Sign in required", {
        description: "Please sign in to add items to cart",
      });
      navigate('/signin');
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

    try {
      if (!canvas) return;
      
      // Check inventory
      if (sizeInventory[activeProduct][selectedSize] <= 0) {
        toast.error("Out of stock", {
          description: `${products[activeProduct].name} in size ${selectedSize} is currently out of stock`,
        });
        return;
      }
      
      if (isDualSided && activeProduct === 'tshirt') {
        // Save current side if needed
        if (productView === 'front') {
          setFrontDesign(canvas.toDataURL({ format: 'png', quality: 1 }));
        } else if (productView === 'back') {
          setBackDesign(canvas.toDataURL({ format: 'png', quality: 1 }));
        }
        
        if (!frontDesign || !backDesign) {
          toast.error("Incomplete design", {
            description: "Please design both front and back sides for dual-sided printing",
          });
          return;
        }
        
        const customProduct = {
          id: `custom-${activeProduct}-dual-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'} (Dual-Sided)`,
          price: 300,
          image: frontDesign,
          productId: `custom-${activeProduct}-dual-${Date.now()}`,
          quantity: 1,
          size: selectedSize,
          view: 'Dual-Sided',
          backImage: backDesign
        };
        
        addToCart(customProduct);
        
        // Update inventory
        updateInventory(activeProduct, selectedSize, -1)
          .then(success => {
            if (success) {
              toast.success("Added to cart", {
                description: "Dual-sided design added to cart successfully"
              });
              
              setTimeout(() => {
                navigate('/cart');
              }, 1000);
            }
          });
        
      } else {
        const designDataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
        
        const customProduct = {
          id: `custom-${activeProduct}-${Date.now()}`,
          name: `Custom ${products[activeProduct]?.name || 'Product'}`,
          price: products[activeProduct]?.price || 200,
          image: designDataUrl,
          productId: `custom-${activeProduct}-${Date.now()}`,
          quantity: 1,
          size: selectedSize,
          view: productView
        };
        
        addToCart(customProduct);
        
        // Update inventory
        updateInventory(activeProduct, selectedSize, -1)
          .then(success => {
            if (success) {
              toast.success("Added to cart", {
                description: "Design added to cart successfully"
              });
              
              setTimeout(() => {
                navigate('/cart');
              }, 1000);
            }
          });
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
      const designDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Save to browser storage for now (could be replaced with actual database storage later)
      localStorage.setItem(`design-${Date.now()}`, designDataUrl);
      
      toast.success("Design saved", {
        description: "Your design has been saved successfully"
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error("Save failed", {
        description: "Failed to save your design"
      });
    }
  };

  return (
    <Layout>
      <div className="container-custom px-4 mt-10">
        <div className="flex items-center justify-between   mb-6">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-1" size={25} />
            <span className="text-xl font-medium">Back</span>
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
          <div className="md:col-span-2">
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
            />
            
            {isDualSided && activeProduct === 'tshirt' && (
              <div className=" text-center">
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
              onSaveDesign={saveDesign}
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
    </Layout>
  );
};

export default DesignTool;
