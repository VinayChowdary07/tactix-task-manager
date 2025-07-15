
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Zap, Palette } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const themes = [
  { name: 'Dark', icon: Moon, value: 'dark' },
  { name: 'Light', icon: Sun, value: 'light' },
  { name: 'Auto', icon: Zap, value: 'auto' }
];

const accentColors = [
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' }
];

const interfaceOptions = [
  {
    key: 'compact_view' as const,
    title: 'Compact View',
    description: 'Use a more compact interface layout'
  },
  {
    key: 'animations' as const,
    title: 'Animations',
    description: 'Enable smooth animations and transitions'
  },
  {
    key: 'glassmorphism' as const,
    title: 'Glassmorphism',
    description: 'Use glass-like transparent effects'
  }
];

export const AppearanceSettings = () => {
  const { preferences, updateSinglePreference } = useUserPreferences();

  const handleThemeChange = (theme: string) => {
    updateSinglePreference('theme', theme);
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleAccentColorChange = (color: string) => {
    updateSinglePreference('accent_color', color);
    // Apply accent color immediately
    document.documentElement.style.setProperty('--accent-color', color);
  };

  return (
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
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = preferences?.theme === theme.value;
              return (
                <div 
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.value)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/10 glow-cyan' 
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <p className={`text-center font-medium ${isActive ? 'text-primary' : 'text-slate-300'}`}>
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
            {accentColors.map((color) => {
              const isActive = preferences?.accent_color === color.value;
              return (
                <div 
                  key={color.value}
                  onClick={() => handleAccentColorChange(color.value)}
                  className={`w-12 h-12 rounded-full cursor-pointer border-4 ${color.class} ${
                    isActive ? 'border-white' : 'border-transparent'
                  } hover:scale-110 transition-transform`}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Interface Options - Note: These are UI-only toggles for now */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Interface Options</h4>
          {interfaceOptions.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg glass border border-slate-700/50">
              <div>
                <h4 className="text-white font-medium">{setting.title}</h4>
                <p className="text-slate-400 text-sm mt-1">{setting.description}</p>
              </div>
              <Switch defaultChecked={setting.key === 'animations' || setting.key === 'glassmorphism'} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
