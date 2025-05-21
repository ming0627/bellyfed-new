import React, { useState, useEffect } from 'react';
import { Star, Award, MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

// Types for the ranking data
interface RankingItemProps {
  index: number;
  item: any;
  type: 'dish' | 'reviewer' | 'restaurant';
  isAnimating?: boolean;
}

/**
 * AnimatedRankingItem component displays a single item in the ranking list
 * with animation capabilities for position changes
 */
const AnimatedRankingItem: React.FC<RankingItemProps> = ({
  index,
  item,
  type,
  isAnimating = false,
}) => {
  // State to track animation
  const [animationClass, setAnimationClass] = useState('');

  // Apply animation when isAnimating changes
  useEffect(() => {
    if (isAnimating) {
      // Randomly choose between different animations
      const animationType = Math.floor(Math.random() * 3); // 0, 1, or 2

      switch (animationType) {
        case 0:
          setAnimationClass('animate-slide-up');
          break;
        case 1:
          setAnimationClass('animate-slide-down');
          break;
        case 2:
          setAnimationClass('animate-rank-change');
          break;
        default:
          setAnimationClass('animate-slide-up');
      }

      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Get the appropriate background hover color based on type
  const getHoverBgColor = () => {
    switch (type) {
      case 'dish':
        return 'hover:bg-primary-50 dark:hover:bg-primary-900/10 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30';
      case 'reviewer':
        return 'hover:bg-secondary-50 dark:hover:bg-secondary-900/10 group-hover:bg-secondary-100 dark:group-hover:bg-secondary-900/30';
      case 'restaurant':
        return 'hover:bg-accent-coral-50 dark:hover:bg-accent-coral-900/10 group-hover:bg-accent-coral-100 dark:group-hover:bg-accent-coral-900/30';
      default:
        return 'hover:bg-neutral-50 dark:hover:bg-neutral-900/10';
    }
  };

  // Get the appropriate background color for the ranking number
  const getRankingBgColor = () => {
    switch (type) {
      case 'dish':
        return 'bg-primary-100 dark:bg-primary-900/30';
      case 'reviewer':
        return 'bg-secondary-100 dark:bg-secondary-900/30';
      case 'restaurant':
        return 'bg-accent-coral-100 dark:bg-accent-coral-900/30';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800';
    }
  };

  // Get the appropriate text color for the ranking number
  const getRankingColor = () => {
    switch (type) {
      case 'dish':
        return 'text-primary-700 dark:text-primary-300';
      case 'reviewer':
        return 'text-secondary-700 dark:text-secondary-300';
      case 'restaurant':
        return 'text-accent-coral-700 dark:text-accent-coral-300';
      default:
        return 'text-neutral-700 dark:text-neutral-300';
    }
  };

  // Get the appropriate badge background color
  const getBadgeBgColor = () => {
    switch (type) {
      case 'dish':
        return 'bg-primary-50 dark:bg-primary-900/20';
      case 'reviewer':
        return 'bg-secondary-50 dark:bg-secondary-900/20';
      case 'restaurant':
        return 'bg-accent-coral-50 dark:bg-accent-coral-900/20';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800';
    }
  };

  return (
    <li
      className={`py-3 flex items-center justify-between px-2 rounded-lg transition-all duration-300 group cursor-pointer ${getHoverBgColor()} ${animationClass}`}
    >
      <div className="flex items-center">
        <div className={`${getRankingBgColor()} ${getRankingColor()} font-heading font-bold w-6 h-6 flex items-center justify-center rounded-full text-center group-hover:scale-110 transition-transform shadow-sm`}>
          {index + 1}
        </div>

        {type === 'reviewer' ? (
          <Avatar
            src={item.avatarUrl}
            fallback={item.name.charAt(0)}
            size="sm"
            className="ml-3 mr-3 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all"
          />
        ) : (
          <div className="w-10 h-10 rounded-md overflow-hidden ml-3 mr-3 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
            {item.name}
          </div>
          <div className="text-xs text-neutral-500 truncate">
            {type === 'dish' && item.restaurant}
            {type === 'reviewer' && item.specialty}
            {type === 'restaurant' && `${item.cuisine} • ${item.priceRange}`}
          </div>
        </div>
      </div>

      {(type === 'dish' || type === 'restaurant') ? (
        <div className={`flex items-center ml-2 flex-shrink-0 ${getBadgeBgColor()} px-2 py-1 rounded-full transition-colors`}>
          <Star className="w-3.5 h-3.5 text-accent-gold-500 mr-1" />
          <span className="text-sm font-medium">{item.rating}</span>
        </div>
      ) : (
        <div className={`text-sm font-medium ${getRankingColor()} flex-shrink-0 ml-2 ${getBadgeBgColor()} px-2 py-1 rounded-full transition-colors`}>
          {item.reviewCount} <span className="text-xs text-neutral-500">reviews</span>
        </div>
      )}
    </li>
  );
};

export default AnimatedRankingItem;
