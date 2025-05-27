
import React from 'react';
import { Address } from '@/hooks/useAddresses';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SavedAddressesProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string) => void;
  onUseNewAddress: () => void;
  useNewAddress: boolean;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onUseNewAddress,
  useNewAddress
}) => {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Select a Shipping Address</h3>
      <RadioGroup 
        value={useNewAddress ? 'new' : selectedAddressId || ''} 
        onValueChange={(value) => {
          if (value === 'new') {
            onUseNewAddress();
          } else {
            onAddressSelect(value);
          }
        }}
      >
        <div className="space-y-3">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                selectedAddressId === address.id && !useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Label htmlFor={`address-${address.id}`} className="font-medium cursor-pointer">
                      {address.first_name} {address.last_name}
                      {address.is_default && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Default</span>
                      )}
                    </Label>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {address.street}, {address.city}, {address.state} {address.zipcode}
                  </div>
                  <div className="text-sm text-gray-600">{address.phone}</div>
                </div>
              </div>
            </div>
          ))}
          
          <div
            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
              useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="address-new" />
              <div>
                <Label htmlFor="address-new" className="font-medium cursor-pointer">Use a new address</Label>
                <div className="text-sm text-gray-600 mt-1">Add a new shipping address</div>
              </div>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default SavedAddresses;
