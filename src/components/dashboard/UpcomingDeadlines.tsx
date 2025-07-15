
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow, isToday, isTomorrow, format } from 'date-fns';

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ tasks }) => {
  const getDeadlineText = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getUrgencyColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDue <= 24) return 'text-red-400 border-red-400/30';
    if (hoursUntilDue <= 72) return 'text-yellow-400 border-yellow-400/30';
    return 'text-blue-400 border-blue-400/30';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Critical' || priority === 'High') {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  if (tasks.length === 0) {
    return (
      <Card className="glass-card neon-border-orange">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card neon-border-orange">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-3 rounded-lg border-l-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors ${
                getUrgencyColor(task.due_date!)
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {getPriorityIcon(task.priority)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {getDeadlineText(task.due_date!)} • {task.priority} Priority
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0">
                  {format(new Date(task.due_date!), 'MMM dd')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
