
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users
} from 'lucide-react';

const Calendar = () => {
  const events = [
    {
      id: 1,
      title: "Project Kickoff Meeting",
      time: "09:00 AM",
      duration: "1 hour",
      type: "meeting",
      attendees: 6,
      location: "Conference Room A"
    },
    {
      id: 2,
      title: "Code Review Session",
      time: "02:00 PM",
      duration: "2 hours",
      type: "review",
      attendees: 3,
      location: "Virtual"
    },
    {
      id: 3,
      title: "Task Deadline: UI Components",
      time: "11:59 PM",
      duration: "Due",
      type: "deadline",
      attendees: 1,
      location: "N/A"
    }
  ];

  const upcomingTasks = [
    { title: "Complete Authentication", due: "Tomorrow", priority: "high" },
    { title: "Update Documentation", due: "Jan 20", priority: "medium" },
    { title: "Team Standup", due: "Jan 22", priority: "low" },
    { title: "Deploy to Production", due: "Jan 25", priority: "high" }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'from-blue-500 to-cyan-500';
      case 'review': return 'from-purple-500 to-pink-500';
      case 'deadline': return 'from-red-500 to-orange-500';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  // Generate calendar days for current month (simplified)
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date().getDate();
    
    for (let i = 1; i <= 31; i++) {
      const isToday = i === today;
      const hasEvent = [15, 18, 22, 25].includes(i);
      
      days.push(
        <div
          key={i}
          className={`p-3 text-center cursor-pointer rounded-lg transition-all hover:scale-105 ${
            isToday 
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan' 
              : hasEvent
              ? 'bg-slate-800/50 text-slate-300 border border-purple-500/30'
              : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
          }`}
        >
          <div className="font-medium">{i}</div>
          {hasEvent && (
            <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mt-1"></div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Calendar & Schedule</h2>
          <p className="text-slate-400">Plan your time and manage deadlines</p>
        </div>
        
        <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="glass-dark border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-cyan-400" />
                  January 2024
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-slate-400 font-medium text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="glass-dark border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 rounded-lg glass border border-slate-700/50 hover:glow-purple transition-all cursor-pointer"
                >
                  <div className={`w-full h-1 bg-gradient-to-r ${getEventColor(event.type)} rounded-full mb-3`}></div>
                  
                  <h4 className="text-white font-medium mb-2">{event.title}</h4>
                  
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{event.time} ({event.duration})</span>
                    </div>
                    {event.location !== "N/A" && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="glass-dark border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-pink-400" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg glass border border-slate-700/50 hover:bg-slate-800/30 transition-all"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{task.title}</p>
                    <p className="text-slate-400 text-xs">{task.due}</p>
                  </div>
                  <Badge className={`border text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
