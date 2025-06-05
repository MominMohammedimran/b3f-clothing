
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
  const [managingSizeProduct, setManagingSizeProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const transformedProducts: Product[] = data.map((product: any) => ({
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
          tags: Array.isArray(product.tags) ? product.tags : [],
          variants: product.variants || []
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.originalPrice,
            discount_percentage: productData.discountPercentage,
            category: productData.category,
            stock: productData.stock,
            image: productData.image,
            images: productData.images,
            sizes: productData.sizes,
            tags: productData.tags,
            code: productData.code,
            variants: productData.variants || [],
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.originalPrice,
            discount_percentage: productData.discountPercentage,
            category: productData.category,
            stock: productData.stock,
            image: productData.image,
            images: productData.images,
            sizes: productData.sizes,
            tags: productData.tags,
            code: productData.code,
            variants: productData.variants || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      await fetchProducts();
      setEditingProduct(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleInventoryUpdate = async (productId: string, inventory: Record<string, number>) => {
    try {
      // Convert inventory object to variants array format
      const variants = Object.entries(inventory).map(([size, stock]) => ({
        size,
        stock
      }));

      const { error } = await supabase
        .from('products')
        .update({
          variants: variants,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', productId);

      if (error) throw error;

      await fetchProducts();
      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatInventoryDisplay = (product: Product) => {
    if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return 'No sizes configured';
    }
    
    return product.variants
      .map((variant: any) => `${variant.size?.toUpperCase()}:${variant.stock || 0}`)
      .join(' ');
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || !Array.isArray(product.variants)) return 0;
    return product.variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);
  };

  const getCurrentInventory = (product: Product) => {
    if (!product.variants || !Array.isArray(product.variants)) return {};
    
    const inventory: Record<string, number> = {};
    product.variants.forEach((variant: any) => {
      if (variant.size) {
        inventory[variant.size.toLowerCase()] = variant.stock || 0;
      }
    });
    return inventory;
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
          currentInventory={getCurrentInventory(managingSizeProduct)}
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
                          <strong>Size Inventory:</strong> {formatInventoryDisplay(product)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Total Stock:</strong> {getTotalStock(product)} units
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
