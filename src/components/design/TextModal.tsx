
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useText } from '@/context/TextContext';
import { useFont } from '@/context/FontContext';
import { useColor } from '@/context/ColorContext';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, options?: any) => void;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onAddText }) => {
  const [localText, setLocalText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textDecoration, setTextDecoration] = useState('none');
  const [textAlign, setTextAlign] = useState('left');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [shadow, setShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [opacity, setOpacity] = useState(100);
  const { setText } = useText();
  const { selectedFont, setSelectedFont } = useFont();
  const { selectedColor, setSelectedColor } = useColor();

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino', 'Garamond',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
  ];

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
    '#FFD700', '#8B4513', '#FF1493', '#00CED1', '#32CD32'
  ];

  const handleAddText = () => {
    if (localText.trim()) {
      // Clear any existing text from context to prevent duplicates
      setText('');
      
      // Create comprehensive text options
      const textOptions = {
        fontSize,
        fontFamily: selectedFont,
        fill: selectedColor,
        fontWeight,
        textDecoration,
        textAlign,
        charSpacing: letterSpacing,
        lineHeight,
        strokeWidth,
        stroke: strokeWidth > 0 ? strokeColor : undefined,
        shadow: shadow ? {
          color: shadowColor,
          offsetX: 2,
          offsetY: 2,
          blur: 3
        } : undefined,
        opacity: opacity / 100
      };
      
      // Add text to canvas with comprehensive options
      onAddText(localText, textOptions);
      
      // Reset form and close modal
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setLocalText('');
    setFontSize(24);
    setFontWeight('normal');
    setTextDecoration('none');
    setTextAlign('left');
    setLetterSpacing(0);
    setLineHeight(1.2);
    setStrokeWidth(0);
    setShadow(false);
    setOpacity(100);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Text with Advanced Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <Label htmlFor="text-input">Text Content</Label>
            <Input
              id="text-input"
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              placeholder="Enter your text"
              autoFocus
            />
          </div>

          {/* Font Selection */}
          <div>
            <Label htmlFor="font-select">Font Family</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={8}
                max={120}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                  <SelectItem value="bolder">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Decoration and Alignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="text-decoration">Text Decoration</Label>
              <Select value={textDecoration} onValueChange={setTextDecoration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                  <SelectItem value="line-through">Strikethrough</SelectItem>
                  <SelectItem value="overline">Overline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="text-align">Text Alignment</Label>
              <Select value={textAlign} onValueChange={setTextAlign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Letter Spacing and Line Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="letter-spacing">Letter Spacing: {letterSpacing}px</Label>
              <Slider
                value={[letterSpacing]}
                onValueChange={(value) => setLetterSpacing(value[0])}
                min={-5}
                max={20}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="line-height">Line Height: {lineHeight}</Label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={0.8}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Color Selection */}
          <div>
            <Label>Text Color</Label>
            <div className="grid grid-cols-10 gap-2 mt-2 max-h-24 overflow-y-auto">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
            <div className="mt-2">
              <Label htmlFor="custom-color">Custom Color</Label>
              <Input
                id="custom-color"
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Stroke Options */}
          <div>
            <Label htmlFor="stroke-width">Stroke Width: {strokeWidth}px</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
            {strokeWidth > 0 && (
              <div className="mt-2">
                <Label htmlFor="stroke-color">Stroke Color</Label>
                <Input
                  id="stroke-color"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            )}
          </div>

          {/* Shadow and Opacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                />
                <span>Add Shadow</span>
              </Label>
              {shadow && (
                <div className="mt-2">
                  <Label htmlFor="shadow-color">Shadow Color</Label>
                  <Input
                    id="shadow-color"
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="opacity">Opacity: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleAddText} disabled={!localText.trim()} className="flex-1">
              Add Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextModal;
