
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, color: string, font: string) => void;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onAddText }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [font, setFont] = useState('Arial');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddText(text, color, font);
      setText('');
      onClose();
    }
  };
  
  const fontOptions = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 
    'Verdana', 'Impact', 'Comic Sans MS'
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Text</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input 
              id="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font">Font</Label>
            <select 
              id="font"
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {fontOptions.map((fontOption) => (
                <option key={fontOption} value={fontOption}>{fontOption}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex space-x-2">
              <Input 
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10"
              />
              <Input 
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Text
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TextModal;
