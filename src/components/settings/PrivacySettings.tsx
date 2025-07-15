import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { toast } from 'sonner';

const privacySettings = [
  {
    key: 'profile_visibility' as const,
    title: 'Profile Visibility',
    description: 'Control who can see your profile information'
  },
  {
    key: 'task_sharing' as const,
    title: 'Task Sharing',
    description: 'Allow others to view your public tasks'
  },
  {
    key: 'activity_status' as const,
    title: 'Activity Status',
    description: 'Show when you\'re online and active'
  },
  {
    key: 'analytics_tracking' as const,
    title: 'Analytics Tracking',
    description: 'Help improve the app with usage analytics'
  }
];

export const PrivacySettings = () => {
  const { preferences, updateSinglePreference } = useUserPreferences();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updateSinglePreference(key, value);
  };

  const handleSetup2FA = () => {
    // TODO: Implement 2FA setup flow
    toast.info('Two-Factor Authentication setup will be available soon');
  };

  return (
    <Card className="glass-dark border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Privacy & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {privacySettings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
            <div>
              <h4 className="text-white font-medium">{setting.title}</h4>
              <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
            </div>
            <Switch
              checked={preferences?.[setting.key] || false}
              onCheckedChange={(checked) => handleToggle(setting.key, checked)}
            />
          </div>
        ))}

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
          <div>
            <h4 className="text-white font-medium">Two-Factor Authentication</h4>
            <p className="text-slate-400 text-sm mt-1">Add an extra layer of security to your account</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-slate-800/50 border-slate-600"
            onClick={handleSetup2FA}
          >
            Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
