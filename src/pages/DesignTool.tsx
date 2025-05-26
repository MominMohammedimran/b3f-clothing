
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import DesignCanvas from '../components/design/DesignCanvas';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';

const DesignTool = () => {
  const { productkey } = useParams<{ productkey: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
      // Store design data in localStorage as fallback
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
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh] mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Design Tool</h1>
        </div>

        {/* PRODUCT SELECTION - TOP */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Select Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-gray-600">₹{product.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DESIGN CANVAS - MIDDLE */}
        {selectedProduct && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Design Your Product</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Design Tools */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Design Tools</h3>
                
                {/* View Selection for T-shirt */}
                {activeProduct === 'tshirt' && (
                  <div className="space-y-2">
                    <Label>View</Label>
                    <Select value={productView} onValueChange={setProductView}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Front</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Add Text */}
                <div className="space-y-2">
                  <Label>Add Text</Label>
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
                  </div>
                  <Button onClick={handleAddText} className="w-full" size="sm">
                    Add Text
                  </Button>
                </div>

                {/* Add Image */}
                <div className="space-y-2">
                  <Label>Add Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Add Emoji */}
                <div className="space-y-2">
                  <Label>Add Emoji</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {['😀', '😍', '🔥', '✨', '❤️', '👍', '🎉', '⭐'].map(emoji => (
                      <Button
                        key={emoji}
                        variant="outline"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-lg p-1"
                        size="sm"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Canvas</h3>
                <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                  {canvasInitialized && (
                    <DesignCanvas
                      activeProduct={activeProduct}
                      productView={productView}
                      canvas={canvas}
                    />
                  )}
                </div>
              </div>

              {/* Product Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Preview</h3>
                <div className="border rounded-lg p-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h4 className="font-bold text-sm">{selectedProduct.name}</h4>
                  <p className="text-gray-600">₹{selectedProduct.price}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLACE ORDER - BOTTOM */}
        {selectedProduct && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.sizes?.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-bold mb-2">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{selectedProduct?.name}</span>
                      <span>₹{selectedProduct?.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{((selectedProduct?.price || 0) * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handlePlaceOrder} className="w-full" size="lg">
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DesignTool;
