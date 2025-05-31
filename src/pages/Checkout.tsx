import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import OrderSummaryComponent from '../components/checkout/OrderSummaryComponent';
import ShippingDetailsForm from '../components/checkout/ShippingDetailsForm';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAddresses } from '../hooks/useAddresses';
import SavedAddresses from '@/components/checkout/SavedAddresses';

const Checkout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
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
      toast.warning({
        title: "Warning",
        description: 'Please sign in to checkout'
      });
      navigate('/signin?redirectTo=/checkout');
      return;
    }

    const loadOrderData = async () => {
      if (currentUser && supabase) {
        try {
          const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingOrder) {
            setCurrentOrder(existingOrder);
          } else {
            createNewOrder();
          }
        } catch (error) {
          console.error('Error loading order data:', error);
          createNewOrder();
        }
      }
    };

    const loadUserData = async () => {
      if (currentUser && supabase) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profile) {
            const nameParts = (profile.display_name || '').split(' ');
            setFormData(prev => ({
              ...prev,
              firstName: profile.first_name || nameParts[0] || '',
              lastName: profile.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
              email: profile.email || currentUser.email || '',
              phone: profile.phone_number || '',
            }));
          }

          if (currentLocation) {
            setFormData(prev => ({
              ...prev,
              city: currentLocation.name || prev.city,
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadOrderData();
    loadUserData();
  }, [currentUser, navigate, currentLocation]);

  useEffect(() => {
    if (!addressesLoading) {
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setUseNewAddress(false);
        setFormData({
          firstName: defaultAddress.first_name || '',
          lastName: defaultAddress.last_name || '',
          email: currentUser?.email || '',
          phone: defaultAddress.phone || '',
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zipCode: defaultAddress.zipcode || '',
          country: defaultAddress.country || 'India',
        });
      } else if (addresses.length > 0) {
        const firstAddress = addresses[0];
        setSelectedAddressId(firstAddress.id);
        setUseNewAddress(false);
        setFormData({
          firstName: firstAddress.first_name || '',
          lastName: firstAddress.last_name || '',
          email: currentUser?.email || '',
          phone: firstAddress.phone || '',
          address: firstAddress.street || '',
          city: firstAddress.city || '',
          state: firstAddress.state || '',
          zipCode: firstAddress.zipcode || '',
          country: firstAddress.country || 'India',
        });
      } else {
        setUseNewAddress(true);
      }
    }
  }, [addresses, defaultAddress, addressesLoading, currentUser]);

  const createNewOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error({
        title: "Error",
        description: 'Your cart is empty'
      });
      navigate('/cart');
      return;
    }

    const DELIVERY_FEE = 40;
    const orderData = {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      subtotal: totalPrice,
      deliveryFee: DELIVERY_FEE,
      total: totalPrice + DELIVERY_FEE,
      items: cartItems,
      status: 'pending',
    };

    setCurrentOrder(orderData);

    if (currentUser && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            user_id: currentUser.id,
            order_number: orderData.orderNumber,
            total: orderData.total,
            delivery_fee: orderData.deliveryFee,
            subtotal: orderData.subtotal,
            items: JSON.stringify(cartItems), // Convert CartItems to JSON string
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;

        setCurrentOrder({
          ...orderData,
          id: data.id,
        });
      } catch (error) {
        console.error('Error creating order:', error);
        toast.error({
          title: "Error",
          description: 'Failed to create new order'
        });
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setFormData({
        firstName: selectedAddress.first_name || '',
        lastName: selectedAddress.last_name || '',
        email: currentUser?.email || '',
        phone: selectedAddress.phone || '',
        address: selectedAddress.street || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        zipCode: selectedAddress.zipcode || '',
        country: selectedAddress.country || 'India',
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

  const handleFormSubmit = async (values: any) => {
    setIsLoading(true);

    try {
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

      if (currentUser && supabase && currentOrder && useNewAddress) {
        try {
          await supabase.from('addresses').insert({
            user_id: currentUser.id,
            name: `${values.firstName} ${values.lastName}`, // Add name field for database
            street: values.address,
            city: values.city,
            state: values.state,
            zipcode: values.zipCode,
            country: values.country,
            phone: values.phone,
            is_default: addresses.length === 0,
          });
        } catch (error) {
          console.error('Error saving address to database:', error);
        }
      }

      if (currentUser && supabase && currentOrder) {
        await supabase
          .from('orders')
          .update({
            shipping_address: JSON.stringify(shippingAddress), // Convert to JSON string
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentOrder.id);
      }

      toast.success({
        title: "Success",
        description: 'Shipping info saved successfully'
      });

      setTimeout(() => {
        navigate('/payment', {
          state: { shippingAddress },
        });
      }, 500);
    } catch (error) {
      console.error('Error saving shipping details:', error);
      toast.error({
        title: "Error",
        description: 'Failed to save shipping details'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
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
              
              {/* Current Location Badge */}
              {currentLocation && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Current Location:</span> {currentLocation.name}
                  </p>
                </div>
              )}
              
              {/* Saved Addresses Component */}
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
            <OrderSummaryComponent currentOrder={currentOrder} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
