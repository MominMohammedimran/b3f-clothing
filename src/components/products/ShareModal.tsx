
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, X } from 'lucide-react';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product:Product;
}


const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, product }) => {
  const currentUrl = window.location.href;
  const shareText = `Check out this amazing product: ${product.name} - ₹${product.price}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-md" aria-describedby="share-product-description">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2">
      <Share className="h-5 w-5" />
      Share Product
    </DialogTitle>
  </DialogHeader>

  {/* 👇 This section provides the description */}
  <div id="share-product-description" className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border shadow-sm">
    <div className="w-16 h-16 flex items-center justify-center bg-white border rounded-md overflow-hidden">
      <img
        src={product.image || '/placeholder.svg'}
        alt={product.name}
        className="w-full h-full object-contain"
      />
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-sm text-gray-800">{product.name}</h4>
      <p className="text-blue-600 font-medium text-sm">₹{product.price}</p>
      <p className="text-[11px] text-gray-500 truncate">{window.location.href}</p>
    </div>
  </div>

  {/* Share buttons follow here */}
  <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </Button>

            

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copy Link
            </Button>

           
          </div>
</DialogContent>

    </Dialog>
  );
};

export default ShareModal;