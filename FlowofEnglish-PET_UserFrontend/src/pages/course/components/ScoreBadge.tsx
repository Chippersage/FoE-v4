import React from 'react';
import { Trophy } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
  total: number;
  onClick?: () => void;
  isMobile?: boolean;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ 
  score, 
  total, 
  onClick,
  isMobile = false 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`
        bg-gradient-to-r from-blue-50 to-indigo-50 
        border border-blue-200 
        text-blue-800 
        hover:from-blue-100 hover:to-indigo-100 
        active:from-blue-200 active:to-indigo-200
        ${isMobile ? 'px-3 py-2' : 'px-3.5 py-2'}
        rounded-lg 
        text-sm 
        font-medium 
        transition-all 
        duration-200 
        cursor-pointer 
        flex 
        items-center 
        gap-2
        shadow-sm
        hover:shadow
        min-h-[40px]
      `}
    >
      <Trophy className="w-4 h-4" />
      <span>Score</span>
      <span className="font-bold text-blue-900">
        {score}/{total}
      </span>
    </div>
  );
};

export default ScoreBadge;