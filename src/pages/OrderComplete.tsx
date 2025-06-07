
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import Tesseract from 'tesseract.js';

import { Upload, CheckCircle, Clock } from 'lucide-react';

const OrderComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else if (!orderNumber) {
      navigate('/');
    }
  }, [orderId, orderNumber, navigate]);

  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error('File size should be less than 5MB');
    return;
  }

  setScreenshot(file);

  try {
    toast.info('Extracting UTR from screenshot...');

    const {
      data: { text },
    } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m),
    });

    // Extract UTR pattern: 10–14 digit alphanumeric string
    const matches = text.match(/\b[0-9A-Z]{10,14}\b/g);

    if (matches && matches.length > 0) {
      setUtrNumber(matches[0]);
      toast.success(`Detected UTR: ${matches[0]}`);
    } else {
      toast.warning('No UTR found in screenshot. Please enter it manually.');
    }
  } catch (error) {
    console.error('OCR error:', error);
    toast.error('Failed to scan image. Please enter UTR manually.');
  }
};

  const uploadScreenshot = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath);

    return publicUrl;
  };

const handleSubmitPayment = async () => {
  if (!utrNumber.trim()) {
    toast.error('Please enter UTR number');
    return;
  }

  if (!screenshot) {
    toast.error('Please upload payment screenshot');
    return;
  }

  if (!currentUser || !orderData) {
    toast.error('Missing required information');
    return;
  }

  setLoading(true);

  try {
    setUploading(true);
    const screenshotUrl = await uploadScreenshot(screenshot);
    setUploading(false);

    // Save payment details
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderData.id,
        upi_id: 'BHARATPE.8S0W0O7J1S27237@fbpe',
        amount: orderData.total,
        utr: utrNumber,
        screenshot_url: screenshotUrl,
        status: 'pending'
      });

    if (paymentError) throw paymentError;

    // ✅ Trigger email notification via Cloudflare Function
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: currentUser.email,
        subject: `B3F Prints: Payment Submitted for Order ${orderData.order_number}`,
        text: `Dear Customer,

Your payment details for Order ${orderData.order_number} have been submitted successfully. 

We will review and confirm your payment shortly.

🧾 Order Amount: ₹${orderData.total}
🔢 UTR: ${utrNumber}

Thank you for shopping with B3F Prints!

B3F Team`
      })
    });

    setSubmitted(true);
    toast.success('Payment details submitted and email sent!');
  } catch (error: any) {
    console.error('Error submitting payment:', error);
    toast.error('Failed to submit payment details');
  } finally {
    setLoading(false);
    setUploading(false);
  }
};


  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">Payment Submitted!</h2>
              <p className="text-gray-600">
                Your payment details have been submitted successfully. 
                We will verify your payment within 24 hours.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Payment</CardTitle>
            {orderData && (
              <div className="text-center text-sm text-gray-600">
                <p>Order: {orderData.order_number}</p>
                <p className="font-bold text-lg">Amount: ₹{orderData.total}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Payment Instructions:</span>
              </div>
              <ol className="text-sm text-blue-700 space-y-1 ml-6 list-decimal">
                <li>Complete the UPI payment</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Enter the UTR/Transaction ID below</li>
                <li>Upload the screenshot</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="utr">UTR/Transaction ID *</Label>
                <Input
                  id="utr"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR number"
                  maxLength={12}
                />
              </div>

              <div>
                <Label htmlFor="screenshot">Payment Screenshot *</Label>
                <div className="mt-2">
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('screenshot')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {screenshot ? screenshot.name : 'Upload Screenshot'}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSubmitPayment}
                disabled={loading || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Payment Details'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderComplete;
