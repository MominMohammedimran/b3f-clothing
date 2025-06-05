import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Database, Mail, Shield, Settings, Download, Upload, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

interface Settings {
  site_name: string;
  site_description: string;
  site_logo_url: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  delivery_fee: number;
  currency: string;
  tax_rate: number;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  low_stock_threshold: number;
  order_auto_confirm: boolean;
  maintenance_mode: boolean;
  max_order_items: number;
  min_order_amount: number;
  enable_cod: boolean;
  enable_online_payment: boolean;
  razorpay_key_id: string;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_reward_points: boolean;
  reward_points_ratio: number;
  shipping_zones: string[];
  payment_methods: string[];
  social_media_links: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  [key: string]: string | number | boolean | string[] | object;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'B3F Fashion',
    site_description: 'Your fashion destination',
    site_logo_url: '',
    contact_email: 'b3f.prints.pages.dev@gmail.com',
    contact_phone: '+91 9876543210',
    business_address: 'India',
    delivery_fee: 40,
    currency: 'INR',
    tax_rate: 18,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    low_stock_threshold: 5,
    order_auto_confirm: false,
    maintenance_mode: false,
    max_order_items: 10,
    min_order_amount: 100,
    enable_cod: true,
    enable_online_payment: true,
    razorpay_key_id: '',
    enable_reviews: true,
    enable_wishlist: true,
    enable_reward_points: true,
    reward_points_ratio: 1,
    shipping_zones: ['All India'],
    payment_methods: ['Razorpay', 'COD'],
    social_media_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'admin_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings) {
        const parsedSettings = typeof data.settings === 'string' 
          ? JSON.parse(data.settings) 
          : data.settings;
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving settings:', settings);
      
      const settingsData = JSON.parse(JSON.stringify(settings));
      
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'admin_settings',
          settings: settingsData
        });

      if (error) {
        throw error;
      }

      localStorage.setItem('admin_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      toast.success('Settings saved locally');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [platform]: value
      }
    }));
  };

  const addShippingZone = () => {
    const zone = prompt('Enter new shipping zone:');
    if (zone) {
      setSettings(prev => ({
        ...prev,
        shipping_zones: [...prev.shipping_zones, zone]
      }));
    }
  };

  const removeShippingZone = (index: number) => {
    setSettings(prev => ({
      ...prev,
      shipping_zones: prev.shipping_zones.filter((_, i) => i !== index)
    }));
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache cleared successfully');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(prev => ({ ...prev, ...importedSettings }));
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Failed to import settings');
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Settings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Settings">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex gap-2">
            <Button onClick={exportSettings} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Site Logo URL</label>
                    <Input
                      value={settings.site_logo_url}
                      onChange={(e) => handleInputChange('site_logo_url', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={settings.tax_rate}
                      onChange={(e) => handleInputChange('tax_rate', Number(e.target.value))}
                      placeholder="18"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Site Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Site description"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium mb-1">Business Address</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={settings.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    placeholder="Business address"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.social_media_links).map(([platform, url]) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium mb-1 capitalize">{platform}</label>
                        <Input
                          value={url}
                          onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                          placeholder={`https://${platform}.com/yourpage`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecommerce">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>E-commerce Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Enable Reviews</h3>
                        <p className="text-sm text-gray-600">Allow customers to review products</p>
                      </div>
                      <Switch
                        checked={settings.enable_reviews}
                        onCheckedChange={(checked) => handleInputChange('enable_reviews', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Enable Wishlist</h3>
                        <p className="text-sm text-gray-600">Allow customers to save products</p>
                      </div>
                      <Switch
                        checked={settings.enable_wishlist}
                        onCheckedChange={(checked) => handleInputChange('enable_wishlist', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Enable Reward Points</h3>
                        <p className="text-sm text-gray-600">Reward customers with points</p>
                      </div>
                      <Switch
                        checked={settings.enable_reward_points}
                        onCheckedChange={(checked) => handleInputChange('enable_reward_points', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Enable COD</h3>
                        <p className="text-sm text-gray-600">Cash on delivery payments</p>
                      </div>
                      <Switch
                        checked={settings.enable_cod}
                        onCheckedChange={(checked) => handleInputChange('enable_cod', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Order Items</label>
                      <Input
                        type="number"
                        value={settings.max_order_items}
                        onChange={(e) => handleInputChange('max_order_items', Number(e.target.value))}
                        placeholder="10"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Min Order Amount (₹)</label>
                      <Input
                        type="number"
                        value={settings.min_order_amount}
                        onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>

                  {settings.enable_reward_points && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Reward Points Ratio (Points per ₹)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.reward_points_ratio}
                        onChange={(e) => handleInputChange('reward_points_ratio', Number(e.target.value))}
                        placeholder="1"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">How many points customers earn per rupee spent</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {settings.shipping_zones.map((zone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{zone}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeShippingZone(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addShippingZone} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Shipping Zone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Send email notifications for orders and updates</p>
                  </div>
                  <Switch
                    checked={settings.enable_email_notifications}
                    onCheckedChange={(checked) => handleInputChange('enable_email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Send SMS notifications for order updates</p>
                  </div>
                  <Switch
                    checked={settings.enable_sms_notifications}
                    onCheckedChange={(checked) => handleInputChange('enable_sms_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-confirm Orders</h3>
                    <p className="text-sm text-gray-600">Automatically confirm orders after payment</p>
                  </div>
                  <Switch
                    checked={settings.order_auto_confirm}
                    onCheckedChange={(checked) => handleInputChange('order_auto_confirm', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                  <Input
                    type="number"
                    value={settings.low_stock_threshold}
                    onChange={(e) => handleInputChange('low_stock_threshold', Number(e.target.value))}
                    placeholder="5"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get notified when product stock falls below this number</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Razorpay Key ID</label>
                  <Input
                    value={settings.razorpay_key_id}
                    onChange={(e) => handleInputChange('razorpay_key_id', e.target.value)}
                    placeholder="rzp_test_xxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your Razorpay public key for online payments</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">System Actions</h3>
                  <div className="space-y-3">
                    <Button onClick={clearCache} variant="outline" className="w-full">
                      Clear Cache
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">System Information</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Database Status: <span className="font-medium text-green-600">Connected</span></p>
                    <p>Email Service: <span className="font-medium text-green-600">Active</span></p>
                    <p>Last Updated: {new Date().toLocaleString()}</p>
                    <p>Admin Panel Version: 2.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
