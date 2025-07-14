
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Download,
  Upload,
  Eye,
  Moon,
  Sun,
  Zap,
  Save
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const Settings = () => {
  const { user } = useAuth();

  const settingsSections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'text-cyan-400'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'text-purple-400'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      color: 'text-pink-400'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      color: 'text-green-400'
    },
    {
      id: 'data',
      label: 'Data',
      icon: Database,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Settings & Preferences</h2>
          <p className="text-slate-400">Customize your TaskNova experience</p>
        </div>
        
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="glass-dark border-slate-700/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-cyan-400" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 hover:scale-105 transition-all group"
                >
                  <Icon className={`w-5 h-5 ${section.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-slate-300 font-medium">{section.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
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

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="glass-dark border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-cyan-400" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-20 h-20 ring-4 ring-primary/50 glow-cyan">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-cyber text-white text-xl">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Avatar
                      </Button>
                      <p className="text-slate-400 text-sm">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-slate-200">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="Enter your first name"
                        className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-slate-200">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Enter your last name"
                        className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-200">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-slate-800/50 border-slate-600 opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-slate-200">Timezone</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">EST</SelectItem>
                          <SelectItem value="pst">PST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="glass-dark border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-purple-400" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { title: 'Task Reminders', description: 'Get notified about upcoming task deadlines' },
                    { title: 'Team Updates', description: 'Receive updates from your team members' },
                    { title: 'Project Milestones', description: 'Get alerts when project milestones are reached' },
                    { title: 'Weekly Summary', description: 'Receive a weekly summary of your productivity' },
                    { title: 'Mobile Push Notifications', description: 'Enable push notifications on mobile devices' },
                    { title: 'Email Notifications', description: 'Receive notifications via email' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
                      <div>
                        <h4 className="text-white font-medium">{setting.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
                      </div>
                      <Switch />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card className="glass-dark border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-pink-400" />
                    Appearance & Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Theme Preference</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: 'Dark', icon: Moon, active: true },
                        { name: 'Light', icon: Sun, active: false },
                        { name: 'Auto', icon: Zap, active: false }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <div 
                            key={theme.name}
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                              theme.active 
                                ? 'border-primary bg-primary/10 glow-cyan' 
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                            }`}
                          >
                            <Icon className={`w-8 h-8 mx-auto mb-2 ${theme.active ? 'text-primary' : 'text-slate-400'}`} />
                            <p className={`text-center font-medium ${theme.active ? 'text-primary' : 'text-slate-300'}`}>
                              {theme.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Accents */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Accent Color</h4>
                    <div className="flex space-x-4">
                      {[
                        'bg-cyan-500',
                        'bg-purple-500',
                        'bg-pink-500',
                        'bg-green-500',
                        'bg-orange-500',
                        'bg-red-500'
                      ].map((color, index) => (
                        <div 
                          key={index}
                          className={`w-12 h-12 rounded-full cursor-pointer border-4 ${color} ${
                            index === 0 ? 'border-white' : 'border-transparent'
                          } hover:scale-110 transition-transform`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Interface Options */}
                  <div className="space-y-4">
                    {[
                      { title: 'Compact View', description: 'Use a more compact interface layout' },
                      { title: 'Animations', description: 'Enable smooth animations and transitions' },
                      { title: 'Glassmorphism', description: 'Use glass-like transparent effects' }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
                        <div>
                          <h4 className="text-white font-medium">{setting.title}</h4>
                          <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
                        </div>
                        <Switch defaultChecked={index === 1 || index === 2} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="glass-dark border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { title: 'Profile Visibility', description: 'Control who can see your profile information' },
                    { title: 'Task Sharing', description: 'Allow others to view your public tasks' },
                    { title: 'Activity Status', description: 'Show when you\'re online and active' },
                    { title: 'Analytics Tracking', description: 'Help improve the app with usage analytics' },
                    { title: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
                      <div>
                        <h4 className="text-white font-medium">{setting.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {index === 4 ? (
                          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600">
                            Setup
                          </Button>
                        ) : (
                          <Switch />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data">
              <Card className="glass-dark border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2 text-orange-400" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Export Data */}
                  <div className="p-4 rounded-lg glass border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium mb-1">Export Your Data</h4>
                        <p className="text-slate-400 text-sm">Download all your tasks, projects, and settings</p>
                      </div>
                      <Button variant="outline" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Import Data */}
                  <div className="p-4 rounded-lg glass border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium mb-1">Import Data</h4>
                        <p className="text-slate-400 text-sm">Import tasks and projects from other apps</p>
                      </div>
                      <Button variant="outline" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>

                  {/* Storage Usage */}
                  <div className="p-4 rounded-lg glass border border-slate-700/50">
                    <h4 className="text-white font-medium mb-3">Storage Usage</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Used Storage</span>
                        <span className="text-white">125 MB of 1 GB</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="w-1/8 h-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 rounded-lg border-2 border-red-500/50 bg-red-500/5">
                    <h4 className="text-red-400 font-medium mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Danger Zone
                    </h4>
                    <div className="space-y-3">
                      <Button variant="destructive" className="w-full">
                        Delete All Data
                      </Button>
                      <p className="text-slate-400 text-sm">
                        This action cannot be undone. All your tasks, projects, and settings will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
