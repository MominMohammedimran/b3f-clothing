
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, RefreshCw } from 'lucide-react';

interface PaymentSettings {
  razorpay_enabled: boolean;
  cod_enabled: boolean;
  upi_enabled: boolean;
}

interface PaymentSettingsFormProps {
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  loading: boolean;
  onReset: () => void;
  onSave: () => void;
}

const PaymentSettingsForm: React.FC<PaymentSettingsFormProps> = ({
  paymentSettings,
  setPaymentSettings,
  loading,
  onReset,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>Configure payment methods and options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Razorpay</Label>
              <div className="text-sm text-gray-500">Enable Razorpay payment gateway</div>
            </div>
            <Switch
              checked={paymentSettings.razorpay_enabled}
              onCheckedChange={(checked) => 
                setPaymentSettings({...paymentSettings, razorpay_enabled: checked})
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cash on Delivery (COD)</Label>
              <div className="text-sm text-gray-500">Allow customers to pay on delivery</div>
            </div>
            <Switch
              checked={paymentSettings.cod_enabled}
              onCheckedChange={(checked) => 
                setPaymentSettings({...paymentSettings, cod_enabled: checked})
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>UPI Payments</Label>
              <div className="text-sm text-gray-500">Enable direct UPI payments</div>
            </div>
            <Switch
              checked={paymentSettings.upi_enabled}
              onCheckedChange={(checked) => 
                setPaymentSettings({...paymentSettings, upi_enabled: checked})
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={onSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentSettingsForm;
