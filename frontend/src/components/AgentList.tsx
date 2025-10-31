import React from 'react';
import AgentCard from './AgentCard';
import { cn } from '../lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  creator: string;
  views: string;
  avatar: string;
}

interface AgentListProps {
  title: string;
  agents: Agent[];
  showMore?: boolean;
}

const AgentList: React.FC<AgentListProps> = ({ 
  title, agents, showMore = false 
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        {showMore && (
          <button className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1">
            <span>查看更多</span>
            <i className="fas fa-chevron-right text-xs" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentList;