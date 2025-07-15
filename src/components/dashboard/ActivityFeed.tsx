
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem } from '@/hooks/useDashboard';
import { CheckCircle2, FolderOpen, Target, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string, action: string) => {
    if (action === 'completed') {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
    
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'project':
        return <FolderOpen className="w-4 h-4 text-purple-400" />;
      case 'goal':
        return <Target className="w-4 h-4 text-pink-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionText = (type: string, action: string) => {
    if (action === 'completed') {
      return `${type} completed`;
    }
    return `${type} updated`;
  };

  if (activities.length === 0) {
    return (
      <Card className="glass-card neon-border-purple">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card neon-border-purple">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.type}-${activity.id}-${activity.timestamp}`} 
                 className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getIcon(activity.type, activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{activity.title}</p>
                <p className="text-slate-400 text-sm">
                  {getActionText(activity.type, activity.action)} • {' '}
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
