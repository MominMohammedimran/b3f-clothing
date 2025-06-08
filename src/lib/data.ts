
import { Product, Category } from './types';
import { supabase } from '@/integrations/supabase/client';

// Resolved product list
export let products: Product[] = [];

async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  products = (data || []).map((product: any, index: number) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];

    // ✅ Debug log to check if variants are coming from Supabase
    console.log(`Product ${index + 1} (${product.name}) variants:`, variants);

    return {
      id: product.id?.toString(),
      productId: product.product_id?.toString() ?? product.id?.toString(),
      code: product.code || '',
      name: product.name || '',
      price: product.price || 0,
      originalPrice: product.original_price || 0,
      discountPercentage: product.discount_percentage || 0,
      image: product.image || '',
      images: product.images || [],
      rating: product.rating || 0,
      category: product.category || '',
      tags: product.tags || [],
      sizes: product.sizes || [],
      description: product.description || '',
      stock: product.stock || 0,
      variants:product.variants||[]
   
    };
  });
}

getProducts();

export const categories: Category[] = [
  {
    id: '1',
    name: 'T-Shirt Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/tshirt-print.webp'
  },
  {
    id: '2', 
    name: 'Mug Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/mug-print.webp'
  },
  {
    id: '3',
    name: 'Cap Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/cap-print.webp'
  },
  {
    id: '4',
    name: 'Pant', 
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/pant.webp'
  },
  {
    id: '5',
    name: 'Shirt',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/shirt.webp'
  }
];

// Mock orders data for OrdersHistory component
export const orders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        product_id: 'tshirt',
        name: 'Custom T-Shirt',
        image: '/lovable-uploads/tshirt.png',
        price: 250,
        quantity: 1
      }
    ],
    total: 250,
    status: 'delivered' as const,
    paymentMethod: 'razorpay',
    shippingAddress: {},
    createdAt: '2024-01-15T10:00:00Z',
    date: '2024-01-15T10:00:00Z'
  }
];