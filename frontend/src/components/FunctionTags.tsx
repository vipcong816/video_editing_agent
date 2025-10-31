import React from 'react';
import { cn } from '../lib/utils';

interface FunctionTagsProps {
  tags: string[];
}

const FunctionTags: React.FC<FunctionTagsProps> = ({ tags }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {tags.map((tag, index) => (
        <button
          key={index}
          className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-sm py-2 px-3 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default FunctionTags;