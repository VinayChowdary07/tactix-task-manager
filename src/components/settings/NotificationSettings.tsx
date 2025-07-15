
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const notificationSettings = [
  {
    key: 'task_reminders' as const,
    title: 'Task Reminders',
    description: 'Get notified about upcoming task deadlines'
  },
  {
    key: 'team_updates' as const,
    title: 'Team Updates',
    description: 'Receive updates from your team members'
  },
  {
    key: 'project_milestones' as const,
    title: 'Project Milestones',
    description: 'Get alerts when project milestones are reached'
  },
  {
    key: 'weekly_summary' as const,
    title: 'Weekly Summary',
    description: 'Receive a weekly summary of your productivity'
  },
  {
    key: 'mobile_push_notifications' as const,
    title: 'Mobile Push Notifications',
    description: 'Enable push notifications on mobile devices'
  },
  {
    key: 'email_notifications' as const,
    title: 'Email Notifications',
    description: 'Receive notifications via email'
  }
];

export const NotificationSettings = () => {
  const { preferences, updateSinglePreference, isUpdating } = useUserPreferences();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    console.log(`Toggling notification setting: ${key} = ${value}`);
    updateSinglePreference(key, value);
  };

  if (!preferences) {
    return (
      <Card className="glass-dark border-slate-700/50">
        <CardContent className="p-6">
          <p className="text-slate-400">Loading notification preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-dark border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Bell className="w-5 h-5 mr-2 text-purple-400" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationSettings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
            <div>
              <h4 className="text-white font-medium">{setting.title}</h4>
              <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
            </div>
            <Switch
              checked={preferences?.[setting.key] || false}
              onCheckedChange={(checked) => handleToggle(setting.key, checked)}
              disabled={isUpdating}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
