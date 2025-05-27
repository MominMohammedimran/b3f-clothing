
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface PaletteResultProps {
  palette: string[];
  onTryAnother: () => void;
  themeSnippet?: string;
}

export default function PaletteResult({
  palette,
  onTryAnother,
  themeSnippet = "",
}: PaletteResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(themeSnippet);
    setCopied(true);
    toast("Palette copied!", {
      description: "The design theme code is now copied. Paste it into your project."
    });
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="mt-8 flex flex-col items-center animate-fadeIn gap-6">
      <h2 className="text-2xl font-playfair font-bold mb-2 text-primaryPurple tracking-tight">
        🎨 Your Dream Design Palette
      </h2>
      <div className="flex gap-4 mb-2">
        {palette.map(c => (
          <div
            key={c}
            className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-white"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
      <div className="rounded-lg bg-gray-100 font-mono px-4 py-2 text-sm text-gray-600 border border-gray-200 mb-2">
        {themeSnippet ? (
          <pre className="whitespace-pre">{themeSnippet}</pre>
        ) : (
          <span className="italic">/* Your Tailwind/CSS code here */</span>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-1"
          onClick={handleCopy}
        >
          <Copy className="w-4 h-4 mr-1" />
          {copied ? "Copied!" : "Copy Code"}
        </Button>
        <Button variant="ghost" onClick={onTryAnother}>
          Try another photo
        </Button>
      </div>
    </div>
  );
}
