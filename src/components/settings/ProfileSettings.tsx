import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
];

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, isUpdating } = useProfile();
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    timezone: profile?.timezone || 'UTC',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        timezone: profile.timezone || 'UTC',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error('Please upload a JPG, PNG, or GIF image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    uploadAvatar(file);
  };

  return (
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
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-cyber text-white text-xl">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">
              <Button 
                variant="outline" 
                className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Avatar
                </span>
              </Button>
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-slate-400 text-sm">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-slate-200">First Name</Label>
              <Input
                id="first-name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter your first name"
                className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-slate-200">Last Name</Label>
              <Input
                id="last-name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
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
              <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
