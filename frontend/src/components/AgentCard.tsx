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
  externalUrl?: string;
}

const AgentCard: React.FC<AgentProps> = ({ 
  id, name, description, creator, views, avatar, externalUrl
}) => {
  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (externalUrl) {
      e.preventDefault(); // 阻止默认的Link行为
      window.open(externalUrl, '_blank', 'noopener,noreferrer'); // 打开新窗口
    }
  };

  return (
    <Link 
      to={externalUrl ? "#" : `/user-space/${id}`}
      onClick={handleClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700",
        externalUrl ? "cursor-pointer" : ""
      )}
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
        
        {/* 显示外部链接图标 */}
        {externalUrl && (
          <div className="absolute top-2 right-2">
            <i className="fas fa-external-link-alt text-gray-400 text-xs"></i>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AgentCard;