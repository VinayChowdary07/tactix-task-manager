
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { DataSettings } from '@/components/settings/DataSettings';
import { toast } from 'sonner';

const Settings = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      await signOut();
      // Clear any localStorage if needed
      localStorage.clear();
      console.log('Sign out successful');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleSaveAll = () => {
    // This is just a visual feedback - individual components handle their own saves
    toast.success('All settings have been saved automatically');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Settings & Preferences</h2>
          <p className="text-slate-400">Customize your TaskNova experience</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button 
            onClick={handleSaveAll}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-5 bg-slate-800/50 border-slate-700 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="data">
          <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
