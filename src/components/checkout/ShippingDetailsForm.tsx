import React from 'react';
import { Button } from '@/components/ui/button';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ShippingDetailsFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (values: FormData) => void;
  isLoading: boolean;
}

const ShippingDetailsForm: React.FC<ShippingDetailsFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">First Name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Address</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">City</label>
        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">State</label>
        <input
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="State"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Zip Code</label>
        <input
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="Zip Code"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Country</label>
        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country"
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Continue to Payment'}
      </Button>
    </form>
  );
};

export default ShippingDetailsForm;
