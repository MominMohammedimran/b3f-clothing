
import React from 'react';

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface DeliveryInformationProps {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

const DeliveryInformation: React.FC<DeliveryInformationProps> = ({ 
  shippingAddress, 
  paymentMethod 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-600 mb-2">Shipping Address</h3>
          <div className="text-gray-800">
            <p className="font-medium">{shippingAddress.fullName}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
            <p>Phone: {shippingAddress.phone}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-600 mb-2">Shipping Method</h3>
          <p className="text-gray-800">Standard Shipping</p>
          
          <h3 className="font-medium text-gray-600 mt-4 mb-2">Payment Method</h3>
          <p className="text-gray-800 capitalize">
            {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInformation;
