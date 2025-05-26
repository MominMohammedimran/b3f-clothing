
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/utils/toastWrapper';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import OrderSummaryComponent from '../components/checkout/OrderSummaryComponent';
import ShippingDetailsForm from '../components/checkout/ShippingDetailsForm';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAddresses } from '../hooks/useAddresses';
import SavedAddresses from '@/components/checkout/SavedAddresses';

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

const Checkout = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const { currentLocation } = useLocation();
  const { cartItems, totalPrice } = useCart();
  const { addresses, defaultAddress, loading: addressesLoading } = useAddresses(currentUser?.id);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!currentUser) {
      toast.error('Please sign in to checkout');
      navigate('/signin?redirectTo=/checkout');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error || !data) return;

        setFormData(prev => ({
          ...prev,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || currentUser.email || '',
          phone: data.phone_number || '',
        }));

        if (currentLocation) {
          setFormData(prev => ({
            ...prev,
            city: currentLocation.name,
          }));
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    loadProfile();
  }, [currentUser, cartItems, navigate, currentLocation]);

  useEffect(() => {
    if (addressesLoading) return;

    const fillFormFromAddress = (addr: any) => {
      setFormData({
        firstName: addr.first_name || '',
        lastName: addr.last_name || '',
        email: currentUser?.email || '',
        phone: addr.phone || '',
        address: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        zipCode: addr.zipcode || '',
        country: addr.country || 'India',
      });
    };

    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setUseNewAddress(false);
      fillFormFromAddress(defaultAddress);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
      setUseNewAddress(false);
      fillFormFromAddress(addresses[0]);
    } else {
      setUseNewAddress(true);
    }
  }, [addresses, defaultAddress, addressesLoading, currentUser]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
    const selected = addresses.find(a => a.id === addressId);
    if (selected) {
      setFormData({
        firstName: selected.first_name,
        lastName: selected.last_name,
        email: currentUser?.email || '',
        phone: selected.phone,
        address: selected.street,
        city: selected.city,
        state: selected.state,
        zipCode: selected.zipcode,
        country: selected.country || 'India',
      });
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData(prev => ({
      ...prev,
      address: '',
      city: currentLocation?.name || '',
      state: '',
      zipCode: '',
      country: 'India',
    }));
  };

  const handleFormSubmit = async (values: FormData) => {
    if (!currentUser || !cartItems || cartItems.length === 0) {
      toast.error('Invalid checkout state');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting checkout form submission...');
      
      const shippingAddress = {
        fullName: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName,
        addressLine1: values.address,
        street: values.address,
        city: values.city,
        state: values.state,
        postalCode: values.zipCode,
        zipCode: values.zipCode,
        country: values.country,
        phone: values.phone,
        email: values.email,
      };

      // Save new address if needed
      if (useNewAddress && currentUser) {
        try {
          await supabase.from('addresses').insert({
            user_id: currentUser.id,
            first_name: values.firstName,
            last_name: values.lastName,
            name: `${values.firstName} ${values.lastName}`,
            street: values.address,
            city: values.city,
            state: values.state,
            zipcode: values.zipCode,
            country: values.country,
            phone: values.phone,
            is_default: addresses.length === 0,
          });
        } catch (addressError) {
          console.error('Error saving address:', addressError);
          // Continue even if address save fails
        }
      }

      console.log('Shipping address prepared:', shippingAddress);
      
      // Navigate to payment with shipping address
      navigate('/payment', { state: { shippingAddress } });
      
      toast.success('Shipping details saved');
      
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate order summary
  const DELIVERY_FEE = 40;
  const subtotal = totalPrice;
  const total = subtotal + DELIVERY_FEE;
  
  const orderSummary = {
    orderNumber: `B3F-${Date.now().toString().slice(-6)}`,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    items: cartItems,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 mt-10">
        <div className="flex items-center mb-6">
          <Link to="/cart" className="mr-2">
            <ArrowLeft size={24} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>

              {currentLocation && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Current Location:</span> {currentLocation.name}
                  </p>
                </div>
              )}

              {!addressesLoading && (
                <SavedAddresses
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onAddressSelect={handleAddressSelect}
                  onUseNewAddress={handleUseNewAddress}
                  useNewAddress={useNewAddress}
                />
              )}

              <ShippingDetailsForm
                formData={formData}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <OrderSummaryComponent currentOrder={orderSummary} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
