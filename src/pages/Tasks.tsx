
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const Tasks = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Placeholder task data
  const tasks = [
    {
      id: 1,
      title: "Complete UI/UX Design Review",
      description: "Review and approve the new dashboard design mockups",
      dueDate: "2024-01-20",
      priority: "high",
      progress: 75,
      status: "in-progress",
      tags: ["Design", "Review"]
    },
    {
      id: 2,
      title: "Implement Authentication System",
      description: "Set up user authentication with OAuth providers",
      dueDate: "2024-01-18",
      priority: "high",
      progress: 90,
      status: "in-progress",
      tags: ["Development", "Security"]
    },
    {
      id: 3,
      title: "Database Migration Script",
      description: "Create migration scripts for the new user profile tables",
      dueDate: "2024-01-25",
      priority: "medium",
      progress: 45,
      status: "in-progress",
      tags: ["Database", "Migration"]
    },
    {
      id: 4,
      title: "Team Meeting Preparation",
      description: "Prepare slides and agenda for the weekly team standup",
      dueDate: "2024-01-17",
      priority: "low",
      progress: 100,
      status: "completed",
      tags: ["Meeting", "Team"]
    },
    {
      id: 5,
      title: "API Documentation Update",
      description: "Update API documentation with new endpoints and examples",
      dueDate: "2024-01-22",
      priority: "medium",
      progress: 20,
      status: "todo",
      tags: ["Documentation", "API"]
    },
    {
      id: 6,
      title: "Performance Optimization",
      description: "Optimize application performance and reduce load times",
      dueDate: "2024-01-30",
      priority: "high",
      progress: 10,
      status: "todo",
      tags: ["Performance", "Optimization"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'todo': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default: return null;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (progress >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  // Stats data
  const stats = [
    { label: 'Total Tasks', value: '24', icon: Target, color: 'text-cyan-400' },
    { label: 'Completed', value: '18', icon: CheckCircle2, color: 'text-green-400' },
    { label: 'In Progress', value: '4', icon: Clock, color: 'text-blue-400' },
    { label: 'High Priority', value: '2', icon: Star, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header with Create Task Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Your Tasks</h2>
          <p className="text-slate-400">Manage and track your productivity</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all transform hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-dark border-slate-700/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                Create New Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-slate-200">Title</Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title..."
                  className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-slate-200">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Add task description..."
                  className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-date" className="text-slate-200">Due Date</Label>
                  <Input
                    id="task-date"
                    type="date"
                    className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-purple transition-all"
                onClick={() => setIsDialogOpen(false)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className="glass-dark border-slate-700/50 hover:glow-cyan transition-all transform hover:scale-105 cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors">
                  {task.title}
                </CardTitle>
                {getStatusIcon(task.status)}
              </div>
              <p className="text-slate-400 text-sm mt-2">{task.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(task.progress)}`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Due Date and Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <Badge className={`border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-slate-800/50 border-slate-600 text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-cyber glow-cyan shadow-2xl hover:scale-110 transition-all z-50"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-dark border-slate-700/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
              Quick Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="What needs to be done?"
              className="bg-slate-800/50 border-slate-600 focus:border-primary focus:glow-cyan transition-all"
            />
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 glow-cyan transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
