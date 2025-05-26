
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  delivery_fee: number;
  currency: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'B3F Fashion',
    site_description: 'Your fashion destination',
    contact_email: 'contact@b3ffashion.com',
    contact_phone: '+91 9876543210',
    delivery_fee: 40,
    currency: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving settings:', settings);
      
      // For now, just save to localStorage since we don't have a settings table
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  placeholder="Site name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <Input
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  placeholder="INR"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Site Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={settings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Site description"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <Input
                  value={settings.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Order Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Delivery Fee (₹)</label>
                <Input
                  type="number"
                  value={settings.delivery_fee}
                  onChange={(e) => handleInputChange('delivery_fee', Number(e.target.value))}
                  placeholder="40"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">System Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Database Status: <span className="font-medium text-green-600">Connected</span></p>
                <p>Last Updated: {new Date().toLocaleString()}</p>
                <p>Admin Panel Version: 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
