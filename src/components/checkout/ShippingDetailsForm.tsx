
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

interface ShippingDetailsFormProps {
  formData: FormData;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const ShippingDetailsForm: React.FC<ShippingDetailsFormProps> = ({
  formData,
  onSubmit,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: formData
  });

  React.useEffect(() => {
    // Update form when formData changes
    Object.keys(formData).forEach(key => {
      setValue(key as keyof FormData, formData[key as keyof FormData]);
    });
  }, [formData, setValue]);

  const watchedValues = watch();

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email'
              }
            })}
            error={errors.email?.message}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone', { required: 'Phone number is required' })}
            error={errors.phone?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          {...register('address', { required: 'Address is required' })}
          error={errors.address?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city', { required: 'City is required' })}
            error={errors.city?.message}
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            {...register('state', { required: 'State is required' })}
            error={errors.state?.message}
          />
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            {...register('zipCode', { required: 'ZIP code is required' })}
            error={errors.zipCode?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="country">Country *</Label>
        <Select onValueChange={(value) => setValue('country', value)} value={watchedValues.country}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="United States">United States</SelectItem>
            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </form>
  );
};

export default ShippingDetailsForm;
