import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { fabric } from 'fabric';
import { Button } from "@/components/ui/button";

// This is a simple placeholder for the product designer page
const ProductDesigner = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('tshirt');
  const [activeImage, setActiveImage] = useState<string>('/lovable-uploads/main-categorie/tshirt-print.png');

  useEffect(() => {
    if (canvas) return;
    
    const fabricCanvas = new fabric.Canvas('design-canvas', {
      width: 500,
      height: 500,
      backgroundColor: '#f0f0f0'
    });
    
    setCanvas(fabricCanvas);
    
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Example product that now uses original_price instead of originalPrice
  const sampleProduct = {
    id: '1',
    code: 'TSHIRT-001',
    name: 'Custom T-Shirt',
    description: 'Design your own custom t-shirt',
    price: 25.99,
    original_price: 32.99,
    discount_percentage: 20,
    image: '/lovable-uploads/main-categorie/tshirt-print.png',
    rating: 4.5,
    category: 'tshirts',
    tags: ['custom', 'tshirt', 'design'],
    stock: 100
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Product Designer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border p-4 rounded-lg bg-white">
            <div className="aspect-square relative">
              <canvas id="design-canvas" className="absolute inset-0"></canvas>
            </div>
            
            <div className="mt-4 flex justify-center space-x-4">
              <Button variant="outline">Add Text</Button>
              <Button variant="outline">Add Image</Button>
              <Button variant="outline">Clear Design</Button>
            </div>
          </div>
          
          <div className="border p-4 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4">Design Options</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Product</label>
              <select 
                className="w-full p-2 border rounded"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="tshirt">T-Shirt</option>
                <option value="mug">Mug</option>
                <option value="hoodie">Hoodie</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex space-x-2">
                <div 
                  className="w-6 h-6 rounded-full bg-white border cursor-pointer"
                  onClick={() => {}}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full bg-black cursor-pointer"
                  onClick={() => {}}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full bg-red-500 cursor-pointer"
                  onClick={() => {}}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full bg-blue-500 cursor-pointer"
                  onClick={() => {}}
                ></div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Size</label>
              <select className="w-full p-2 border rounded">
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </div>
            
            <div className="pt-6 mt-6 border-t">
              <div className="flex justify-between mb-2">
                <span>Price:</span>
                <span className="font-semibold">${sampleProduct.price}</span>
              </div>
              
              <Button className="w-full">Add to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDesigner;
