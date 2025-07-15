
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white text-center">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6 text-slate-200">
              <p className="text-lg leading-relaxed">
                This task manager app respects your privacy. We do not collect, store, or share any personal information outside your Google account integration. The data accessed through Google Calendar is used only for syncing tasks and events to improve your productivity experience. This data is not stored on our servers nor shared with third parties.
              </p>
              
              <p className="text-lg leading-relaxed">
                By using this app, you agree to allow access to your Google Calendar solely for the purpose of managing tasks.
              </p>
              
              <p className="text-lg leading-relaxed">
                If you have any questions or concerns, please contact us at [your email here].
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
