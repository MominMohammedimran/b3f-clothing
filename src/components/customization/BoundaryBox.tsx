
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
    //  backgroundColor: 'white',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };

    switch (productType) {
      case 'tshirt':
        return {
          ...style,
          top: view === 'back' ? '110px' : '130px',
          left: view === 'back' ? '115px' : '120px',
          width: '72px',
          height: '95px',
        };
      case 'mug':
        return {
          ...style,
          top: '103px',
          left: '92px',
          width: '100px',
          height: '120px',
        };
      case 'cap':
        return {
          ...style,
          top: '90px',
          left: '108px',
          width: '95px',
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
