
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image?: string;
  category?: string;
  stock?: number;
  code?: string;
  variants?: { size: string; stock: number }[];
  created_at: string;
  productId?: string;
  images: string[]; // multiple image URLs
  tags?: any;
  colors?: any;
  sizes?: any;
  updated_at?: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    image: '',
    category: '',
    stock: '',
    code: '',
    variants: [] as { size: string; stock: number }[],
    images: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const transformedProducts = data.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : [],
          variants: Array.isArray(p.variants) ? p.variants : [],
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: '',
      image: '',
      category: '',
      stock: '',
      code: '',
      variants: [],
      images: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : 0,
        image: formData.image || null,
        category: formData.category || null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        code: formData.code || null,
        variants: formData.variants,
        productId: editingProduct?.productId || `product_${Date.now()}`,
        images: formData.images,
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product created');
      }

      setShowCreateDialog(false);
      resetForm();
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      toast.error('Error saving product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      discount_percentage: product.discount_percentage?.toString() || '',
      image: product.image || '',
      category: product.category || '',
      stock: product.stock?.toString() || '',
      code: product.code || '',
      variants: product.variants || [],
      images: product.images || [],
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      toast.success('Deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: '', stock: 0 }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: 'size' | 'stock', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModernAdminLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Products</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Create Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form Fields */}
                <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <div><Label>Price</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
                <div><Label>Original Price</Label><Input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} /></div>
                <div><Label>Discount (%)</Label><Input type="number" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
                <div><Label>Code</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
                <div><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} /></div>

                {/* Main Image */}
                <div>
                  <Label>Main Image</Label>
                  <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                  {formData.image && <img src={formData.image} className="w-28 h-28 mt-2 object-cover rounded border shadow" />}
                </div>

                {/* Multiple Images */}
                <div>
                  <Label>Image URLs (comma-separated)</Label>
                  <Textarea
                    value={formData.images.join(', ')}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map(url => url.trim()) })}
                  />
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {formData.images.map((img, i) => (
                        <img key={i} src={img} className="h-24 w-full object-cover rounded border shadow" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Variants */}
                <div>
                  <Label>Variants</Label>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input value={variant.size} onChange={(e) => updateVariant(index, 'size', e.target.value)} placeholder="Size" />
                      <Input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} placeholder="Stock" />
                      <Button size="sm" variant="destructive" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addVariant}><Plus className="h-4 w-4" /></Button>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setShowCreateDialog(false); setEditingProduct(null); }}>Cancel</Button>
                  <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        {/* Product Cards */}
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex gap-4">
                    <img src={product.image || '/placeholder.svg'} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">Code: {product.code}</p>
                      <p className="text-sm text-gray-500">Category: {product.category}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-lg font-bold">₹{product.price}</span>
                        {product.original_price && <span className="text-sm line-through text-gray-400">₹{product.original_price}</span>}
                        {product.discount_percentage && <Badge variant="destructive">{product.discount_percentage}% OFF</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && <div className="text-center text-gray-500 py-10">No products found</div>}
          </div>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProducts;
