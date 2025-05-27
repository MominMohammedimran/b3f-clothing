
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from 'countries-list';

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ShippingAddressFormProps {
  onSubmit: (e: React.FormEvent) => void;
  shippingAddress: ShippingAddress;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (value: string) => void;
  loading: boolean;
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  onSubmit,
  shippingAddress,
  onInputChange,
  onCountryChange,
  loading
}) => {
  // Convert countries object to array for rendering
  const countryList = Object.entries(countries).map(([code, countryData]) => ({
    code,
    name: countryData.name
  }));

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={shippingAddress.name}
            onChange={onInputChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="col-span-1">
          <Label htmlFor="street">Street Address</Label>
          <Input
            type="text"
            id="street"
            name="street"
            value={shippingAddress.street}
            onChange={onInputChange}
            placeholder="123 Main St"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Label htmlFor="city">City</Label>
          <Input
            type="text"
            id="city"
            name="city"
            value={shippingAddress.city}
            onChange={onInputChange}
            placeholder="New York"
            required
          />
        </div>
        <div className="col-span-1">
          <Label htmlFor="state">State</Label>
          <Input
            type="text"
            id="state"
            name="state"
            value={shippingAddress.state}
            onChange={onInputChange}
            placeholder="NY"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            type="text"
            id="zipCode"
            name="zipCode"
            value={shippingAddress.zipCode}
            onChange={onInputChange}
            placeholder="10001"
            required
          />
        </div>
        <div className="col-span-1">
          <Label htmlFor="country">Country</Label>
          <Select onValueChange={onCountryChange} value={shippingAddress.country}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countryList.map((country) => (
                <SelectItem key={country.code} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : 'Confirm and Pay'}
      </Button>
    </form>
  );
};

export default ShippingAddressForm;
