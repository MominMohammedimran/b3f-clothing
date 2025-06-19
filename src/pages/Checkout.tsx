import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/utils/toastWrapper';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import ShippingDetailsForm from '../components/checkout/ShippingDetailsForm';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useCart } from '../context/CartContext';

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
  const { currentUser } = useAuth();
  const { currentLocation } = useLocationContext();
  const { cartItems, totalPrice } = useCart();

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
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (data) {
          setFormData(prev => ({
            ...prev,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || currentUser.email || '',
            phone: data.phone_number || '',
          }));
        }

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

  const handleFormSubmit = async (values: FormData) => {
    if (!currentUser || !cartItems || cartItems.length === 0) {
      toast.error('Invalid checkout state');
      return;
    }

    setIsLoading(true);

    try {
      const shippingAddress = {
        fullName: `${values.firstName} ${values.lastName}`,
        ...values,
      };

      navigate('/payment', {
        state: {
          shippingAddress,
          cartItems,
          totalPrice,
        },
      });

      toast.success('Shipping details saved');
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const DELIVERY_FEE = 80;
  const subtotal = totalPrice;
  const total = subtotal + DELIVERY_FEE;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8 mt-10">
        <div className="flex items-center mb-6">
          <Link to="/cart" className="mr-2">
            <ArrowLeft size={24} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipping Details</h2>

              {/*currentLocation && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Current Location:</span> {currentLocation.name}
                  </p>
                </div>
              )*/}
                
              <ShippingDetailsForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
           {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-3">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="w-14 h-14 rounded object-cover border"
                    />
                    <div className="text-sm">
                      <p className="font-semibold">{item.name}</p>
                      {Array.isArray(item.sizes) ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.sizes.map((s: any, i: number) => (
                            <div key={i} className="bg-white border px-2 py-1 rounded text-xs text-gray-700">
                              Size: {s.size} × {s.quantity}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">Sizes : N/A</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                <span>₹{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2 text-lg">
                <span>Total:</span>
                <span className="text-green-600">₹{total}</span>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
