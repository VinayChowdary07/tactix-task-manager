
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface TaskTimerProps {
  taskId: string;
  timeEstimate?: number;
  timeSpent?: number;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ taskId, timeEstimate, timeSpent }) => {
  const { isTracking, elapsedTime, startTimer, stopTimer, formatTime, totalTimeSpent } = useTimeTracking(taskId);

  const handleStartStop = () => {
    if (isTracking) {
      stopTimer.mutate();
    } else {
      startTimer.mutate();
    }
  };

  const totalMinutes = totalTimeSpent + Math.floor(elapsedTime / 60);
  const isOverEstimate = timeEstimate && totalMinutes > timeEstimate;

  return (
    <div className="flex items-center gap-2 p-3 glass-card rounded-lg border border-slate-700/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartStop}
        disabled={startTimer.isPending || stopTimer.isPending}
        className={`p-2 rounded-full transition-all duration-300 ${
          isTracking 
            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 glow-red' 
            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 glow-green'
        }`}
      >
        {isTracking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className={`text-sm font-mono ${isTracking ? 'text-cyan-400' : 'text-slate-300'}`}>
            {isTracking ? formatTime(elapsedTime) : formatTime(totalMinutes * 60)}
          </span>
        </div>
        
        {timeEstimate && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">Est:</span>
            <span className={isOverEstimate ? 'text-red-400' : 'text-slate-400'}>
              {Math.floor(timeEstimate / 60)}h {timeEstimate % 60}m
            </span>
            {isOverEstimate && (
              <span className="text-red-400 ml-1 animate-pulse">⚠</span>
            )}
          </div>
        )}
      </div>

      {isTracking && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default TaskTimer;
