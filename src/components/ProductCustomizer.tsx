import { useState } from 'react';
import { Product, ProductOption } from '@/data/products';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';

interface ProductCustomizerProps {
  product: Product;
}

const ProductCustomizer = ({ product }: ProductCustomizerProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options with first value of each option
  useState(() => {
    if (product.options) {
      const initialOptions: Record<string, string> = {};
      product.options.forEach(option => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  });

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || '',
      size: Object.values(selectedOptions)[0] || undefined,
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Product Image */}
      <div className="w-full md:w-1/2">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        
        {/* Thumbnail preview */}
        {product.images.length > 1 && (
          <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                  index === currentImageIndex ? 'border-brand-navy' : 'border-transparent'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${product.name} preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Options & Customization */}
      <div className="w-full md:w-1/2 space-y-6">
        {/* Product info */}
        <div>
          <span className="inline-block bg-brand-lightBlue bg-opacity-20 px-2 py-1 text-xs font-medium text-brand-navy rounded-full mb-2">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-xl font-medium text-gray-900 mt-2">${product.price.toFixed(2)}</p>
          <div className="mt-4 text-gray-600">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Options */}
        {product.options && product.options.map((option: ProductOption) => (
          <div key={option.name} className="space-y-3">
            <h3 className="font-medium">Select {option.name}</h3>
            <RadioGroup 
              value={selectedOptions[option.name] || ''}
              onValueChange={(value) => handleOptionChange(option.name, value)}
              className="flex flex-wrap gap-3"
            >
              {option.values.map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`${option.name}-${value}`} />
                  <Label htmlFor={`${option.name}-${value}`}>{value}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        {/* Quantity Selector */}
        <div className="space-y-3">
          <h3 className="font-medium">Quantity</h3>
          <div className="flex items-center w-full max-w-[140px]">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              className="h-10 w-10 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              className="h-10 rounded-none text-center border-x-0"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              className="h-10 w-10 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart} 
          className="w-full mt-6 btn-coral"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCustomizer;
