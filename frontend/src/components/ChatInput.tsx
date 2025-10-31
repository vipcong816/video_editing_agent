import React from 'react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };
  
  const handleSend = () => {
    onSend(value);
  };
  
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="给我布置一个任务（可以让我写文章、做PPT、做摘要...）"
        className="w-full h-24 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
      />
      
      <div className="absolute bottom-4 left-4 flex gap-4">
        <button className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 text-sm font-medium">
          简化
        </button>
        <button className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 text-sm font-medium">
          扩展
        </button>
        <button className="text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 text-sm font-medium flex items-center gap-1">
          <span>自动</span>
          <i className="fas fa-chevron-down text-xs" />
        </button>
      </div>
      
      <button
        onClick={handleSend}
        disabled={!value.trim()}
        className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${
          value.trim() 
            ? 'bg-purple-500 text-white hover:bg-purple-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } transition-colors`}
      >
        <i className="fas fa-paper-plane" />
      </button>
    </div>
  );
};

export default ChatInput;