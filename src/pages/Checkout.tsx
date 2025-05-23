
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
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
      toast.error('Please sign in to checkout');
      navigate('/signin?redirectTo=/checkout');
      return;
    }

    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    const loadOrderData = async () => {
      if (currentUser && supabase) {
        try {
          // Try to get any existing pending order for this user
          const { data: existingOrder, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error('Error checking existing orders:', error);
          }

          if (existingOrder) {
            setCurrentOrder(existingOrder);
            console.log('Found existing order:', existingOrder);
          } else {
            await createNewOrder();
          }
        } catch (error) {
          console.error('Error loading order data:', error);
          await createNewOrder();
        }
      }
    };

    const loadUserData = async () => {
      if (currentUser && supabase) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (error) {
            console.error('Error loading profile:', error);
          }

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
  }, [currentUser, navigate, currentLocation, cartItems]);

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
    if (!cartItems || cartItems.length === 0 || !currentUser) {
      toast.error('Cannot create order - cart empty or user not logged in');
      navigate('/cart');
      return;
    }

    console.log('Creating new pending order');
    const DELIVERY_FEE = 40;
    
    try {
      // Format the cart items for storage
      const serializedItems = cartItems.map(item => ({
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        productId: item.productId
      }));
      
      // Generate order number
      const orderNumber = `B3F-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      // Create order data object
      const orderData = {
        orderNumber,
        subtotal: totalPrice,
        deliveryFee: DELIVERY_FEE,
        total: totalPrice + DELIVERY_FEE,
        items: cartItems,
        status: 'pending',
      };
      
      setCurrentOrder(orderData);
      
      // Create order in database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          order_number: orderNumber,
          total: totalPrice + DELIVERY_FEE,
          delivery_fee: DELIVERY_FEE,
          items: serializedItems,
          status: 'pending',
          created_at: new Date().toISOString(),
          payment_method: 'pending',
          payment_details: { status: 'pending' }
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create order:', error);
        toast.error('Failed to prepare order');
      } else {
        console.log('Order created successfully:', data);
        setCurrentOrder({
          ...orderData,
          id: data.id,
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create new order');
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

      if (currentUser && supabase && useNewAddress) {
        try {
          // Save new address to database if this is a new address
          await supabase.from('addresses').insert({
            user_id: currentUser.id,
            name: `${values.firstName} ${values.lastName}`, 
            street: values.address,
            city: values.city,
            state: values.state,
            zipcode: values.zipCode,
            country: values.country,
            phone: values.phone || '',
            is_default: addresses.length === 0, // Make default if first address
          });
          console.log('Address saved to database');
        } catch (error) {
          console.error('Error saving address to database:', error);
        }
      }

      // If we don't have a current order yet, create one
      if (!currentOrder?.id) {
        await createNewOrder();
      }

      if (currentUser && supabase && currentOrder?.id) {
        // Update order with shipping address
        const { error } = await supabase
          .from('orders')
          .update({
            shipping_address: shippingAddress,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentOrder.id);
          
        if (error) {
          console.error('Error updating order shipping address:', error);
          throw error;
        }
        
        console.log('Order updated with shipping address');
      }

      toast.success('Shipping info saved successfully');

      // Proceed to payment page
      setTimeout(() => {
        navigate('/payment', {
          state: { shippingAddress },
        });
      }, 500);
    } catch (error) {
      console.error('Error saving shipping details:', error);
      toast.error('Failed to save shipping details');
    } finally {
      setIsLoading(false);
    }
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
