
import React from 'react';
import { Dialog, DialogContent, DialogDescription,DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, X } from 'lucide-react';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product:Product;
}


const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose,product }) => {
 

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=Check this out: ${product.name} - ₹${product.price} 👉 ${window.location.href}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[420px] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        aria-describedby="share-product-description"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold w-full">Share Product</DialogTitle>
          <DialogDescription className="text-sm text-gray-300 w-full">
            Send this product to friends or copy the link.
          </DialogDescription>
        </DialogHeader>

        {/* Small Image */}
        <div className="flex justify-center mt-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-contain rounded-md border bg-white p-1"
          />
        </div>

        {/* Product Name */}
        <div className="mt-4 text-base font-medium text-center text-white text-xl dark:text-gray-100">
          {product.name}
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            WhatsApp
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;