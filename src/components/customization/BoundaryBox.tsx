
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
          left: view === 'back' ? '105px' : '108px',
          width: '78px',
          height: '95px',
        };
        case 'photo':
        return {
          ...style,
          top: view === 'back' ? '110px' : '130px',
          left: view === 'back' ? '105px' : '108px',
          width: '78px',
          height: '95px',
        };
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
