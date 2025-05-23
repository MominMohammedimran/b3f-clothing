
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { useDesignToolInventory } from '@/hooks/useDesignToolInventory';

const ProductInventory = () => {
  // Use the adapter hook instead of directly using useProductInventory
  const { sizeInventory, fetchProductInventory, updateInventory } = useDesignToolInventory();
  const [loading, setLoading] = React.useState(false);
  const [updatingItem, setUpdatingItem] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      await fetchProductInventory();
      setLoading(false);
    };
    
    loadInventory();
  }, [fetchProductInventory]);
  
  const handleQuantityChange = (productType: string, size: string, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    handleSaveInventory(productType, size, quantity);
  };
  
  const handleSaveInventory = async (productType: string, size: string, quantity: number) => {
    const itemKey = `${productType}_${size}`;
    try {
      setUpdatingItem(itemKey);
      // Calculate the difference for the adapter interface
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const delta = quantity - currentQuantity;
      const success = await updateInventory(productType, size, delta);
      
      if (success) {
        console.log(`Updated ${productType} ${size} inventory to ${quantity}`);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
    } finally {
      setUpdatingItem(null);
    }
  };
  
  const refreshInventory = async () => {
    setLoading(true);
    await fetchProductInventory();
    setLoading(false);
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-0">
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage product inventory levels</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage product inventory levels</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshInventory}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* T-shirts */}
        <div>
          <h3 className="text-lg font-medium mb-3">T-shirts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sizeInventory.tshirt || {}).map(([size, quantity]) => (
              <div key={`tshirt-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity.toString()}
                  onChange={(e) => handleQuantityChange('tshirt', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  disabled={updatingItem === `tshirt_${size}`}
                >
                  {updatingItem === `tshirt_${size}` ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mugs */}
        <div>
          <h3 className="text-lg font-medium mb-3">Mugs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sizeInventory.mug || {}).map(([size, quantity]) => (
              <div key={`mug-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity.toString()}
                  onChange={(e) => handleQuantityChange('mug', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  disabled={updatingItem === `mug_${size}`}
                >
                  {updatingItem === `mug_${size}` ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Caps */}
        <div>
          <h3 className="text-lg font-medium mb-3">Caps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sizeInventory.cap || {}).map(([size, quantity]) => (
              <div key={`cap-${size}`} className="flex items-center space-x-2">
                <div className="w-12 text-sm font-medium">{size}</div>
                <Input
                  type="number"
                  min="0"
                  value={quantity.toString()}
                  onChange={(e) => handleQuantityChange('cap', size, e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm"
                  disabled={updatingItem === `cap_${size}`}
                >
                  {updatingItem === `cap_${size}` ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Save className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">
          Inventory is automatically updated when orders are placed or when manually adjusted here.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProductInventory;
