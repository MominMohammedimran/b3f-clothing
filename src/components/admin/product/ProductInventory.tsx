
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useDesignToolInventory } from '@/hooks/useDesignToolInventory';
import { toast } from 'sonner';

const ProductInventory = () => {
  const { sizeInventory, fetchProductInventory, updateInventory } = useDesignToolInventory();
  const [loading, setLoading] = React.useState(false);
  const [updatingItem, setUpdatingItem] = React.useState<string | null>(null);
  const [localInventory, setLocalInventory] = React.useState<any>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      try {
        await fetchProductInventory();
        console.log('Inventory loaded successfully');
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    
    loadInventory();
  }, [fetchProductInventory]);

  React.useEffect(() => {
    if (sizeInventory && Object.keys(sizeInventory).length > 0) {
      setLocalInventory(JSON.parse(JSON.stringify(sizeInventory))); // Deep copy
      setErrors({});
      console.log('Local inventory updated:', sizeInventory);
    }
  }, [sizeInventory]);
  
  const handleQuantityChange = (productType: string, size: string, value: string) => {
    const quantity = parseInt(value, 10);
    
    // Validate input
    if (value === '' || isNaN(quantity) || quantity < 0) {
      setErrors(prev => ({
        ...prev,
        [`${productType}_${size}`]: 'Please enter a valid positive number'
      }));
      
      // Still update local state to show user input
      setLocalInventory((prev: any) => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: value === '' ? 0 : quantity || 0
        }
      }));
      return;
    }
    
    // Clear error if valid
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${productType}_${size}`];
      return newErrors;
    });

    setLocalInventory((prev: any) => ({
      ...prev,
      [productType]: {
        ...prev[productType],
        [size]: quantity
      }
    }));
  };
  
  const handleSaveInventory = async (productType: string, size: string) => {
    const itemKey = `${productType}_${size}`;
    
    // Check for errors
    if (errors[itemKey]) {
      toast.error('Please fix the input error first');
      return;
    }

    try {
      setUpdatingItem(itemKey);
      
      const newQuantity = localInventory[productType]?.[size] || 0;
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      const delta = newQuantity - currentQuantity;
      
      console.log(`Updating ${productType} ${size}: current=${currentQuantity}, new=${newQuantity}, delta=${delta}`);
      
      // Validate new quantity
      if (newQuantity < 0) {
        toast.error('Quantity cannot be negative');
        return;
      }
      
      const success = await updateInventory(productType, size, delta);
      
      if (success) {
        toast.success(`✅ Updated ${productType} ${size} to ${newQuantity} units`);
        console.log(`Successfully updated ${productType} ${size} inventory to ${newQuantity}`);
        
        // Refresh inventory to get latest data
        await fetchProductInventory();
      } else {
        toast.error('❌ Failed to update inventory - please try again');
        console.error('Update inventory returned false');
        
        // Revert local changes
        setLocalInventory((prev: any) => ({
          ...prev,
          [productType]: {
            ...prev[productType],
            [size]: currentQuantity
          }
        }));
      }
    } catch (error: any) {
      console.error('Error saving inventory:', error);
      toast.error(`❌ Failed to save: ${error?.message || 'Unknown error'}`);
      
      // Revert local changes
      const currentQuantity = sizeInventory[productType]?.[size] || 0;
      setLocalInventory((prev: any) => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: currentQuantity
        }
      }));
    } finally {
      setUpdatingItem(null);
    }
  };
  
  const refreshInventory = async () => {
    setLoading(true);
    try {
      await fetchProductInventory();
      toast.success('✅ Inventory refreshed successfully');
      setErrors({});
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      toast.error('❌ Failed to refresh inventory');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = (productType: string, size: string) => {
    const currentValue = sizeInventory[productType]?.[size] || 0;
    const localValue = localInventory[productType]?.[size] || 0;
    return currentValue !== localValue;
  };

  const renderProductSection = (productType: string, productName: string) => {
    const productData = localInventory[productType] || {};
    
    return (
      <div key={productType}>
        <h3 className="text-lg font-medium mb-3 text-gray-800">{productName} Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(productData).map(([size, quantity]) => {
            const itemKey = `${productType}_${size}`;
            const hasError = errors[itemKey];
            const isChanged = hasChanges(productType, size);
            const isUpdating = updatingItem === itemKey;
            
            return (
              <div key={itemKey} className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-16 text-sm font-medium text-gray-700 text-center">
                  {size.toUpperCase()}
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    value={quantity?.toString() || '0'}
                    onChange={(e) => handleQuantityChange(productType, size, e.target.value)}
                    className={`w-20 text-center ${
                      hasError ? 'border-red-500 bg-red-50' : 
                      isChanged ? 'border-yellow-500 bg-yellow-50' : 
                      'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={isUpdating}
                  />
                  {hasError && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {hasError}
                    </div>
                  )}
                  {isChanged && !hasError && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Unsaved changes
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleSaveInventory(productType, size)}
                  disabled={isUpdating || Boolean(hasError) || !isChanged}
                  variant={isChanged && !hasError ? "default" : "outline"}
                  className={isChanged && !hasError ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isUpdating ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Save className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
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
          <CardTitle>Product Inventory Management</CardTitle>
          <CardDescription>Update inventory levels for products. Changes are saved individually.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshInventory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderProductSection('tshirt', 'T-shirts')}
        {renderProductSection('mug', 'Mugs')}
        {renderProductSection('cap', 'Caps')}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-600 space-y-1">
          <p>💡 <strong>Tips:</strong></p>
          <p>• Yellow borders indicate unsaved changes</p>
          <p>• Red borders indicate input errors</p>
          <p>• Save changes individually for each item</p>
          <p>• Use the refresh button to reload latest inventory data</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductInventory;
