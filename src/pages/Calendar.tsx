
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Filter,
  AlertCircle,
  CheckCircle,
  Calendar as CalendarDays
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';
import { format, isToday, isThisWeek, isThisMonth, isBefore, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns';

type DateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming';

const Calendar = () => {
  const { tasks, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks based on date filter
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    return tasks.filter(task => {
      if (!task.due_date) return dateFilter === 'all';
      
      const dueDate = parseISO(task.due_date);
      
      switch (dateFilter) {
        case 'today':
          return isToday(dueDate);
        case 'thisWeek':
          return isThisWeek(dueDate);
        case 'thisMonth':
          return isThisMonth(dueDate);
        case 'overdue':
          return isBefore(dueDate, today) && task.status !== 'Done';
        case 'upcoming':
          return isAfter(dueDate, endOfDay(now));
        default:
          return true;
      }
    });
  }, [tasks, dateFilter]);

  // Group tasks by date for calendar display
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [filteredTasks]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayTasks = tasksByDate[dateKey] || [];
      setSelectedDayTasks(dayTasks);
      setIsDayModalOpen(true);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
    setIsDayModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(id);
        // Update selected day tasks if needed
        setSelectedDayTasks(prev => prev.filter(task => task.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getTaskIndicatorColor = (task: Task) => {
    if (!task.due_date) return 'bg-slate-500';
    
    const dueDate = parseISO(task.due_date);
    const now = new Date();
    
    if (task.status === 'Done') return 'bg-green-500';
    if (isBefore(dueDate, startOfDay(now))) return 'bg-red-500';
    if (isToday(dueDate)) return 'bg-yellow-500';
    return 'bg-cyan-500';
  };

  const filterButtons = [
    { key: 'all', label: 'All Tasks', icon: CalendarDays },
    { key: 'today', label: 'Today', icon: Clock },
    { key: 'thisWeek', label: 'This Week', icon: CalendarIcon },
    { key: 'thisMonth', label: 'This Month', icon: CalendarIcon },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle },
    { key: 'upcoming', label: 'Upcoming', icon: CheckCircle },
  ] as const;

  const getFilterStats = () => {
    const now = new Date();
    const today = startOfDay(now);
    
    return {
      all: tasks.length,
      today: tasks.filter(task => task.due_date && isToday(parseISO(task.due_date))).length,
      thisWeek: tasks.filter(task => task.due_date && isThisWeek(parseISO(task.due_date))).length,
      thisMonth: tasks.filter(task => task.due_date && isThisMonth(parseISO(task.due_date))).length,
      overdue: tasks.filter(task => task.due_date && isBefore(parseISO(task.due_date), today) && task.status !== 'Done').length,
      upcoming: tasks.filter(task => task.due_date && isAfter(parseISO(task.due_date), endOfDay(now))).length,
    };
  };

  const stats = getFilterStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Calendar & Schedule</h2>
          <p className="text-slate-400">Plan your time and manage deadlines</p>
        </div>
        
        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Date Filters */}
      <Card className="glass-dark border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2 text-cyan-400" />
            Filter by Due Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={dateFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter(key as DateFilter)}
                className={`relative ${
                  dateFilter === key 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan' 
                    : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {stats[key] > 0 && (
                  <Badge className="ml-2 bg-slate-700 text-white text-xs">
                    {stats[key]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="glass-dark border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-cyan-400" />
                Task Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border-slate-700"
                components={{
                  Day: ({ date, ...props }) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayTasks = tasksByDate[dateKey] || [];
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;
                    const isCurrentDay = isToday(date);
                    
                    return (
                      <div
                        {...props}
                        className={`
                          relative p-2 cursor-pointer transition-all hover:bg-slate-700/50 rounded-lg
                          ${isSelected ? 'bg-cyan-500/20 border border-cyan-500/50' : ''}
                          ${isCurrentDay ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 glow-cyan' : ''}
                        `}
                      >
                        <div className="text-center">
                          <span className={`text-sm ${isCurrentDay ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>
                            {format(date, 'd')}
                          </span>
                        </div>
                        {dayTasks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 justify-center">
                            {dayTasks.slice(0, 3).map((task, index) => (
                              <div
                                key={task.id}
                                className={`w-2 h-2 rounded-full ${getTaskIndicatorColor(task)}`}
                                title={task.title}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="w-2 h-2 rounded-full bg-slate-500 flex items-center justify-center">
                                <span className="text-xs text-white">+</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Filtered Tasks */}
        <div className="space-y-4">
          <Card className="glass-dark border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                {dateFilter === 'all' ? 'All Tasks' : filterButtons.find(b => b.key === dateFilter)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No tasks found for this filter</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg glass border border-slate-700/50 hover:glow-purple transition-all cursor-pointer"
                    onClick={() => handleEditTask(task)}
                  >
                    <h4 className="text-white font-medium mb-1 truncate">{task.title}</h4>
                    {task.due_date && (
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="w-3 h-3" />
                        <span className={`
                          ${task.due_date && isBefore(parseISO(task.due_date), startOfDay(new Date())) && task.status !== 'Done'
                            ? 'text-red-400' 
                            : task.due_date && isToday(parseISO(task.due_date))
                            ? 'text-yellow-400'
                            : 'text-slate-400'
                          }
                        `}>
                          {format(parseISO(task.due_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`text-xs ${
                        task.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                        task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                        'bg-green-500/20 text-green-400 border-green-500/50'
                      }`}>
                        {task.priority}
                      </Badge>
                      <Badge className={`text-xs ${
                        task.status === 'Done' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                        task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/50'
                      }`}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Day Tasks Modal */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="glass-dark border-slate-700/50 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-cyan-400" />
              Tasks for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No tasks scheduled for this day</p>
                <Button 
                  onClick={() => {
                    setIsDayModalOpen(false);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDayTasks.map((task) => (
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
        defaultDueDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
