
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
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none' as const,
      zIndex: 10,
    };

    switch (productType) {
      case 'tshirt':
        return {
          ...style,
          top: view === 'back' ? '140px' : '160px',
          left: view ==='back'? '110px':'115px',
          width: '80px',
          height: '100px',
        };
      case 'mug':
        return {
          ...style,
          top: '140px',
          left: '115px',
          width: '130px',
          height: '155px',
        };
      case 'cap':
        return {
          ...style,
          top: '110px',
          left: '122px',
          width: '150px',
          height: '90px',
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
      id="design-boundary"
      style={getBoundaryStyle()}
      className="design-boundary"
    />
  );
};

export default BoundaryBox;
