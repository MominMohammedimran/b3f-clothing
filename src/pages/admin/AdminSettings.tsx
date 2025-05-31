
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Shield, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import GeneralSettingsForm from '@/components/admin/settings/GeneralSettingsForm';
import PaymentSettingsForm from '@/components/admin/settings/PaymentSettingsForm';
import SecuritySettingsCard from '@/components/admin/settings/SecuritySettingsCard';

interface SiteSettings {
  maintenance_mode: boolean;
  site_name: string;
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  min_order_value: number;
  shipping_free_threshold: number;
}

interface PaymentSettings {
  razorpay_enabled: boolean;
  cod_enabled: boolean;
  upi_enabled: boolean;
}

const AdminSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    maintenance_mode: false,
    site_name: 'B3F Prints & Men\'s Wear',
    contact_email: 'b3fprintingsolutions@gmail.com',
    contact_phone: '7672080881',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    min_order_value: 0,
    shipping_free_threshold: 999
  });
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    razorpay_enabled: true,
    cod_enabled: false, // Disabled as requested
    upi_enabled: true   // Enabled as requested
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Fetch settings from database
      const { data: generalData, error: generalError } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'general')
        .maybeSingle();
        
      if (generalError) throw generalError;
      
      if (generalData && generalData.settings) {
        // Safely parse and validate the settings object
        const settings = generalData.settings as Record<string, unknown>;
        
        // Create a new settings object with proper type validation
        const typedSettings: SiteSettings = {
          maintenance_mode: typeof settings.maintenance_mode === 'boolean' ? settings.maintenance_mode : false,
          site_name: typeof settings.site_name === 'string' ? settings.site_name : siteSettings.site_name,
          contact_email: typeof settings.contact_email === 'string' ? settings.contact_email : siteSettings.contact_email,
          contact_phone: typeof settings.contact_phone === 'string' ? settings.contact_phone : siteSettings.contact_phone,
          social_facebook: typeof settings.social_facebook === 'string' ? settings.social_facebook : '',
          social_instagram: typeof settings.social_instagram === 'string' ? settings.social_instagram : '',
          social_twitter: typeof settings.social_twitter === 'string' ? settings.social_twitter : '',
          min_order_value: typeof settings.min_order_value === 'number' ? settings.min_order_value : 0,
          shipping_free_threshold: typeof settings.shipping_free_threshold === 'number' ? settings.shipping_free_threshold : 999
        };
        
        setSiteSettings(typedSettings);
      }
      
      const { data: paymentData, error: paymentError } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'payment')
        .maybeSingle();
        
      if (paymentError) throw paymentError;
      
      if (paymentData && paymentData.settings) {
        // Safely parse and validate the settings object
        const settings = paymentData.settings as Record<string, unknown>;
        
        // Create a new settings object with proper type validation
        const typedSettings: PaymentSettings = {
          razorpay_enabled: typeof settings.razorpay_enabled === 'boolean' ? settings.razorpay_enabled : true,
          cod_enabled: typeof settings.cod_enabled === 'boolean' ? settings.cod_enabled : false, // Default to false as requested
          upi_enabled: typeof settings.upi_enabled === 'boolean' ? settings.upi_enabled : true // Default to true as requested
        };
        
        setPaymentSettings(typedSettings);
      }
      
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: 'general' | 'payment') => {
    try {
      setLoading(true);
      let dataToSave;
      
      if (type === 'general') {
        dataToSave = {
          type: 'general',
          settings: siteSettings
        };
      } else {
        dataToSave = {
          type: 'payment',
          settings: paymentSettings
        };
      }
      
      // Check if settings record exists
      const { data: existingData, error: existingError } = await supabase
        .from('settings')
        .select('id')
        .eq('type', type)
        .maybeSingle();
        
      if (existingError) throw existingError;
      
      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('settings')
          .update(dataToSave)
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('settings')
          .insert(dataToSave);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`${type === 'general' ? 'General' : 'Payment'} settings saved successfully`);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save ${type} settings`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 pt-0">
        <h1 className="text-2xl font-bold flex items-center mb-6">
          <Settings className="mr-2" /> Admin Settings
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettingsForm
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
              loading={loading}
              onReset={fetchSettings}
              onSave={() => saveSettings('general')}
            />
          </TabsContent>
          
          <TabsContent value="payment">
            <PaymentSettingsForm
              paymentSettings={paymentSettings}
              setPaymentSettings={setPaymentSettings}
              loading={loading}
              onReset={fetchSettings}
              onSave={() => saveSettings('payment')}
            />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettingsCard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
