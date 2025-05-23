
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod
}) => {
  return (
    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4">
      <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
        <RadioGroupItem value="razorpay" id="razorpay" />
        <Label htmlFor="razorpay" className="flex items-center cursor-pointer">
          <CreditCard className="h-4 w-4 mr-2" />
          <span>Credit / Debit Card (Razorpay)</span>
        </Label>
      </div>
      
      <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
        <RadioGroupItem value="cod" id="cod" />
        <Label htmlFor="cod" className="flex items-center cursor-pointer">
          <Banknote className="h-4 w-4 mr-2" />
          <span>Cash on Delivery</span>
        </Label>
      </div>
    </RadioGroup>
  );
};

export default PaymentMethodSelector;
