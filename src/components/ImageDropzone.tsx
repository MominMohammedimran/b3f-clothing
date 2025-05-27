
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImageDropzoneProps {
  onImageSelected: (file: File, previewUrl: string) => void;
}

export default function ImageDropzone({ onImageSelected }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Reset preview if picked again
  const handleFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(file, url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file!);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <label
      htmlFor="upload"
      className={cn(
        "block cursor-pointer w-full max-w-md mx-auto rounded-2xl border-2 border-dashed border-primaryPurple bg-white/70 py-12 px-5 shadow-md transition-all duration-300",
        isDragging ? "bg-primaryPurple/20 border-magentaPink scale-[1.02]" : "hover:bg-magentaPink/10"
      )}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      tabIndex={0}
      aria-label="Upload image"
    >
      <input
        id="upload"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-center space-y-3">
        {preview ? (
          <img
            src={preview}
            alt="Selected Preview"
            className="rounded-xl max-h-52 shadow-lg object-contain transition-all"
            style={{ background: "#F1F0FB" }}
          />
        ) : (
          <div className="flex flex-col items-center text-primaryPurple animate-fadeIn">
            <ImageIcon className="w-12 h-12 mb-2 stroke-2 opacity-80" />
            <span className="font-semibold text-xl font-playfair mb-1">Drop your picture here</span>
            <span className="font-inter text-gray-500 text-sm">(or click to select)</span>
          </div>
        )}
      </div>
    </label>
  );
}
