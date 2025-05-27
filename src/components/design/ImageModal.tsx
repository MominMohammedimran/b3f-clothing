
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (imageUrl: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onAddImage }) => {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddImage(url);
      setUrl('');
      onClose();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = () => {
    if (previewUrl) {
      onAddImage(previewUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };
  
  const sampleImages = [
    '/lovable-uploads/sample1.jpg',
    '/lovable-uploads/sample2.jpg',
    '/lovable-uploads/sample3.jpg',
    '/lovable-uploads/sample4.jpg',
  ];
  
  const handleSampleClick = (imageSrc: string) => {
    onAddImage(imageSrc);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
            <TabsTrigger value="sample">Sample Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-40 object-contain mb-4"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                    <Button onClick={handleUpload}>Use This Image</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload an image</p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              {url && (
                <div className="flex justify-center my-4">
                  <img 
                    src={url} 
                    alt="Preview" 
                    className="max-h-40 object-contain" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!url.trim()}>
                  Add Image
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="sample">
            <div className="grid grid-cols-2 gap-4">
              {sampleImages.map((img, idx) => (
                <div 
                  key={idx}
                  className="border rounded-md overflow-hidden cursor-pointer hover:border-blue-500"
                  onClick={() => handleSampleClick(img)}
                >
                  <img 
                    src={img} 
                    alt={`Sample ${idx + 1}`} 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Not+Found';
                    }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
