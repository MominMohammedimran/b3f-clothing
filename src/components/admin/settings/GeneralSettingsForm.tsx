import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface GeneralSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  min_order_amount: number;
}

interface AdminSettingsData {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  min_order_amount: number;
}

const GeneralSettingsForm = () => {
  const [settings, setSettings] = useState<GeneralSettings>({
    site_name: 'B3F Prints',
    site_description: 'Custom printing services',
    contact_email: 'contact@b3fprints.com',
    contact_phone: '+91 9999999999',
    business_address: 'India',
    delivery_fee: 80,
    min_order_amount: 100,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setInitialLoading(true);
      const { data, error } = await supabase.rpc('get_admin_settings');
      
      if (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const settingsData = data[0] as unknown as AdminSettingsData;
        setSettings({
          site_name: settingsData.site_name || 'B3F Prints',
          site_description: settingsData.site_description || 'Custom printing services',
          contact_email: settingsData.contact_email || 'contact@b3fprints.com',
          contact_phone: settingsData.contact_phone || '+91 9999999999',
          business_address: settingsData.business_address || 'India',
          delivery_fee: settingsData.delivery_fee || 80,
          min_order_amount: settingsData.min_order_amount || 100,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.rpc('update_admin_settings', {
        p_site_name: settings.site_name,
        p_site_description: settings.site_description,
        p_contact_email: settings.contact_email,
        p_contact_phone: settings.contact_phone,
        p_business_address: settings.business_address,
        p_delivery_fee: settings.delivery_fee,
        p_min_order_amount: settings.min_order_amount,
      });

      if (error) {
        throw error;
      }

      toast.success('Settings updated successfully');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GeneralSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Enter site name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="Enter contact email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={settings.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Enter contact phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
              <Input
                id="delivery_fee"
                type="number"
                value={settings.delivery_fee}
                onChange={(e) => handleInputChange('delivery_fee', Number(e.target.value))}
                placeholder="Enter delivery fee"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
              <Input
                id="min_order_amount"
                type="number"
                value={settings.min_order_amount}
                onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                placeholder="Enter minimum order amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              placeholder="Enter site description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea
              id="business_address"
              value={settings.business_address}
              onChange={(e) => handleInputChange('business_address', e.target.value)}
              placeholder="Enter business address"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Settings...
              </>
            ) : (
              'Update Settings'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsForm;
