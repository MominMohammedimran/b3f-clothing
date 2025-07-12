
import React from 'react';

interface BoundaryBoxProps {
  productType: string;
  view: string;
}

const BoundaryBox: React.FC<BoundaryBoxProps> = ({ productType, view }) => {
  const getBoundaryStyle = () => {
    let style = {
      position: 'absolute' as const,
      border: '2px dashed #3b82f6',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };

    switch (productType) {
      case 'tshirt':
        return {
          ...style,
          top: view === 'back' ? '110px' : '130px',
          left: view === 'back' ? '105px' : '108px',
          width: '78px',
          height: '95px',
        };
      case 'photo_frame':
        // Different boundaries for different frame sizes
        switch (view) {
          case '8X12inch':
            return {
              ...style,
              top: '80px',
              left: '80px',
              width: '130px',
              height: '150px',
            };
          case '12x16inch':
            return {
              ...style,
              top: '100px',
              left: '100px',
              width: '120px',
              height: '150px',
            };
          case '5x7 inch':
            return {
              ...style,
               top: '100px',
              left: '105px',
              width: '90px',
              height: '100px',
            };
          default:
            return {
              ...style,
              top: '50px',
              left: '50px',
              width: '130px',
              height: '150px',
            };
        }
      case 'mug':
        return {
          ...style,
          top: '110px',
          left: '80px',
          width: '106px',
          height: '123px',
        };
      case 'cap':
        return {
          ...style,
          top: '95px',
          left: '88px',
          width: '122px',
          height: '60px',
        };
      default:
        return {
          ...style,
          top: '100px',
          left: '150px',
          width: '200px',
          height: '250px',
        };
    }
  };

  return (
    <div
      id={`design-boundary-${productType}`}
      style={getBoundaryStyle()}
      className="design-boundary"
    />
  );
};

export default BoundaryBox;