import React from 'react';

interface BoundaryBoxProps {
  productType: string;
  view?: string;
}

const BoundaryBox: React.FC<BoundaryBoxProps> = ({ productType, view = 'front' }) => {
  // Return different boundary dimensions based on product type - keeping within canvas bounds
  const getBoundaryStyle = () => {
    const commonStyles = "border-2 border-dashed border-blue-500 absolute z-10 pointer-events-none";
    
    switch (productType) {
      case 'tshirt':
        return {
          className: commonStyles,
          style: {
            left: '20%',
            top: '25%',
            width: '60%',
            height: '50%'
          }
        };
      case 'mug':
        return {
          className: commonStyles,
          style: {
            left: '25%',
            top: '30%',
            width: '50%',
            height: '40%'
          }
        };
      case 'cap':
        return {
          className: commonStyles,
          style: {
            left: '25%',
            top: '35%',
            width: '50%',
            height: '30%'
          }
        };
      default:
        return {
          className: commonStyles,
          style: {
            left: '20%',
            top: '25%',
            width: '60%',
            height: '50%'
          }
        };
    }
  };

  const boundaryStyle = getBoundaryStyle();

  return (
    <div 
      className={boundaryStyle.className}
      style={boundaryStyle.style}
    >
      <div className="absolute -top-6 left-0 right-0 text-center text-xs text-blue-600 font-medium">
        Design Area
      </div>
    </div>
  );
};

export default BoundaryBox;
