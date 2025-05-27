
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  options?: ProductOption[];
  featured?: boolean;
}

export type ProductCategory = 'tshirts' | 'hoodies' | 'mugs' | 'posters' | 'phone-cases';

export interface ProductOption {
  name: string;
  values: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    description: 'Premium quality cotton t-shirt perfect for custom designs. Super soft and comfortable for everyday wear.',
    price: 24.99,
    category: 'tshirts',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', values: ['White', 'Black', 'Gray'] }
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Vintage Hoodie',
    description: 'Warm and cozy hoodie made from high-quality materials. Perfect for those chilly days.',
    price: 49.99,
    category: 'hoodies',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['Navy', 'Black', 'Heather Gray'] }
    ],
    featured: true
  },
  {
    id: '3',
    name: 'Ceramic Coffee Mug',
    description: 'Dishwasher and microwave safe 11oz ceramic mug. The perfect canvas for your custom design.',
    price: 14.99,
    category: 'mugs',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Color', values: ['White', 'Black'] }
    ]
  },
  {
    id: '4',
    name: 'Art Print Poster',
    description: 'High-quality print on premium paper. Available in multiple sizes to fit your space perfectly.',
    price: 19.99,
    category: 'posters',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['11x17', '18x24', '24x36'] }
    ],
    featured: true
  },
  {
    id: '5',
    name: 'Protective Phone Case',
    description: 'Durable and slim-fitting case to protect your phone while showcasing your unique style.',
    price: 29.99,
    category: 'phone-cases',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Model', values: ['iPhone 13', 'iPhone 14', 'Samsung Galaxy S22', 'Google Pixel 7'] }
    ]
  },
  {
    id: '6',
    name: 'Graphic Design T-Shirt',
    description: 'Stand out with this eye-catching graphic tee. Made with premium cotton for maximum comfort.',
    price: 27.99,
    category: 'tshirts',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['White', 'Black'] }
    ]
  },
  {
    id: '7',
    name: 'Minimalist Wall Art',
    description: 'Elegant and modern wall art that complements any room. Printed on high-quality paper.',
    price: 24.99,
    category: 'posters',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['11x17', '18x24'] }
    ]
  },
  {
    id: '8',
    name: 'Custom Zip-Up Hoodie',
    description: 'Premium quality zip-up hoodie that combines style and comfort. Perfect for customization.',
    price: 54.99,
    category: 'hoodies',
    images: ['/placeholder.svg', '/placeholder.svg'],
    options: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['Navy', 'Black', 'Gray'] }
    ]
  }
];

export const categories = [
  { id: 'tshirts', name: 'T-Shirts', count: products.filter(p => p.category === 'tshirts').length },
  { id: 'hoodies', name: 'Hoodies', count: products.filter(p => p.category === 'hoodies').length },
  { id: 'mugs', name: 'Mugs', count: products.filter(p => p.category === 'mugs').length },
  { id: 'posters', name: 'Posters', count: products.filter(p => p.category === 'posters').length },
  { id: 'phone-cases', name: 'Phone Cases', count: products.filter(p => p.category === 'phone-cases').length },
];
