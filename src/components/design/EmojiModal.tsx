
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EmojiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmoji: (emoji: string, fontSize?: number) => void;
}

// Basic emoji set
const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘']
  },
  {
    name: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧']
  },
  {
    name: 'Food & Drink',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆']
  },
  {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏']
  },
  {
    name: 'Travel & Places',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️']
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷']
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘']
  }
];

const EmojiModal = ({ isOpen, onClose, onAddEmoji }: EmojiModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EMOJI_CATEGORIES[0].name);
  const [fontSize, setFontSize] = useState([60]);
  
  const filteredEmojis = searchTerm
    ? EMOJI_CATEGORIES.flatMap(category => category.emojis).filter(emoji => emoji.includes(searchTerm))
    : EMOJI_CATEGORIES.find(category => category.name === selectedCategory)?.emojis || [];
  
  const handleEmojiClick = (emoji: string) => {
    onAddEmoji(emoji, fontSize[0]);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Emoji</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="space-y-2">
            <Label>Emoji Size: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              max={120}
              min={20}
              step={5}
              className="w-full"
            />
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {!searchTerm && (
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {EMOJI_CATEGORIES.map(category => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="whitespace-nowrap text-xs"
                >
                  {category.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2 pr-2">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors aspect-square flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
              
              {filteredEmojis.length === 0 && (
                <div className="col-span-6 flex items-center justify-center h-32 text-gray-500">
                  No emojis found
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmojiModal;
