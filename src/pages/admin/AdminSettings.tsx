
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '../../components/admin/AdminLayout';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  min_order_amount: number;
}

interface AdminSettingsRow {
  id: number;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  min_order_amount: number;
  created_at: string;
  updated_at: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'B3F Prints',
    site_description: 'Custom printing services',
    contact_email: 'contact@b3fprints.com',
    contact_phone: '+91 9999999999',
    business_address: 'India',
    delivery_fee: 80,
    min_order_amount: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Use the database function to get admin settings with type assertion
      const { data, error } = await (supabase.rpc as any)('get_admin_settings') as { 
        data: AdminSettingsRow[] | null, 
        error: any 
      };

      if (error) {
        console.error('Error loading settings from database:', error);
        toast.error('Failed to load settings from database');
      } else if (data && Array.isArray(data) && data.length > 0) {
        const settingsData = data[0];
        setSettings({
          site_name: settingsData.site_name || 'B3F Prints',
          site_description: settingsData.site_description || 'Custom printing services',
          contact_email: settingsData.contact_email || 'contact@b3fprints.com',
          contact_phone: settingsData.contact_phone || '+91 9999999999',
          business_address: settingsData.business_address || 'India',
          delivery_fee: Number(settingsData.delivery_fee) || 80,
          min_order_amount: Number(settingsData.min_order_amount) || 100
        });
        toast.success('Settings loaded from database');
      } else {
        toast.info('No settings found in database, using defaults');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to database using the update function with type assertion
      const { error } = await (supabase.rpc as any)('update_admin_settings', {
        p_site_name: settings.site_name,
        p_site_description: settings.site_description,
        p_contact_email: settings.contact_email,
        p_contact_phone: settings.contact_phone,
        p_business_address: settings.business_address,
        p_delivery_fee: settings.delivery_fee,
        p_min_order_amount: settings.min_order_amount
      }) as { error: any };

      if (error) {
        console.error('Database save error:', error);
        toast.error('Failed to save settings to database: ' + (error?.message || 'Unknown error'));
      } else {
        toast.success('Settings saved successfully to database');
        // Reload settings to ensure they're properly updated across the website
        await loadSettings();
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings: ' + (error?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ModernAdminLayout title="Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Settings</h2>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="business_address">Business Address</Label>
                  <Textarea
                    id="business_address"
                    value={settings.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                  <Input
                    id="delivery_fee"
                    type="number"
                    value={settings.delivery_fee}
                    onChange={(e) => handleInputChange('delivery_fee', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={settings.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
     </ModernAdminLayout>
  );
};

export default AdminSettings;
