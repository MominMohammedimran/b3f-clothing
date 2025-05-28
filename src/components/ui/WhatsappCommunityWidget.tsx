
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WhatsappCommunityWidget: React.FC = () => {
  const handleJoinCommunity = () => {
    // Open WhatsApp community link in new tab
    window.open('https://chat.whatsapp.com/community-link', '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
      <Button 
        onClick={handleJoinCommunity}
        className="rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center h-12 w-12 md:h-14 md:w-14"
        aria-label="Join our WhatsApp Community"
      >
        <MessageCircle size={24} className="text-white" />
      </Button>
    </div>
  );
};

export default WhatsappCommunityWidget;
