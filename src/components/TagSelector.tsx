
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
import { Check, Plus, X, Tag } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsChange,
  className
}) => {
  const { tags, createTag } = useTags();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);
    if (isSelected) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      onTagsChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
      setShowNewTagInput(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-slate-300">Tags</Label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              className="flex items-center gap-1 px-2 py-1 text-white border"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: `${tag.color}50`,
                color: tag.color
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
          ))}
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
          <Command className="bg-slate-800">
            <CommandInput 
              placeholder="Search tags..." 
              className="bg-slate-800 text-white placeholder-slate-400"
            />
            <CommandEmpty className="text-slate-400 text-center py-6">
              No tags found.
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => handleTagToggle(tag.id)}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 text-white"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagSelector;
