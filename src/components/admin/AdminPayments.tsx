
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, X, Eye, Calendar, User, CreditCard } from 'lucide-react';

interface Payment {
  id: string;
  order_id: string | null;
  amount: number;
  utr: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  orders?: {
    order_number: string;
    user_id: string;
  } | null;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          order_id,
          amount,
          utr,
          screenshot_url,
          status,
          created_at,
          orders!payments_order_id_fkey (
            order_number,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'confirmed' | 'rejected') => {
    setProcessingId(paymentId);
    
    try {
      if (status === 'confirmed') {
        const { error } = await supabase.rpc('confirm_payment', {
          payment_id: paymentId
        });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payments')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', paymentId);
          
        if (error) throw error;
      }

      await fetchPayments();
      toast.success(`Payment ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`);
      
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <Button onClick={fetchPayments} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No payments found</p>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">₹{payment.amount}</span>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    
                    {payment.orders && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Order: {payment.orders.order_number}</span>
                        <span>(User ID: {payment.orders.user_id})</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(payment.created_at).toLocaleString()}</span>
                    </div>
                    
                    {payment.utr && (
                      <div className="text-sm">
                        <span className="font-medium">UTR:</span> {payment.utr}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.screenshot_url && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Screenshot
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment Screenshot</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <img
                              src={payment.screenshot_url}
                              alt="Payment Screenshot"
                              className="w-full h-auto rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {payment.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => updatePaymentStatus(payment.id, 'confirmed')}
                          disabled={processingId === payment.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                          disabled={processingId === payment.id}
                          size="sm"
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
