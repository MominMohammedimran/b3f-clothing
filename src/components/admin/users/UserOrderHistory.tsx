
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusBadge from '../orders/OrderStatusBadge';

interface UserOrderHistoryProps {
  userId?: string;
}

const fetchUserOrderHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user order history:', error);
    throw error;
  }
};

const UserOrderHistory: React.FC<UserOrderHistoryProps> = ({ userId }) => {
  // Use params for fallback if userId is not provided as prop
  const fetchId = userId;
  
  const { 
    data: orders = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['userOrderHistory', fetchId],
    queryFn: () => fetchUserOrderHistory(fetchId || ''),
    enabled: !!fetchId,
    staleTime: 60000 // 1 minute
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading user order history...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading order history.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">This user has no order history.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableCaption>User order history</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
            <TableCell><OrderStatusBadge status={order.status} /></TableCell>
            <TableCell>
              {Array.isArray(order.items) ? order.items.length : 'N/A'} items
            </TableCell>
            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserOrderHistory;
