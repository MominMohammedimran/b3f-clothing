
import { Product, Category } from './types';
import { supabase } from '@/integrations/supabase/client';

// lib/data/products.ts

let _products: Product[] = [];
let loaded = false;

async function fetchProductsOnce() {
  if (loaded) return _products;

  const { data, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  _products = (data || []).map((product: any) => ({
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
    variants: Array.isArray(product.variants) ? product.variants : [],
  }));

  loaded = true;
  return _products;
}

// 🔁 Export a dynamic getter instead of plain array
export const products: Product[] = [];

fetchProductsOnce().then((result) => {
  products.splice(0, products.length, ...result); // fill exported array with real data
});


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
    name: 'Photo print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/cap-print.webp'
  },
  
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