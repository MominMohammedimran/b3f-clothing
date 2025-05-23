
import React from 'react';

interface BoundaryBoxProps {
  productType: string;
  view?: string;
}

const BoundaryBox: React.FC<BoundaryBoxProps> = ({ productType, view = 'front' }) => {
  // Return different boundary dimensions based on product type
  const getBoundaryStyle = () => {
    const commonStyles = "border-2 border-dashed border-blue-500 absolute z-10 pointer-events-none";
    
    switch (productType) {
      case 'tshirt':
        if (view === 'front') {
          return {
            className: commonStyles,
            style: {
              left: '175px',
              top: '120px',
              width: '150px',
              height: '200px'
            }
          };
        } else if (view === 'back') {
          return {
            className: commonStyles,
            style: {
              left: '175px',
              top: '120px',
              width: '150px',
              height: '200px'
            }
          };
        }
        break;
      case 'mug':
        return {
          className: commonStyles,
          style: {
            left: '150px',
            top: '100px',
            width: '100px',
            height: '150px'
          }
        };
      case 'cap':
        return {
          className: commonStyles,
          style: {
            left: '150px',
            top: '100px',
            width: '120px',
            height: '80px'
          }
        };
      default:
        return {
          className: commonStyles,
          style: {
            left: '175px',
            top: '120px',
            width: '150px',
            height: '200px'
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
