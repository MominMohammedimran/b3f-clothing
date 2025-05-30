
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, color: string, font: string, fontSize?: number, fontWeight?: string, fontStyle?: string) => void;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onAddText }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState([30]);
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddText(text, color, font, fontSize[0], fontWeight, fontStyle);
      setText('');
      onClose();
    }
  };
  
  const fontOptions = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 
    'Verdana', 'Impact', 'Comic Sans MS', 'Roboto', 'Open Sans'
  ];

  const colorPresets = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
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
            <Label>Font Size: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              max={100}
              min={12}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <select 
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Font Style</Label>
              <select 
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex space-x-2 mb-2">
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
            <div className="grid grid-cols-5 gap-2">
              {colorPresets.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500"
                  style={{ backgroundColor: presetColor }}
                />
              ))}
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
