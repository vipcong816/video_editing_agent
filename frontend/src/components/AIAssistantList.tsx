import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
  import { getAgentConfigById } from '../lib/agentConfig';
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
      // 检查是否是外部链接智能体
      const agentConfig = getAgentConfigById(id);
    
      if (agentConfig && agentConfig.externalUrl) {
      // 打开外部链接
      window.open(agentConfig.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 导航到聊天页面
      navigate(`/user-space/${id}`);
    }
  };
  
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
      {assistants.map((assistant) => {
      // 检查是否是外部链接智能体
      const agentConfig = getAgentConfigById(assistant.id);
      const isExternal = agentConfig?.externalUrl !== undefined;
        
        return (
          <button
            key={assistant.id}
            onClick={() => handleAssistantClick(assistant.id)}
            className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            title={isExternal ? "在新窗口打开外部平台" : "开始对话"}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={assistant.avatar} 
                alt={assistant.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-white">{assistant.name}</span>
            
            {/* 外部链接智能体显示图标 */}
            {isExternal && (
              <i className="fas fa-external-link-alt text-gray-400 text-xs ml-1"></i>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AIAssistantList;