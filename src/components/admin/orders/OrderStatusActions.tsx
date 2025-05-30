
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (orderId: string, status: string, reason?: string) => void;
}

const OrderStatusActions: React.FC<OrderStatusActionsProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statusOptions = [
    { value: 'processing', label: 'Processing' },
    { value: 'prepared', label: 'Prepared' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusUpdate = () => {
    if (selectedStatus === 'cancelled' && !cancellationReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }
    
    onStatusUpdate(orderId, selectedStatus, selectedStatus === 'cancelled' ? cancellationReason : undefined);
    setIsDialogOpen(false);
    setCancellationReason('');
  };

  const handleCancel = () => {
    setIsDialogOpen(true);
    setSelectedStatus('cancelled');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status">Order Status</Label>
        <div className="flex gap-2 mt-1">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={selectedStatus === 'cancelled' ? () => setIsDialogOpen(true) : handleStatusUpdate}
            disabled={selectedStatus === currentStatus}
            variant={selectedStatus === 'cancelled' ? 'destructive' : 'default'}
          >
            Update
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleCancel}
          className="flex items-center gap-1"
        >
          <X size={14} />
          Cancel Order
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleStatusUpdate}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderStatusActions;
