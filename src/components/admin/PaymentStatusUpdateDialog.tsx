import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateInventoryFromPaidOrders } from '@/hooks/useProductInventory';

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  total: number;
  status: string;
  payment_status?: string;
}

interface PaymentStatusUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdate: () => void;
}

const PaymentStatusUpdateDialog: React.FC<PaymentStatusUpdateDialogProps> = ({
  isOpen,
  onClose,
  order,
  onUpdate
}) => {
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || 'pending');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(order.total.toString());
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!paymentMethod.trim()) {
      toast.error('Payment method is required');
      return;
    }

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          total: parseFloat(amount),
          payment_details: {
            method: paymentMethod,
            amount: parseFloat(amount),
            notes: notes,
            updated_by: 'admin',
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Payment status updated successfully');
      
      // Update inventory if payment status changed to 'paid'
      if (paymentStatus === 'paid') {
        await updateInventoryFromPaidOrders();
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Order Number</Label>
            <Input value={order.order_number} disabled />
          </div>

          <div>
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Input
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g., Credit Card, UPI, Cash"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={updating}
              className="flex-1"
            >
              {updating ? 'Updating...' : 'Update Payment'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentStatusUpdateDialog;