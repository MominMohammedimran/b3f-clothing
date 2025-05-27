import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Plus, Minus, Type, Image as ImageIcon, Smile, Undo, Redo, Trash2, X, Upload } from 'lucide-react';
import DesignCanvas from '../components/design/DesignCanvas';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';

const DesignTool = () => {
  const { productkey } = useParams<{ productkey: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Single useSEO hook at the top level with dynamic title based on selectedProduct
  const seoData = useSEO({
    title: selectedProduct ? `Design ${selectedProduct.name} - Custom Design Tool | B3F Prints` : 'Design Tool - Create Custom Products Online | B3F Prints',
    description: 'Use our advanced design tool to create custom t-shirts, mugs, and caps. Add text, images, and graphics to make unique products.',
    keywords: 'design tool, custom design, t-shirt designer, mug designer, online design',
    type: 'website' as const
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState('tshirt');
  const [productView, setProductView] = useState('front');
  const [isDualSided, setIsDualSided] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [designText, setDesignText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const {
    canvas,
    canvasInitialized,
    hasDesignElements,
    addTextToCanvas,
    handleAddImage,
    addEmojiToCanvas,
  } = useDesignCanvas({ activeProduct, productView, isDualSided });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productkey && products.length > 0) {
      const product = products.find(p => p.code === productkey || p.id === productkey);
      if (product) {
        setSelectedProduct(product);
        if (product.category === 'tshirt') {
          setActiveProduct('tshirt');
        } else if (product.category === 'mug') {
          setActiveProduct('mug');
          setIsDualSided(false);
        } else if (product.category === 'cap') {
          setActiveProduct('cap');
          setIsDualSided(false);
        }
      }
    }
  }, [productkey, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProducts: Product[] = data?.map((product: any) => ({
        id: product.id,
        code: product.code || `PROD-${product.id.slice(0, 8)}`,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.original_price || product.price,
        discountPercentage: product.discount_percentage || 0,
        category: product.category || 'general',
        stock: product.stock || 0,
        image: product.image || '',
        images: Array.isArray(product.images) 
          ? product.images.filter(img => typeof img === 'string')
          : [],
        sizes: Array.isArray(product.sizes) 
          ? product.sizes.filter(size => typeof size === 'string')
          : ['S', 'M', 'L', 'XL'],
        tags: Array.isArray(product.tags) 
          ? product.tags.filter(tag => typeof tag === 'string')
          : []
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddText = () => {
    if (!designText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    addTextToCanvas(designText, textColor, 'Arial');
    setDesignText('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        handleAddImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    addEmojiToCanvas(emoji);
  };

  const saveDesign = async () => {
    if (!currentUser || !selectedProduct || !hasDesignElements()) {
      toast.error('Please add at least one design element before saving');
      return null;
    }

    try {
      const designData = {
        id: `design_${Date.now()}`,
        user_id: currentUser.id,
        product_id: selectedProduct.id,
        design_data: {
          canvas: canvas?.toJSON(),
          activeProduct,
          productView,
          isDualSided,
        },
        product_type: activeProduct,
        product_view: productView,
        is_dual_sided: isDualSided
      };
      
      localStorage.setItem(`design_${designData.id}`, JSON.stringify(designData));
      toast.success('Design saved!');
      return designData.id;
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
      return null;
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      navigate('/signin');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!hasDesignElements()) {
      toast.error('Please add at least one design element before placing your order');
      return;
    }

    const designId = await saveDesign();
    if (!designId) return;

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const total = selectedProduct!.price * quantity;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          order_number: orderNumber,
          total,
          items: [{
            product_id: selectedProduct!.id,
            name: selectedProduct!.name,
            price: selectedProduct!.price,
            quantity,
            size: selectedSize,
            custom_design: true
          }],
          status: 'processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast.success('Order placed successfully!');
      navigate(`/track-order/${orderData.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return (
      <Layout>
        <SEOHelmet {...seoData} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Design Your Product</h1>
            </div>
          </div>
        </div>

        {/* Single Page Layout with All Components */}
        <div className="p-4 space-y-6">
          {/* Product Selection */}
          {!selectedProduct && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-center">Select Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => {
                      setSelectedProduct(product);
                      if (product.category === 'tshirt') {
                        setActiveProduct('tshirt');
                        setIsDualSided(true);
                      } else if (product.category === 'mug') {
                        setActiveProduct('mug');
                        setIsDualSided(false);
                      } else if (product.category === 'cap') {
                        setActiveProduct('cap');
                        setIsDualSided(false);
                      }
                    }}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-center">{product.name}</h3>
                    <p className="text-green-600 text-center font-medium">₹{product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Design Components in One View */}
          {selectedProduct && (
            <>
              {/* Product Views and Dual-sided Option */}
              {activeProduct === 'tshirt' && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">T-Shirt Views</h3>
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={productView === 'front' ? 'default' : 'outline'}
                      onClick={() => setProductView('front')}
                      size="sm"
                    >
                      Front
                    </Button>
                    <Button
                      variant={productView === 'back' ? 'default' : 'outline'}
                      onClick={() => setProductView('back')}
                      size="sm"
                    >
                      Back
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDualSided}
                        onChange={(e) => setIsDualSided(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">I want to print on both sides (₹300.00)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Design Canvas */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Design Canvas</h3>
                <div className="flex justify-center mb-4">
                  {canvasInitialized && (
                    <DesignCanvas
                      activeProduct={activeProduct}
                      productView={productView}
                      canvas={canvas}
                    />
                  )}
                </div>
              </div>

              {/* Customization Options */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Add Design Elements</h3>
                
                {/* Text Section */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Add Text
                  </h4>
                  <div className="space-y-3">
                    <Input
                      value={designText}
                      onChange={(e) => setDesignText(e.target.value)}
                      placeholder="Enter your text"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-16"
                      />
                      <Button onClick={handleAddText} className="flex-1">
                        Add Text
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Add Image
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload an image</p>
                    </label>
                  </div>
                </div>

                {/* Emoji Section */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Smile className="h-5 w-5" />
                    Add Emoji
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {['😊', '😎', '❤️', '🔥', '⭐', '🎉', '👍', '💪', '🌟', '🚀', '🎨', '✨'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="p-2 text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Select Size</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {selectedProduct.sizes?.map(size => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="aspect-square"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Available stock: 0 items</p>
              </div>

              {/* Product Summary and Actions */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                  <span className="text-2xl font-bold text-green-600">₹{selectedProduct.price}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{selectedSize || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  {isDualSided && (
                    <div className="flex justify-between">
                      <span>Dual-sided printing:</span>
                      <span>₹300.00</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button variant="outline" onClick={saveDesign}>
                    Save Design
                  </Button>
                  <Button onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </div>
                
                {!hasDesignElements() && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    Please add some design elements
                  </p>
                )}
                
                {!selectedSize && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    Please select a size
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DesignTool;
