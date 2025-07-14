
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, CheckCircle2, Clock, Star, Loader2 } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskModal from '@/components/TaskModal';
import TaskCard from '@/components/TaskCard';
import TaskFiltersComponent, { TaskFilters } from '@/components/TaskFilters';
import { useOutletContext } from 'react-router-dom';

interface OutletContext {
  selectedProjectId: string | null;
  projects: Array<{ id: string; name: string; color?: string }>;
  setSelectedProjectId?: (id: string | null) => void;
}

const Tasks = () => {
  const { tasks, isLoading, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Safely get context with fallback
  const context = useOutletContext<OutletContext>();
  const selectedProjectId = context?.selectedProjectId || null;

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    priority: 'all',
    status: 'all'
  });

  // Filter tasks based on all criteria
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by selected project if any
    if (selectedProjectId) {
      filtered = filtered.filter(task => task.project_id === selectedProjectId);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    return filtered;
  }, [tasks, selectedProjectId, filters]);

  // Group tasks by project
  const groupedTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    filteredTasks.forEach(task => {
      const projectId = task.project_id || 'no-project';
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Calculate stats from filtered data
  const todoTasks = filteredTasks.filter(task => task.status === 'Todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'In Progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'Done');
  const highPriorityTasks = filteredTasks.filter(task => task.priority === 'High' || task.priority === 'Critical');

  const stats = [
    { 
      label: selectedProjectId ? 'Project Tasks' : 'Total Tasks', 
      value: filteredTasks.length.toString(), 
      icon: Target, 
      gradient: 'btn-gradient-blue',
      glow: 'glow-cyan'
    },
    { 
      label: 'Completed', 
      value: completedTasks.length.toString(), 
      icon: CheckCircle2, 
      gradient: 'btn-gradient-green',
      glow: 'glow-green'
    },
    { 
      label: 'In Progress', 
      value: inProgressTasks.length.toString(), 
      icon: Clock, 
      gradient: 'btn-gradient-orange',
      glow: 'glow-orange'
    },
    { 
      label: 'High Priority', 
      value: highPriorityTasks.length.toString(), 
      icon: Star, 
      gradient: 'btn-gradient-pink',
      glow: 'glow-pink'
    },
  ];

  const getBorderClass = (index: number) => {
    const classes = ['neon-border-blue', 'neon-border-green', 'neon-border-orange', 'neon-border-pink'];
    return classes[index % classes.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 btn-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-400 text-lg">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gradient-pink mb-4">
          {selectedProjectId ? 'Project Tasks' : 'Your Tasks'}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          {selectedProjectId 
            ? `Tasks for ${projects.find(p => p.id === selectedProjectId)?.name || 'this project'}`
            : 'Manage and track your productivity with style'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`glass-card ${getBorderClass(index)} hover:scale-105 transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.gradient} ${stat.glow}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Header with Create Task Button */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleCreateTask}
          className="btn-gradient-purple glow-purple text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Smart Filters */}
      <TaskFiltersComponent 
        filters={filters}
        onFiltersChange={setFilters}
        className="glass-card neon-border-purple p-6 rounded-xl"
      />

      {/* Tasks Content */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 btn-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 glow-purple">
            <Target className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-white text-2xl font-bold mb-4">
            {filters.search || filters.priority !== 'all' || filters.status !== 'all'
              ? 'No tasks match your filters'
              : selectedProjectId 
                ? 'No tasks in this project'
                : 'No tasks yet'
            }
          </h3>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            {filters.search || filters.priority !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your search criteria or filters'
              : selectedProjectId 
                ? 'Create your first task for this project to get started'
                : 'Create your first task to get started with productivity tracking'
            }
          </p>
          <Button 
            onClick={handleCreateTask}
            className="btn-gradient-blue glow-cyan text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Show grouped tasks by project */}
          {Object.entries(groupedTasks).map(([projectId, projectTasks]) => {
            const project = projects.find(p => p.id === projectId);
            const isNoProject = projectId === 'no-project';
            
            return (
              <div key={projectId} className="space-y-4">
                {/* Project Header */}
                {!selectedProjectId && (
                  <div className="flex items-center gap-3 mb-6">
                    {!isNoProject && project && (
                      <>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        />
                        <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                      </>
                    )}
                    {isNoProject && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-slate-500" />
                        <h2 className="text-2xl font-bold text-slate-400">No Project</h2>
                      </>
                    )}
                    <span className="text-slate-500 text-lg">({projectTasks.length})</span>
                  </div>
                )}

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projectTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={handleCreateTask}
        size="lg"
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full btn-gradient-purple glow-purple shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="w-8 h-8" />
      </Button>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
};

export default Tasks;
