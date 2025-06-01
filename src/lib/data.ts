
import { Product, Category, Order, TrackingInfo, Review, Location } from './types';

import { supabase } from '@/integrations/supabase/client';


// Resolved product list


// Orders array for compatibility
export let orders: Order[] = [];


const WORKER_BASE_URL = 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/';

function proxyUrl(url: string) {
  if (!url) return '';
  try {
    const path = new URL(url).pathname.replace(/^\/+/, '');
    return WORKER_BASE_URL + path;
  } catch {
    return url;
  }
}

function transformProductImages(products: any[]): Product[] {
  return products.map((product: any) => ({
    id: product.id?.toString(),
    productId: product.productId?.toString(),
    code: product.code || '',
    name: product.name || '',
    price: product.price || 0,
    originalPrice: product.original_price || 0,
    discountPercentage: product.discount_percentage || 0,
    image: proxyUrl(product.image || ''),
    images: (product.images || []).map(proxyUrl),
    rating: product.rating || 0,
    category: product.category || '',
    tags: product.tags || [],
    sizes: product.sizes || [],
    description: product.description || ''
  }));
}

export let products: Product[] = [];

async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  products = transformProductImages(data || []);
}

getProducts();

export const categories: Category[] = [
  {
    id: '1',
    name: 'Shirts',
    icon: 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/hero-categorie/shirt.webp'
  },
  {
    id: '2',
    name: 'Pants',
    icon: 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/hero-categorie/pant.webp'
  },
  {
    id: '3',
    name: 'Tshirt-print',
    icon: 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/hero-categorie/tshirt-print.webp'
  },
  {
    id: '4',
    name: 'mug-print',
    icon: 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/hero-categorie/mug-print.webp'
  },
  {
    id: '5',
    name: 'cap-print',
    icon: 'https://b3f-prints.mominmohammedimran11.workers.dev/proxy/product-images/hero-categorie/cap-print.webp'
  },
 
];



export const popularSearches = [
  "T-shirts",
  "Custom Mugs",
  "Shirts",
  "Pants",
];



export const locations: Location[] = [
  { id: '1', name: 'Andhra Pradesh', code: 'AP' },
  { id: '2', name: 'Karnataka', code: 'KA' },
  { id: '3', name: 'Tamil Nadu', code: 'TN' },
  { id: '4', name: 'Maharashtra', code: 'MH' },
  { id: '5', name: 'Delhi', code: 'DL' },
  { id: '6', name: 'Gujarat', code: 'GJ' },
  { id: '7', name: 'Kerala', code: 'KL' },
  { id: '8', name: 'Telangana', code: 'TG' },
  { id: '9', name: 'Uttar Pradesh', code: 'UP' },
  { id: '10', name: 'West Bengal', code: 'WB' }
];
