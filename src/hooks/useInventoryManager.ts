
import { useState, useCallback } from 'react';
import { products } from '@/lib/data';
import { toast } from 'sonner';

interface InventoryData {
  [productId: string]: {
    [size: string]: number;
  };
}

export const useInventoryManager = () => {
  const [inventory, setInventory] = useState<InventoryData>({});
  const [loading, setLoading] = useState(false);

  // Parse inventory string like "s:5 m:8 l:12" into object
  const parseInventoryString = (inventoryStr: string): Record<string, number> => {
    if (!inventoryStr) return {};
    
    const result: Record<string, number> = {};
    const pairs = inventoryStr.toLowerCase().split(' ');
    
    pairs.forEach(pair => {
      const [size, quantity] = pair.split(':');
      if (size && quantity) {
        result[size.trim()] = parseInt(quantity.trim()) || 0;
      }
    });
    
    return result;
  };

  // Convert inventory object to string like "s:5 m:8 l:12"
  const stringifyInventory = (inventoryObj: Record<string, number>): string => {
    return Object.entries(inventoryObj)
      .map(([size, quantity]) => `${size.toLowerCase()}:${quantity}`)
      .join(' ');
  };

  // Fetch inventory for a specific product
  const fetchProductInventory = async (productId: string) => {
    try {
      // Use mock data from products array
      const product = products.find(p => p.id === productId);
      if (!product) return {};

      const inventoryData = parseInventoryString(product.description || '');
      setInventory(prev => ({
        ...prev,
        [productId]: inventoryData
      }));

      return inventoryData;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return {};
    }
  };

  // Update inventory for a specific product and size
  const updateInventory = async (productId: string, size: string, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);

      // Get current inventory
      const currentInventory = inventory[productId] || {};
      
      // Update the specific size
      const updatedInventory = {
        ...currentInventory,
        [size.toLowerCase()]: Math.max(0, quantity)
      };

      // Update local state
      setInventory(prev => ({
        ...prev,
        [productId]: updatedInventory
      }));

      // Update mock data
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        products[productIndex].description = stringifyInventory(updatedInventory);
      }

      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get available quantity for a specific product and size
  const getAvailableQuantity = (productId: string, size: string): number => {
    const productInventory = inventory[productId];
    if (!productInventory) return 0;
    
    return productInventory[size.toLowerCase()] || 0;
  };

  // Reduce inventory when item is purchased
  const reduceInventory = async (productId: string, size: string, quantityToReduce: number): Promise<boolean> => {
    const currentQuantity = getAvailableQuantity(productId, size);
    const newQuantity = currentQuantity - quantityToReduce;
    
    if (newQuantity < 0) {
      toast.error('Insufficient inventory');
      return false;
    }

    return await updateInventory(productId, size, newQuantity);
  };

  return {
    inventory,
    loading,
    fetchProductInventory,
    updateInventory,
    getAvailableQuantity,
    reduceInventory,
    parseInventoryString,
    stringifyInventory
  };
};
