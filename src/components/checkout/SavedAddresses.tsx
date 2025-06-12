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
  useNewAddress,
}) => {
  if (!addresses || addresses.length === 0) return null;

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
        className="space-y-3"
      >
        {addresses.map((address) => (
          <Label
            key={address.id}
            htmlFor={`address-${address.id}`}
            className={`border p-3 rounded-md cursor-pointer block hover:bg-gray-50 ${
              selectedAddressId === address.id && !useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={address.id} id={`address-${address.id}`} />
              <div>
                <div className="font-medium">
                  {address.first_name} {address.last_name}
                  {address.is_default && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {address.street}, {address.city}, {address.state} {address.zipcode}
                </div>
                <div className="text-sm text-gray-600">{address.phone}</div>
              </div>
            </div>
          </Label>
        ))}

        {/* New Address Option */}
        <Label
          htmlFor="address-new"
          className={`border p-3 rounded-md cursor-pointer block hover:bg-gray-50 ${
            useNewAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="address-new" />
            <div>
              <div className="font-medium">Use a new address</div>
              <div className="text-sm text-gray-600 mt-1">Add a new shipping address</div>
            </div>
          </div>
        </Label>
      </RadioGroup>
    </div>
  );
};

export default SavedAddresses;
