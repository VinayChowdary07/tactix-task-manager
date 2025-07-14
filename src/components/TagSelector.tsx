
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, Plus, X, Tag, Loader2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds = [],
  onTagsChange,
  className
}) => {
  const { tags, createTag, isLoading, error } = useTags();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  // Ensure we have safe arrays with proper defaults
  const safeSelectedTagIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  
  // Only get selected tags if tags array is loaded and valid
  const selectedTags = safeTags.filter(tag => tag && tag.id && safeSelectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    if (!tagId) return;
    
    const isSelected = safeSelectedTagIds.includes(tagId);
    if (isSelected) {
      onTagsChange(safeSelectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...safeSelectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      if (newTag?.id) {
        onTagsChange([...safeSelectedTagIds, newTag.id]);
      }
      setNewTagName('');
      setShowNewTagInput(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const removeTag = (tagId: string) => {
    if (!tagId) return;
    onTagsChange(safeSelectedTagIds.filter(id => id !== tagId));
  };

  // Show loading state if tags are still loading
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-slate-300">Tags</Label>
        <div className="flex items-center justify-center p-4 bg-slate-800/50 border border-slate-600 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400 mr-2" />
          <span className="text-slate-400 text-sm">Loading tags...</span>
        </div>
      </div>
    );
  }

  // Show error state if tags failed to load
  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-slate-300">Tags</Label>
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md">
          <span className="text-red-400 text-sm">Failed to load tags. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-slate-300">Tags</Label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => {
            if (!tag || !tag.id) return null;
            
            return (
              <Badge
                key={tag.id}
                className="flex items-center gap-1 px-2 py-1 text-white border"
                style={{
                  backgroundColor: `${tag.color || '#6366f1'}20`,
                  borderColor: `${tag.color || '#6366f1'}50`,
                  color: tag.color || '#6366f1'
                }}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
          >
            <Tag className="w-4 h-4 mr-2" />
            {selectedTags.length > 0 
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
              : "Select tags..."
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-600">
          {/* Only render Command if we have valid data */}
          {safeTags && (
            <Command className="bg-slate-800" shouldFilter={true}>
              <CommandInput 
                placeholder="Search tags..." 
                className="bg-slate-800 text-white placeholder-slate-400"
              />
              <CommandEmpty className="text-slate-400 text-center py-6">
                No tags found.
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {safeTags.length > 0 ? safeTags.map((tag) => {
                  if (!tag || !tag.id || !tag.name) return null;
                  
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleTagToggle(tag.id)}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 text-white"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color || '#6366f1' }}
                      />
                      <span className="flex-1">{tag.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          safeSelectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                }) : (
                  <div className="text-slate-400 text-center py-4 text-sm">
                    No tags available
                  </div>
                )}
              </CommandGroup>
              
              {/* Create New Tag Section */}
              <div className="border-t border-slate-600 p-2">
                {!showNewTagInput ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                    onClick={() => setShowNewTagInput(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create new tag
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTag();
                        } else if (e.key === 'Escape') {
                          setShowNewTagInput(false);
                          setNewTagName('');
                        }
                      }}
                      className="flex-1 bg-slate-700 border-slate-600 text-white"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || createTag.isPending}
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagSelector;
