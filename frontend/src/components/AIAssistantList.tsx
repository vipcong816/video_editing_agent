import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';

interface Assistant {
  id: string;
  name: string;
  avatar: string;
}

interface AIAssistantListProps {
  assistants: Assistant[];
}

const AIAssistantList: React.FC<AIAssistantListProps> = ({ assistants }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const handleAssistantClick = (id: string) => {
    // 导航到聊天页面
    navigate(`/user-space/${id}`);
  };
  
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
      {assistants.map((assistant) => {
        return (
          <button
            key={assistant.id}
            onClick={() => handleAssistantClick(assistant.id)}
            className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            title="开始对话"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={assistant.avatar} 
                alt={assistant.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">{assistant.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AIAssistantList;