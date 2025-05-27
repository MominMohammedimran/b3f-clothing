
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { Button } from '../ui/button';
import FormInput from '../ui/FormInput';
import StateSelector from './StateSelector';

// Form validation schema
const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  country: z.string().min(2, "Country is required")
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  initialValues: ShippingFormValues;
  onSubmit: (values: ShippingFormValues) => void;
  isLoading: boolean;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ initialValues, onSubmit, isLoading }) => {
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialValues
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="firstName"
            control={form.control}
            placeholder="John"
            required
          />
          <FormInput
            label="Last Name"
            name="lastName"
            control={form.control}
            placeholder="Doe"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            name="email"
            control={form.control}
            placeholder="john@example.com"
            type="email"
            required
          />
          <FormInput
            label="Phone"
            name="phone"
            control={form.control}
            placeholder="9876543210"
            required
          />
        </div>
        
        <FormInput
          label="Address"
          name="address"
          control={form.control}
          placeholder="123 Main St, Apartment 4B"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="City"
            name="city"
            control={form.control}
            placeholder="Mumbai"
            required
          />
          <StateSelector
            form={form}
            name="state"
            label="State"
            required
          />
          <FormInput
            label="ZIP Code"
            name="zipCode"
            control={form.control}
            placeholder="400001"
            required
          />
        </div>
        
        <FormInput
          label="Country"
          name="country"
          control={form.control}
          disabled
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShippingForm;
