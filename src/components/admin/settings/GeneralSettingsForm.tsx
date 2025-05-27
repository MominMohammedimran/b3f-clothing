
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, RefreshCw } from 'lucide-react';

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

interface GeneralSettingsFormProps {
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  loading: boolean;
  onReset: () => void;
  onSave: () => void;
}

const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  siteSettings,
  setSiteSettings,
  loading,
  onReset,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage general settings for your site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
            <div className="text-sm text-gray-500">
              Enable to show maintenance page to visitors
            </div>
          </div>
          <Switch
            id="maintenance_mode"
            checked={siteSettings.maintenance_mode}
            onCheckedChange={(checked) => 
              setSiteSettings({...siteSettings, maintenance_mode: checked})
            }
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input 
            id="site_name" 
            value={siteSettings.site_name}
            onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input 
            id="contact_email" 
            type="email"
            value={siteSettings.contact_email}
            onChange={(e) => setSiteSettings({...siteSettings, contact_email: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input 
            id="contact_phone" 
            value={siteSettings.contact_phone}
            onChange={(e) => setSiteSettings({...siteSettings, contact_phone: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Social Media</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="social_facebook" className="text-xs">Facebook</Label>
              <Input 
                id="social_facebook" 
                placeholder="Facebook URL"
                value={siteSettings.social_facebook}
                onChange={(e) => setSiteSettings({...siteSettings, social_facebook: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="social_instagram" className="text-xs">Instagram</Label>
              <Input 
                id="social_instagram" 
                placeholder="Instagram URL"
                value={siteSettings.social_instagram}
                onChange={(e) => setSiteSettings({...siteSettings, social_instagram: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="social_twitter" className="text-xs">Twitter</Label>
              <Input 
                id="social_twitter" 
                placeholder="Twitter URL"
                value={siteSettings.social_twitter}
                onChange={(e) => setSiteSettings({...siteSettings, social_twitter: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min_order_value">Minimum Order Value (₹)</Label>
            <Input 
              id="min_order_value" 
              type="number"
              value={siteSettings.min_order_value}
              onChange={(e) => setSiteSettings({...siteSettings, min_order_value: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping_free_threshold">Free Shipping Threshold (₹)</Label>
            <Input 
              id="shipping_free_threshold" 
              type="number"
              value={siteSettings.shipping_free_threshold}
              onChange={(e) => setSiteSettings({...siteSettings, shipping_free_threshold: Number(e.target.value)})}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onReset} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={onSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeneralSettingsForm;
