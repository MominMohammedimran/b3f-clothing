
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const SecuritySettingsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Configure security options for your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
              <div className="text-sm text-yellow-700">
                <p>
                  Security settings should be configured through the Supabase dashboard for proper implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button onClick={() => window.open('https://supabase.com/dashboard/project/lbebqamzsrbeihzikmow/auth/providers', '_blank')}>
            Manage Authentication Settings
          </Button>
          
          <Button onClick={() => window.open('https://supabase.com/dashboard/project/lbebqamzsrbeihzikmow/auth/users', '_blank')}>
            Manage User Accounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsCard;
