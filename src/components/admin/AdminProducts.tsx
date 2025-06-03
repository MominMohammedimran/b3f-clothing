
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import ProductEditForm from './ProductEditForm';
import ProductSizeManager from './ProductSizeManager';
import { Product } from '@/lib/types';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeInventories, setSizeInventories] = useState<Record<string, Record<string, number>>>({});
  const [managingSizeProduct, setManagingSizeProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchSizeInventories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // First try to get products from a products table
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError && !productsError.message.includes('does not exist')) {
        throw productsError;
      }

      if (productsData && productsData.length > 0) {
        // Transform the data to match Product interface
        const transformedProducts: Product[] = productsData.map((product: any) => ({
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
          images: Array.isArray(product.images) ? product.images : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          tags: Array.isArray(product.tags) ? product.tags : []
        }));
        setProducts(transformedProducts);
      } else {
        // Fallback to settings table
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('type', 'products');

        if (settingsError) throw settingsError;

        if (settingsData && settingsData.length > 0) {
          const settingsValue = settingsData[0].settings;
          if (typeof settingsValue === 'object' && settingsValue !== null && 'products' in settingsValue) {
            const productsFromSettings = (settingsValue as { products: any[] }).products || [];
            setProducts(productsFromSettings);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeInventories = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'product_inventory');

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      if (data && data.length > 0) {
        const inventoryData = data[0].settings;
        const parsedInventories: Record<string, Record<string, number>> = {};
        
        if (typeof inventoryData === 'object' && inventoryData !== null) {
          Object.entries(inventoryData).forEach(([productId, inventoryString]) => {
            if (typeof inventoryString === 'string') {
              const sizes: Record<string, number> = {};
              inventoryString.split(' ').forEach(sizeEntry => {
                if (sizeEntry.includes(':')) {
                  const [size, qty] = sizeEntry.split(':');
                  sizes[size.toLowerCase()] = parseInt(qty) || 0;
                }
              });
              parsedInventories[productId] = sizes;
            }
          });
        }
        
        setSizeInventories(parsedInventories);
      }
    } catch (error) {
      console.error('Error fetching size inventories:', error);
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      let updatedProducts;
      
      if (editingProduct) {
        // Update existing product
        updatedProducts = products.map(p => 
          p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
        );
      } else {
        // Add new product
        const newProduct = {
          ...productData,
          id: `product_${Date.now()}`,
        };
        updatedProducts = [newProduct, ...products];
      }

      // Save to settings table as fallback
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'products',
          settings: { products: updatedProducts } as any
        });

      if (error) throw error;

      setProducts(updatedProducts);
      setEditingProduct(null);
      setShowAddForm(false);
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'products',
          settings: { products: updatedProducts } as any
        });

      if (error) throw error;

      setProducts(updatedProducts);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleInventoryUpdate = (productId: string, inventory: Record<string, number>) => {
    setSizeInventories(prev => ({
      ...prev,
      [productId]: inventory
    }));
    
    // Update the display immediately
    toast.success('Inventory updated successfully');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatInventoryDisplay = (productId: string) => {
    const inventory = sizeInventories[productId];
    if (!inventory || Object.keys(inventory).length === 0) {
      return 'No sizes configured';
    }
    
    return Object.entries(inventory)
      .map(([size, qty]) => `${size.toUpperCase()}:${qty}`)
      .join(' ');
  };

  const getTotalStock = (productId: string) => {
    const inventory = sizeInventories[productId];
    if (!inventory) return 0;
    return Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
  };

  if (editingProduct || showAddForm) {
    const productToEdit = editingProduct || {
      id: '',
      name: '',
      code: '',
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      image: '',
      images: [],
      category: '',
      sizes: [],
      stock: 0,
      description: '',
      tags: [],
      variants: []
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <Button
            variant="outline"
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(false);
            }}
          >
            Cancel
          </Button>
        </div>
        
        <ProductEditForm
          product={productToEdit}
          onSave={handleSaveProduct}
          onCancel={() => {
            setEditingProduct(null);
            setShowAddForm(false);
          }}
        />
      </div>
    );
  }

  if (managingSizeProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage Size Inventory</h2>
          <Button
            variant="outline"
            onClick={() => setManagingSizeProduct(null)}
          >
            Back to Products
          </Button>
        </div>
        
        <ProductSizeManager
          productId={managingSizeProduct.id}
          productName={managingSizeProduct.name}
          currentInventory={sizeInventories[managingSizeProduct.id] || {}}
          onInventoryUpdate={handleInventoryUpdate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">Code: {product.code}</p>
                      <p className="text-sm text-gray-600">Category: {product.category}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                        {product.discountPercentage && (
                          <Badge variant="destructive">{product.discountPercentage}% OFF</Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Size Inventory:</strong> {formatInventoryDisplay(product.id)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Total Stock:</strong> {getTotalStock(product.id)} units
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingSizeProduct(product)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Sizes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No products found matching your search.' : 'No products found. Add your first product!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
