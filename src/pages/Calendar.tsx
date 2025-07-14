
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';
import TaskFiltersComponent, { TaskFilters } from '@/components/TaskFilters';
import { useProjects } from '@/hooks/useProjects';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  startOfWeek as startOfWeekDate,
  endOfWeek as endOfWeekDate,
  parseISO
} from 'date-fns';

const Calendar = () => {
  const { tasks, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    status: 'all',
    tagIds: []
  });

  // Filter tasks based on date and other criteria
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => Boolean(task.due_date));

    // Apply date filters
    const now = new Date();
    const today = startOfDay(now);
    const thisWeekStart = startOfWeekDate(now, { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeekDate(now, { weekStartsOn: 0 });
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(task => {
          const dueDate = parseISO(task.due_date!);
          return isSameDay(dueDate, today);
        });
        break;
      case 'thisWeek':
        filtered = filtered.filter(task => {
          const dueDate = parseISO(task.due_date!);
          return dueDate >= thisWeekStart && dueDate <= thisWeekEnd;
        });
        break;
      case 'thisMonth':
        filtered = filtered.filter(task => {
          const dueDate = parseISO(task.due_date!);
          return dueDate >= thisMonthStart && dueDate <= thisMonthEnd;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(task => {
          const dueDate = parseISO(task.due_date!);
          return isBefore(dueDate, today) && task.status !== 'Done';
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(task => {
          const dueDate = parseISO(task.due_date!);
          return isAfter(dueDate, today);
        });
        break;
    }

    // Apply other filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.tagIds.length > 0) {
      filtered = filtered.filter(task => 
        task.tags?.some(tag => filters.tagIds.includes(tag.id))
      );
    }

    return filtered;
  }, [tasks, dateFilter, filters]);

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  };

  // Calculate stats
  const todayTasks = filteredTasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    return isSameDay(taskDate, new Date());
  });

  const overdueTasks = filteredTasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    return isBefore(taskDate, startOfDay(new Date())) && task.status !== 'Done';
  });

  const completedTasks = filteredTasks.filter(task => task.status === 'Done');

  const upcomingTasks = filteredTasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    return isAfter(taskDate, new Date());
  });

  const dateFilterOptions = [
    { value: 'all', label: 'All', count: filteredTasks.length },
    { value: 'today', label: 'Today', count: todayTasks.length },
    { value: 'thisWeek', label: 'This Week', count: filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      const thisWeekStart = startOfWeekDate(new Date(), { weekStartsOn: 0 });
      const thisWeekEnd = endOfWeekDate(new Date(), { weekStartsOn: 0 });
      return taskDate >= thisWeekStart && taskDate <= thisWeekEnd;
    }).length },
    { value: 'thisMonth', label: 'This Month', count: filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      const thisMonthStart = startOfMonth(new Date());
      const thisMonthEnd = endOfMonth(new Date());
      return taskDate >= thisMonthStart && taskDate <= thisMonthEnd;
    }).length },
    { value: 'overdue', label: 'Overdue', count: overdueTasks.length },
    { value: 'upcoming', label: 'Upcoming', count: upcomingTasks.length },
  ];

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTaskIndicatorColor = (task: any) => {
    if (task.status === 'Done') return '#10b981';
    if (task.priority === 'Critical') return '#dc2626';
    if (task.priority === 'High') return '#ea580c';
    if (task.priority === 'Medium') return '#eab308';
    return '#6366f1';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-dark border-slate-700/50 hover:glow-cyan transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Today</p>
                <p className="text-2xl font-bold text-white mt-1">{todayTasks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 text-cyan-400">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-slate-700/50 hover:glow-green transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{completedTasks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-slate-700/50 hover:glow-purple transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-white mt-1">{upcomingTasks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 text-purple-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-slate-700/50 hover:glow-red transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-white mt-1">{overdueTasks.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {dateFilterOptions.map((option) => (
          <Button
            key={option.value}
            variant={dateFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(option.value)}
            className={`${
              dateFilter === option.value
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {option.label} ({option.count})
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <TaskFiltersComponent 
        filters={filters}
        onFiltersChange={setFilters}
        className="glass-dark border-slate-700/50 p-6 rounded-lg"
      />

      {/* Calendar */}
      <Card className="glass-dark border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-cyan-400" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-slate-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all hover:scale-105
                    ${isCurrentMonth 
                      ? 'bg-slate-800/30 border-slate-600/50 text-white' 
                      : 'bg-slate-900/20 border-slate-700/30 text-slate-500'
                    }
                    ${isTodayDate ? 'ring-2 ring-cyan-400 glow-cyan' : ''}
                    hover:bg-slate-700/50 hover:border-slate-500/50
                  `}
                >
                  <div className="font-medium text-sm mb-1">
                    {format(day, 'd')}
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded truncate"
                        style={{
                          backgroundColor: `${getTaskIndicatorColor(task)}20`,
                          borderLeft: `3px solid ${getTaskIndicatorColor(task)}`
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="glass-dark border-slate-700/50 text-white max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gradient flex items-center justify-between">
              Tasks for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              <Button
                onClick={() => {
                  const tasksForDate = getTasksForSelectedDate();
                  setIsTaskModalOpen(true);
                }}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {getTasksForSelectedDate().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No tasks scheduled for this date</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {getTasksForSelectedDate().map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projects={projects}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        defaultDueDate={selectedDate || undefined}
      />
    </div>
  );
};

export default Calendar;
