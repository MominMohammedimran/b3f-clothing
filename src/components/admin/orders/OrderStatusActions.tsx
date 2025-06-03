
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  const [showCancellationReason, setShowCancellationReason] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowCancellationReason(newStatus === 'cancelled');
  };

  const handleUpdateStatus = () => {
    if (selectedStatus === 'cancelled' && !cancellationReason.trim()) {
      return;
    }
    onStatusUpdate(orderId, selectedStatus, cancellationReason);
    setShowCancellationReason(false);
    setCancellationReason('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Update Order Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCancellationReason && (
          <div className="md:col-span-2">
            <Label htmlFor="cancellationReason">Cancellation Reason</Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              required
            />
          </div>
        )}
      </div>

      <Button 
        onClick={handleUpdateStatus}
        disabled={selectedStatus === currentStatus || (selectedStatus === 'cancelled' && !cancellationReason.trim())}
      >
        Update Status
      </Button>
    </div>
  );
};

export default OrderStatusActions;
