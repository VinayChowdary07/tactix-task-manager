
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

const RecurringTaskProcessor: React.FC = () => {
  const { processRecurringTasks } = useTasks();

  const handleProcessRecurring = () => {
    processRecurringTasks.mutate();
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-slate-200">Recurring Tasks</h3>
      </div>
      
      <p className="text-slate-400 text-sm mb-4">
        Recurring tasks are automatically processed every day at midnight. 
        You can also manually trigger the process for testing purposes.
      </p>
      
      <Button
        onClick={handleProcessRecurring}
        disabled={processRecurringTasks.isPending}
        className="bg-cyan-600 hover:bg-cyan-700 text-white"
      >
        {processRecurringTasks.isPending ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Clock className="w-4 h-4 mr-2" />
        )}
        Process Recurring Tasks
      </Button>
    </div>
  );
};

export default RecurringTaskProcessor;
