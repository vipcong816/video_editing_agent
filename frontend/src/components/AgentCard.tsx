import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface AgentProps {
  id: string;
  name: string;
  description: string;
  creator: string;
  views: string;
  avatar: string;
}

const AgentCard: React.FC<AgentProps> = ({ 
  id, name, description, creator, views, avatar
}) => {
  return (
    <Link 
      to={`/user-space/${id}`}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-gray-100 dark:border-gray-700">
          <img 
            src={avatar || `https://via.placeholder.com/64?text=${name.charAt(0)}`} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">{name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 h-10">{description}</p>
        <div className="flex justify-between w-full text-xs text-gray-400">
          <span>{creator}</span>
          <span>{views}</span>
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;