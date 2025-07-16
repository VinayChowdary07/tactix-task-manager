
import React, { useState } from 'react';
import { Plus, Filter, Calendar, List, Layout, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskDetailsModal from '@/components/tasks/TaskDetailsModal';
import TaskKanbanView from '@/components/tasks/TaskKanbanView';
import TaskTimelineView from '@/components/tasks/TaskTimelineView';
import TaskGroupedView from '@/components/tasks/TaskGroupedView';
import TaskViewToggle from '@/components/tasks/TaskViewToggle';
import RecurringTaskProcessor from '@/components/RecurringTaskProcessor';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ViewType = 'list' | 'kanban' | 'timeline' | 'grouped';

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewType, setViewType] = useState<ViewType>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'status' | 'project' | 'priority'>('status');

  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask.mutateAsync(taskData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    
    try {
      await updateTask.mutateAsync({ id: editingTask.id, ...taskData });
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    const newCompleted = newStatus === 'Done';
    
    try {
      await updateTask.mutateAsync({ 
        id: task.id, 
        status: newStatus,
        completed: newCompleted 
      });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTask(null);
  };

  // Filter tasks based on status and priority
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const renderTaskView = () => {
    switch (viewType) {
      case 'kanban':
        return (
          <TaskKanbanView
            tasks={filteredTasks}
            projects={projects}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            onView={handleViewTask}
          />
        );
      case 'timeline':
        return (
          <TaskTimelineView
            tasks={filteredTasks}
            projects={projects}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
          />
        );
      case 'grouped':
        return (
          <TaskGroupedView
            tasks={filteredTasks}
            projects={projects}
            groupBy={groupBy}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
            onView={handleViewTask}
          />
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onViewDetails={handleViewTask}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Tasks</h1>
          <p className="text-slate-400">Manage and organize your tasks</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recurring
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              {viewType === 'grouped' && (
                <Select value={groupBy} onValueChange={(value: 'status' | 'project' | 'priority') => setGroupBy(value)}>
                  <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Group by Status</SelectItem>
                    <SelectItem value="project">Group by Project</SelectItem>
                    <SelectItem value="priority">Group by Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <TaskViewToggle viewType={viewType} onViewChange={setViewType} />
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
              <List className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No tasks found</p>
              <p className="text-slate-500 text-sm mb-4">
                {tasks.length === 0 ? "Create your first task to get started" : "Try adjusting your filters"}
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          ) : (
            renderTaskView()
          )}
        </TabsContent>
        
        <TabsContent value="recurring" className="space-y-6">
          <RecurringTaskProcessor />
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">How Recurring Tasks Work</h3>
            <div className="space-y-3 text-slate-400 text-sm">
              <p>• Recurring tasks are automatically processed every day at midnight (00:00 UTC)</p>
              <p>• When you create a task with recurrence, new instances are generated based on the schedule</p>
              <p>• Daily tasks: Create a new task every day at the specified interval</p>
              <p>• Weekly tasks: Create a new task every week on the same day</p>
              <p>• Monthly tasks: Create a new task every month on the same date</p>
              <p>• Each recurring task instance is independent and can be edited or deleted separately</p>
              <p>• The original recurring task remains intact and continues generating new instances</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        projects={projects}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          task={selectedTask}
          projects={projects}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
};

export default Tasks;
