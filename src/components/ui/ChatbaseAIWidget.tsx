import React, { useState } from 'react';
import { BotMessageSquare } from 'lucide-react';

const ChatbaseAIWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Chatbase AI Chatbot" : "Open Chatbase AI Chatbot"}
          className="flex flex-col items-center justify-center rounded-full bg-[#2f7df1] hover:bg-[#2E67D7] shadow-lg p-3 w-16 h-16 text-white font-semibold focus:outline-none"
        >
          <BotMessageSquare size={45} className="mb-0.5" />
          <span className="text-xs leading-tight select-none"> A I</span>
        </button>
      </div>

      {/* Chatbot iframe popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-8 w-[360px] h-[600px] z-40 shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/WOyJJ_Tgby5tFUvlnbcYY"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            frameBorder="0"
            title="Chatbase AI Chatbot"
          />
        </div>
      )}
    </>
  );
};

export default ChatbaseAIWidget;
