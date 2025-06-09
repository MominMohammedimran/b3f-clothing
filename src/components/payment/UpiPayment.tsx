
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UpiPaymentProps {
  orderData: {
    total: number;
    orderNumber: string;
    items: any[];
    shippingAddress: any;
    userId: string;
  };
}

const UpiPayment: React.FC<UpiPaymentProps> = ({ orderData }) => {
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const upiId = 'BHARATPE.8S0W0O7J1S27237@fbpe';

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScreenshot(file);
    }
  };

  const handleSubmit = async () => {
    if (!utr.trim()) {
      toast.error('Please enter UTR number');
      return;
    }

    setUploading(true);
    try {
      // Create order in database
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          order_number: orderData.orderNumber,
          total: orderData.total,
          status: 'pending',
          items: orderData.items,
          payment_method: 'upi',
          shipping_address: orderData.shippingAddress,
          upi_input: utr // Add required upi_input field
        });

      if (orderError) throw orderError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: null, // Will be updated when order is created
          amount: orderData.total,
          status: 'pending',
          utr: utr,
          upi_id: upiId
        });

      if (paymentError) throw paymentError;

      toast.success('Payment details submitted successfully!');
      navigate('/order-complete', { 
        state: { 
          orderNumber: orderData.orderNumber,
          total: orderData.total 
        } 
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment details');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UPI Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>UPI ID</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input value={upiId} readOnly className="flex-1" />
              <Button onClick={copyUpiId} variant="outline" size="sm">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label>Amount to Pay</Label>
            <Input value={`₹${orderData.total}`} readOnly className="font-bold text-lg" />
          </div>

          <div>
            <Label htmlFor="utr">UTR Number *</Label>
            <Input
              id="utr"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="Enter 12-digit UTR number"
              maxLength={12}
            />
          </div>

          <div>
            <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
            <div className="mt-1">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('screenshot')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {screenshot ? screenshot.name : 'Upload Screenshot'}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={uploading || !utr.trim()}
            className="w-full"
            size="lg"
          >
            {uploading ? 'Submitting...' : 'Submit Payment Details'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpiPayment;