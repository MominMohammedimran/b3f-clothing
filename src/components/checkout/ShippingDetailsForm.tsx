import React, { useEffect } from 'react';
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

// List of Indian states
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli', 'Delhi',
  'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ShippingDetailsForm: React.FC<ShippingDetailsFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Auto-detect city and state
useEffect(() => {
  const fetchGeolocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';

          setFormData((prev) => ({
            ...prev,
            city: prev.city || city,
            state: prev.state || state,
          }));
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
        }
      },
      (error) => {
        console.warn('Geolocation permission denied or unavailable.', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  fetchGeolocation();
}, []);

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
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
        />
        <p className="text-xs text-gray-600 mt-1 leading-snug">
  Enter a valid email like <span className="font-medium text-blue-700">user@gmail.com</span> for order updates and receipts.
</p>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10-digit Mobile Number"
          pattern="[0-9]{10}"
          maxLength={10}
          required
          className="w-full border p-2 rounded"
        />
     <p className="text-xs text-gray-600 mt-1 leading-snug">
  Enter a valid <span className="font-medium text-blue-700">10-digit mobile number
    </span> to receive OTP & Calls for verification and delivery updates.
</p>

   </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Address</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full Address"
          minLength={10}
          required
          className="w-full border p-2 rounded"
        />
        <p className="text-xs text-gray-600 mt-1 leading-snug">
  Please enter a correct and complete address to ensure smooth and timely delivery.
</p>

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
        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded bg-white"
        >
          <option value="" disabled>-- Select State --</option>
          {indianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">PIN Code</label>
        <input
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="6-digit PIN Code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className="w-full border p-2 rounded"
        />
        <p className="text-xs text-gray-500 mt-1">Enter a valid 6-digit Indian PIN code</p>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Country</label>
        <input
          name="country"
          value="India"
          readOnly
          className="w-full border p-2 rounded bg-gray-100 text-gray-700"
        />
        <p className="text-xs text-gray-600 mt-1 leading-snug">
  Currently deliver available <span className="font-medium text-blue-700">India </span> 
only
</p>

        {/* 
        // Uncomment below for international support in the future:
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded bg-white"
        >
          <option value="India">India</option>
          <option value="USA">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="Canada">Canada</option>
        </select>
        */}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Continue to Payment'}
      </Button>
    </form>
  );
};

export default ShippingDetailsForm;
