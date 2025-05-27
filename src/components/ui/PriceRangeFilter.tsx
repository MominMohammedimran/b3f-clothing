
import { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

const PriceRangeFilter = ({ minPrice, maxPrice, onChange }: PriceRangeFilterProps) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minPrice && value <= max) {
      setMin(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= maxPrice) {
      setMax(value);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value);
    if (type === 'min') {
      if (value <= max) setMin(value);
    } else {
      if (value >= min) setMax(value);
    }
  };

  useEffect(() => {
    onChange(min, max);
  }, [min, max, onChange]);

  // Reset to initial values when minPrice or maxPrice props change
  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-medium mb-4">Price Range</h3>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm">₹{min}</span>
          <span className="text-sm">₹{max}</span>
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute h-full bg-yellow-400 rounded-full"
            style={{
              left: `${((min - minPrice) / (maxPrice - minPrice)) * 100}%`,
              right: `${((maxPrice - max) / (maxPrice - minPrice)) * 100}%`
            }}
          ></div>
        </div>
        
        <div className="relative mt-4">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={min}
            onChange={(e) => handleRangeChange(e, 'min')}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
            style={{ zIndex: 3 }}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={max}
            onChange={(e) => handleRangeChange(e, 'max')}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
            style={{ zIndex: 4 }}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <span className="text-gray-600 mr-1">₹</span>
          <input
            type="number"
            value={min}
            onChange={handleMinChange}
            className="w-20 p-1 border rounded"
            min={minPrice}
            max={max}
          />
        </div>
        <span>to</span>
        <div className="flex items-center">
          <span className="text-gray-600 mr-1">₹</span>
          <input
            type="number"
            value={max}
            onChange={handleMaxChange}
            className="w-20 p-1 border rounded"
            min={min}
            max={maxPrice}
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
