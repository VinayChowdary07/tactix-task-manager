
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Palette,
  Star,
  Hash,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Tags = () => {
  const { tags = [], createTag, deleteTag } = useTags();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [editingTag, setEditingTag] = useState<any>(null);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    try {
      await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor
      });
      setNewTagName('');
      setNewTagColor('#6366f1');
      setIsModalOpen(false);
      toast.success('Tag created successfully!');
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`)) {
      try {
        await deleteTag.mutateAsync(tagId);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
  ];

  const stats = [
    { 
      label: 'Total Tags', 
      value: tags.length.toString(), 
      icon: Tag, 
      gradient: 'btn-gradient-blue',
      glow: 'glow-cyan'
    },
    { 
      label: 'Most Used', 
      value: tags.length > 0 ? tags[0]?.name || 'None' : 'None', 
      icon: Star, 
      gradient: 'btn-gradient-orange',
      glow: 'glow-orange'
    },
    { 
      label: 'Categories', 
      value: Math.ceil(tags.length / 3).toString(), 
      icon: Hash, 
      gradient: 'btn-gradient-green',
      glow: 'glow-green'
    },
    { 
      label: 'Active', 
      value: tags.length.toString(), 
      icon: CheckCircle2, 
      gradient: 'btn-gradient-purple',
      glow: 'glow-purple'
    },
  ];

  const getBorderClass = (index: number) => {
    const classes = ['neon-border-blue', 'neon-border-pink', 'neon-border-green', 'neon-border-orange', 'neon-border-purple'];
    return classes[index % classes.length];
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gradient mb-4">Tag Management</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Organize your tasks with powerful, customizable tags
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
                    <p className="text-3xl font-bold text-white mt-2 truncate">{stat.value}</p>
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

      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative flex-1 sm:flex-initial sm:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg input-neon text-white placeholder-slate-400 rounded-xl"
          />
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient-pink glow-pink text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-dark border-slate-700/50 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient flex items-center">
                <Tag className="w-6 h-6 mr-2" />
                Create New Tag
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Tag Name</Label>
                <Input
                  placeholder="Enter tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Tag Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        newTagColor === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-8 h-8 rounded border-slate-600 bg-slate-800"
                  />
                  <span className="text-sm text-slate-400">Custom color</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 rounded-lg glass-card">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: newTagColor }}
                />
                <Badge
                  className="text-white border"
                  style={{
                    backgroundColor: `${newTagColor}20`,
                    borderColor: `${newTagColor}50`,
                    color: newTagColor
                  }}
                >
                  {newTagName || 'Preview'}
                </Badge>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || createTag.isPending}
                  className="flex-1 btn-gradient-blue glow-cyan"
                >
                  {createTag.isPending ? 'Creating...' : 'Create Tag'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <Card className="glass-card neon-border-purple text-center py-16">
          <CardContent>
            <div className="w-24 h-24 btn-gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 glow-purple">
              <Tag className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? 'No tags found' : 'No tags yet'}
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for' 
                : 'Create your first tag to start organizing your tasks with powerful labels'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="btn-gradient-blue glow-cyan text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Tag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTags.map((tag, index) => (
            <Card 
              key={tag.id} 
              className={`glass-card ${getBorderClass(index)} hover:scale-105 transition-all duration-300 group overflow-hidden`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-white text-lg group-hover:text-gradient transition-all duration-300 truncate">
                      {tag.name}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg"
                      onClick={() => {
                        setEditingTag(tag);
                        setNewTagName(tag.name);
                        setNewTagColor(tag.color);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Tag Preview */}
                  <div className="flex items-center justify-center p-4 rounded-lg glass-card">
                    <Badge
                      className="text-white border px-4 py-2"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        borderColor: `${tag.color}50`,
                        color: tag.color
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  </div>

                  {/* Tag Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2 p-2 rounded glass-card">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-500">Uses</p>
                        <p className="text-white font-medium">0</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded glass-card">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-500">Color</p>
                        <p className="text-white font-medium">{tag.color}</p>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-slate-400 text-center">
                    Created {new Date(tag.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={() => setIsModalOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full btn-gradient-pink glow-pink shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
};

export default Tags;
