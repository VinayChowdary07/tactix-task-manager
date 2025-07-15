
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Target } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const Calendar = () => {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getEventsForDay = (day: Date) => {
    const dayTasks = tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), day)
    );
    
    const dayGoals = goals.filter(goal => 
      (goal.start_date && isSameDay(new Date(goal.start_date), day)) ||
      (goal.target_date && isSameDay(new Date(goal.target_date), day))
    );

    return { tasks: dayTasks, goals: dayGoals };
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const upcoming = [];
    
    // Get tasks due in next 7 days
    const upcomingTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    // Get goals with target dates in next 7 days
    const upcomingGoals = goals.filter(goal => {
      if (!goal.target_date) return false;
      const targetDate = new Date(goal.target_date);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    return { tasks: upcomingTasks, goals: upcomingGoals };
  };

  const upcomingEvents = getUpcomingEvents();

  const getStatsCards = () => {
    const today = new Date();
    const todayTasks = tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), today)
    ).length;
    
    const overdueTasks = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < today && task.status !== 'Done'
    ).length;

    const thisMonthGoals = goals.filter(goal => 
      goal.target_date && 
      new Date(goal.target_date).getMonth() === today.getMonth() &&
      new Date(goal.target_date).getFullYear() === today.getFullYear()
    ).length;

    return [
      { label: 'Today\'s Tasks', value: todayTasks, icon: CalendarIcon, color: 'text-cyan-400' },
      { label: 'Overdue Tasks', value: overdueTasks, icon: Clock, color: 'text-red-400' },
      { label: 'Monthly Goals', value: thisMonthGoals, icon: Target, color: 'text-purple-400' },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-slate-400">View your tasks and goals timeline</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getStatsCards().map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-white">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const events = getEventsForDay(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isDayToday = isToday(day);

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors ${
                          isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/30'
                        } ${isDayToday ? 'ring-2 ring-cyan-400' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonth ? 'text-white' : 'text-slate-500'
                        } ${isDayToday ? 'text-cyan-400' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {events.tasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className="text-xs p-1 rounded bg-blue-900/50 text-blue-300 truncate"
                            >
                              {task.title}
                            </div>
                          ))}
                          {events.goals.slice(0, 1).map((goal) => (
                            <div
                              key={goal.id}
                              className="text-xs p-1 rounded bg-purple-900/50 text-purple-300 truncate"
                            >
                              🎯 {goal.title}
                            </div>
                          ))}
                          {(events.tasks.length + events.goals.length) > 3 && (
                            <div className="text-xs text-slate-500">
                              +{(events.tasks.length + events.goals.length) - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.tasks.length === 0 && upcomingEvents.goals.length === 0 ? (
                  <p className="text-slate-400 text-sm">No upcoming events</p>
                ) : (
                  <>
                    {upcomingEvents.tasks.map((task) => (
                      <div key={task.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{task.title}</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Due: {format(new Date(task.due_date), 'MMM dd')}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="ml-2 bg-blue-900/50 text-blue-300 border-blue-700"
                          >
                            Task
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {upcomingEvents.goals.map((goal) => (
                      <div key={goal.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">{goal.title}</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Target: {format(new Date(goal.target_date), 'MMM dd')}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="ml-2 bg-purple-900/50 text-purple-300 border-purple-700"
                          >
                            Goal
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Quick Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), new Date())).length}
                  </div>
                  <div className="text-sm text-slate-400">Tasks Due Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {goals.filter(g => g.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-400">Active Goals</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
