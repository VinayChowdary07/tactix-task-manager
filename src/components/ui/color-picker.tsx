
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PREDEFINED_COLORS = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

interface ColorPickerProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor = '#6366f1',
  onColorChange,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {PREDEFINED_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          className={cn(
            "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center",
            selectedColor === color.value
              ? "border-white shadow-lg scale-110"
              : "border-slate-600/50 hover:border-slate-400"
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => onColorChange(color.value)}
          title={color.name}
        >
          {selectedColor === color.value && (
            <Check className="w-4 h-4 text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  );
};
