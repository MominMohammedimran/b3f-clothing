
import { Product, Category, Order, TrackingInfo, Review, Location, ShippingAddress } from './types';

export const products: Product[] = [
  {
    id: '1',
    productId:'1',
    code: 'PANT',
    name: 'Night pant for men',
    price: 300,
    original_price: 600,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/night-pant.png',
    images: [
      '/lovable-uploads/main-categorie/night-pant.png',
      '/lovable-uploads/hero-categorie/pant.png',
      '/lovable-uploads/main-categorie/cargo-pant.png',
      '/lovable-uploads/hero-categorie/pant.png'
    ],
    rating: 5,
    category: 'pants',
    tags: ['pants', 'night', 'men'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Comfortable night pants perfect for relaxing at home.'
  },
  {
    id: '2',
    productId:'2',
    code: 'TSHIRT-PRINT',
    name: 'Round neck tshirt for Men',
    price: 200,
    original_price: 400,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/tshirt-print.png',
    images: [
      '/lovable-uploads/main-categorie/tshirt-print.png',
      '/lovable-uploads/hero-categorie/tshirt-print.png',
      '/lovable-uploads/design-tool-page/tshirt-sub-images/front.png',
      '/lovable-uploads/design-tool-page/tshirt-sub-images/back.png'
    ],
    rating: 5,
    category: 'tshirts',
    tags: ['tshirts', 'round neck', 'men'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Classic round neck t-shirt, perfect for everyday wear.'
  },
  {
    id: '3',
    productId:'3',
    code: 'PANT',
    name: 'Cargo pant for men 6 Pocket',
    price: 450,
    original_price: 900,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/cargo-pant.png',
    images: [
      '/lovable-uploads/main-categorie/cargo-pant.png',
      '/lovable-uploads/hero-categorie/pant.png',
      '/lovable-uploads/main-categorie/night-pant.png',
      '/lovable-uploads/hero-categorie/pant.png'
    ],
    rating: 5,
    category: 'pants',
    tags: ['pants', 'cargo', 'men'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: '6-pocket cargo pants, perfect for a casual outing.'
  },
  {
    id: '4',
    productId:'4',
    code: 'MUG-PRINT',
    name: 'Custom printed mug',
    price: 250,
    original_price: 500,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/mug-print.png',
    images: [
      '/lovable-uploads/main-categorie/mug-print.png',
      '/lovable-uploads/hero-categorie/mug-print.png',
      '/lovable-uploads/design-tool-page/mug-print.png',
      '/lovable-uploads/banner-images/mug-banner.png'
    ],
    rating: 5,
    category: 'mugs',
    tags: ['mugs', 'custom', 'print'],
    description: 'Custom printed mug, perfect for gifting.'
  },
  {
    id: '5',
    productId:'5',
    code: 'CAP-PRINT',
    name: 'Custom printed cap',
    price: 200,
    original_price: 400,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/cap-print.png',
    images: [
      '/lovable-uploads/main-categorie/cap-print.png',
      '/lovable-uploads/hero-categorie/cap-print.png',
      '/lovable-uploads/design-tool-page/cap-print.png',
      '/lovable-uploads/banner-images/cap-banner.png'
    ],
    rating: 5,
    category: 'caps',
    tags: ['caps', 'custom', 'print'],
    description: 'Custom printed cap, perfect for casual wear.'
  },
  {
    id: '6',
    productId:'6',
    code: 'SHIRT',
    name: 'Blue color shirt',
    price: 400,
    original_price: 800,
    discount_percentage: 50,
    image: '/lovable-uploads/main-categorie/shirt-image.png',
    images: [
      '/lovable-uploads/main-categorie/shirt-image.png',
      '/lovable-uploads/hero-categorie/shirt.png',
      '/lovable-uploads/main-categorie/shirt-image.png',
      '/lovable-uploads/hero-categorie/shirt.png'
    ],
    rating: 5,
    category: 'shirts',
    tags: ['Round-neck-shirt', 'shirt', 'men'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Stylish blue shirt, perfect for formal occasions.'
  }
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Shirts',
    icon: '/lovable-uploads/hero-categorie/shirt.png',
    slug: 'shirts'
  },
  {
    id: '2',
    name: 'Pants',
    icon: '/lovable-uploads/hero-categorie/pant.png',
    slug: 'pants'
  },
  {
    id: '3',
    name: 'Tshirt-print',
    icon: '/lovable-uploads/hero-categorie/tshirt-print.png',
    slug: 'tshirt-print'
  },
  {
    id: '4',
    name: 'mug-print',
    icon: '/lovable-uploads/hero-categorie/mug-print.png',
    slug: 'mug-print'
  },
  {
    id: '5',
    name: 'cap-print',
    icon: '/lovable-uploads/hero-categorie/cap-print.png',
    slug: 'cap-print'
  },
 
];

export const orders: Order[] = [
  {
    id: 'id12345',
    order_number: 'ORD12345',
    user_id: 'user123',
    items: [
      {
        id: '1',
        productId: '3',
        name: 'Cargo pant for men 6 Pocket',
        price: 490,
        quantity: 1,
        image: '/lovable-uploads/3ca5dda5-1a3b-4301-bc74-8f7eff75d39a.png',
        size: 'S'
      },
      {
        id: '2',
        productId: '3',
        name: 'Cargo pant for men 6 Pocket',
        price: 490,
        quantity: 1,
        image: '/lovable-uploads/3ca5dda5-1a3b-4301-bc74-8f7eff75d39a.png',
        size: 'M'
      }
    ],
    status: 'delivered',
    date: '2023-05-15',
    created_at: '2023-05-15',
    total: 980,
    delivery_fee: 100,
    payment_method: 'upi',
    shipping_address: {} as ShippingAddress
  },
  {
    id: 'id12346',
    order_number: 'ORD12346',
    user_id: 'user123',
    items: [
      {
        id: '3',
        productId: '4',
        name: 'Custom printed mug',
        price: 490,
        quantity: 1,
        image: '/lovable-uploads/087a6eef-8a80-4d2e-9c39-cfef23ada4cd.png'
      }
    ],
    status: 'processing',
    date: '2023-05-20',
    created_at: '2023-05-20',
    total: 490,
    delivery_fee: 100,
    payment_method: 'upi',
    shipping_address: {} as ShippingAddress
  }
];

export const trackingData: TrackingInfo[] = [
  {
    order_id: 'id12346',
    id: 'tracking-1',
    status: "Received",
    location: "Gurugram, IN",
    date: "01 Jul, 2021",
    time: "10:25 Am",
    estimatedDelivery: "03 Jul, 2021",
    currentLocation: "Gurugram, IN",
    timestamp: "2021-07-01T10:25:00Z",
    history: [
      {
        timestamp: "2021-07-01T10:25:00Z",
        status: "Order Received",
        description: "Order has been received and is being processed",
        location: "Gurugram, IN"
      }
    ]
  },
  {
    order_id: 'id12346',
    id: 'tracking-2',
    status: "Picked",
    location: "Noida, IN",
    date: "01 Jul, 2021",
    time: "07:04 Pm",
    estimatedDelivery: "03 Jul, 2021",
    currentLocation: "Noida, IN",
    timestamp: "2021-07-01T19:04:00Z",
    history: [
      {
        timestamp: "2021-07-01T10:25:00Z",
        status: "Order Received",
        description: "Order has been received and is being processed",
        location: "Gurugram, IN"
      },
      {
        timestamp: "2021-07-01T19:04:00Z",
        status: "Order Picked",
        description: "Your order has been picked up for shipping",
        location: "Noida, IN"
      }
    ]
  },
  {
    order_id: 'id12346',
    id: 'tracking-3',
    status: "In-transit",
    location: "Noida, IN",
    date: "01 Jul, 2021",
    time: "10:34 Pm",
    estimatedDelivery: "03 Jul, 2021",
    currentLocation: "Noida, IN",
    timestamp: "2021-07-01T22:34:00Z",
    history: [
      {
        timestamp: "2021-07-01T10:25:00Z",
        status: "Order Received",
        description: "Order has been received and is being processed",
        location: "Gurugram, IN"
      },
      {
        timestamp: "2021-07-01T19:04:00Z",
        status: "Order Picked",
        description: "Your order has been picked up for shipping",
        location: "Noida, IN"
      },
      {
        timestamp: "2021-07-01T22:34:00Z",
        status: "In-transit",
        description: "Your order is on the way",
        location: "Noida, IN"
      }
    ]
  },
  {
    order_id: 'id12346',
    id: 'tracking-4',
    status: "Out for delivery",
    location: "Noida, IN",
    date: "02 Jul, 2021",
    time: "07:22 Am",
    estimatedDelivery: "03 Jul, 2021",
    currentLocation: "Noida, IN",
    timestamp: "2021-07-02T07:22:00Z",
    history: [
      {
        timestamp: "2021-07-01T10:25:00Z",
        status: "Order Received",
        description: "Order has been received and is being processed",
        location: "Gurugram, IN"
      },
      {
        timestamp: "2021-07-01T19:04:00Z",
        status: "Order Picked",
        description: "Your order has been picked up for shipping",
        location: "Noida, IN"
      },
      {
        timestamp: "2021-07-01T22:34:00Z",
        status: "In-transit",
        description: "Your order is on the way",
        location: "Noida, IN"
      },
      {
        timestamp: "2021-07-02T07:22:00Z",
        status: "Out for delivery",
        description: "Your order is out for delivery",
        location: "Noida, IN"
      }
    ]
  }
];

export const popularSearches = [
  "T-shirts",
  "Custom Mugs",
  "Shirts",
  "Pants",
];

export const reviews: Review[] = [
  {
    id: '1',
    user_id: 'user1',
    product_id: '1',
    rating: 5,
    comment: 'Awesome',
    created_at: '2025-01-25T00:00:00Z',
    userId: 'user1', // Keep for backwards compatibility
    userName: 'Pavan Raj',
    text: 'Awesome', // Keep for backward compatibility
    date: '25-01-2025',
    helpful: 0
  },
  {
    id: '2',
    user_id: 'user2',
    product_id: '2',
    rating: 5,
    comment: 'Awesome',
    created_at: '2025-01-25T00:00:00Z',
    userId: 'user2', // Keep for backwards compatibility
    userName: 'Rohit Raj',
    text: 'Awesome', // Keep for backward compatibility
    date: '25-01-2025',
    helpful: 0
  }
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
