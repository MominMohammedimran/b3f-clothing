
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Trash2 } from 'lucide-react';

interface CanvasControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex justify-self-center gap-2 mb-4">
          <h3 className="text-s font-semibold text-gray-800 mb-4"> Canvas</h3>
      

    
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1"
      >
        <Undo size={14} />
        Undo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-1"
      >
        <Redo size={14} />
        Redo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="flex items-center gap-1 text-red-600 hover:text-red-700"
      >
        <Trash2 size={14} />
        Clear
      </Button>
    </div>
  );
};

export default CanvasControls;
