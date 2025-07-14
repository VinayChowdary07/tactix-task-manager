
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tag, 
  Plus,
  Hash,
  TrendingUp,
  Target,
  Star,
  Zap
} from 'lucide-react';

const Tags = () => {
  const tags = [
    {
      id: 1,
      name: "Development",
      color: "from-blue-500 to-cyan-500",
      taskCount: 12,
      completedTasks: 8,
      priority: "high",
      description: "Software development and coding tasks"
    },
    {
      id: 2,
      name: "Design",
      color: "from-purple-500 to-pink-500",
      taskCount: 8,
      completedTasks: 6,
      priority: "high",
      description: "UI/UX design and creative work"
    },
    {
      id: 3,
      name: "Meeting",
      color: "from-green-500 to-emerald-500",
      taskCount: 15,
      completedTasks: 12,
      priority: "medium",
      description: "Team meetings and discussions"
    },
    {
      id: 4,
      name: "Documentation",
      color: "from-orange-500 to-red-500",
      taskCount: 6,
      completedTasks: 3,
      priority: "medium",
      description: "Writing and updating documentation"
    },
    {
      id: 5,
      name: "Testing",
      color: "from-yellow-500 to-amber-500",
      taskCount: 9,
      completedTasks: 7,
      priority: "high",
      description: "Quality assurance and testing"
    },
    {
      id: 6,
      name: "Research",
      color: "from-indigo-500 to-purple-500",
      taskCount: 4,
      completedTasks: 2,
      priority: "low",
      description: "Research and analysis tasks"
    },
    {
      id: 7,
      name: "Marketing",
      color: "from-pink-500 to-rose-500",
      taskCount: 7,
      completedTasks: 5,
      priority: "medium",
      description: "Marketing and promotional activities"
    },
    {
      id: 8,
      name: "Optimization",
      color: "from-teal-500 to-cyan-500",
      taskCount: 5,
      completedTasks: 1,
      priority: "high",
      description: "Performance and efficiency improvements"
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

  const getCompletionRate = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const stats = [
    { label: 'Total Tags', value: '24', icon: Tag, color: 'text-cyan-400' },
    { label: 'Active Tags', value: '18', icon: Target, color: 'text-green-400' },
    { label: 'Most Used', value: 'Dev', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Avg. Tasks', value: '8.5', icon: Hash, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-dark border-slate-700/50 hover:glow-pink transition-all transform hover:scale-105">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Tags & Categories</h2>
          <p className="text-slate-400">Organize your tasks with smart tagging</p>
        </div>
        
        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 glow-pink transition-all transform hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </Button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {tags.map((tag) => {
          const completionRate = getCompletionRate(tag.completedTasks, tag.taskCount);
          
          return (
            <Card 
              key={tag.id} 
              className="glass-dark border-slate-700/50 hover:glow-pink transition-all transform hover:scale-105 cursor-pointer group overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${tag.color}`}></div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${tag.color}`}>
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg group-hover:text-pink-400 transition-colors flex items-center">
                        {tag.name}
                        {tag.priority === 'high' && (
                          <Star className="w-4 h-4 ml-2 text-yellow-400" />
                        )}
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-1">{tag.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Task Statistics */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-2xl font-bold text-white">{tag.taskCount}</p>
                      <p className="text-slate-400 text-xs">Total Tasks</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-2xl font-bold text-green-400">{tag.completedTasks}</p>
                      <p className="text-slate-400 text-xs">Completed</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Completion</span>
                      <span className="text-white font-medium">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${tag.color} transition-all`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className={`border ${getPriorityColor(tag.priority)}`}>
                      <Zap className="w-3 h-3 mr-1" />
                      {tag.priority} priority
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      {tag.taskCount - tag.completedTasks} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-dark border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-cyan-400" />
            Quick Tag Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center space-y-2 bg-slate-800/50 border-slate-600 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:glow-cyan transition-all"
            >
              <Plus className="w-6 h-6 text-cyan-400" />
              <span className="text-slate-300">Create New Tag</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center space-y-2 bg-slate-800/50 border-slate-600 hover:bg-purple-500/10 hover:border-purple-500/50 hover:glow-purple transition-all"
            >
              <Hash className="w-6 h-6 text-purple-400" />
              <span className="text-slate-300">Bulk Edit Tags</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center space-y-2 bg-slate-800/50 border-slate-600 hover:bg-pink-500/10 hover:border-pink-500/50 hover:glow-pink transition-all"
            >
              <TrendingUp className="w-6 h-6 text-pink-400" />
              <span className="text-slate-300">Tag Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tags;
