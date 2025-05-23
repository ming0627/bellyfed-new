/**
 * RankingCard Component
 *
 * A versatile card component for displaying ranking information.
 * It can be used to display rankings for dishes, restaurants, reviewers, etc.
 *
 * Features:
 * - Customizable header with title and icon
 * - Gradient background options
 * - Ranking list with position indicators
 * - Support for various item types (dishes, restaurants, reviewers)
 * - Trend indicators (up, down, new)
 * - View all link
 */

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Award, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import { Avatar } from '../ui/Avatar.tsx';

/**
 * RankingCard component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.viewAllLink - Link for "View All" button
 * @param {string} props.viewAllLabel - Accessible label for "View All" button
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.gradientFrom - Starting gradient color (e.g., "blue-600")
 * @param {string} props.gradientTo - Ending gradient color (e.g., "blue-700")
 * @param {Array} props.items - Array of items to display
 * @param {string} props.itemValueLabel - Label for the item value (e.g., "reviews", "votes")
 * @param {string} props.highlightClass - CSS class for highlighted items
 * @param {string} props.type - Type of items being ranked ("dish", "restaurant", "reviewer", "location")
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const RankingCard = memo(function RankingCard({
  title,
  viewAllLink,
  viewAllLabel,
  icon,
  gradientFrom = 'orange-500',
  gradientTo = 'orange-600',
  items = [],
  itemValueLabel = 'votes',
  highlightClass = 'bg-orange-50 dark:bg-orange-900/20',
  type = 'dish',
  getCountryLink = (path) => path,
  className = '',
}) {
  // Return null if no items are provided
  if (!items || items.length === 0) {
    return null;
  }

  // Get trend icon based on trend value
  const getTrendIcon = (trend) => {
    if (!trend) return null;

    if (trend === 'up') {
      return (
        <LucideClientIcon
          icon={TrendingUp}
          className="w-4 h-4 text-green-500 ml-1"
          aria-label="Trending up"
        />
      );
    } else if (trend === 'down') {
      return (
        <LucideClientIcon
          icon={TrendingDown}
          className="w-4 h-4 text-red-500 ml-1"
          aria-label="Trending down"
        />
      );
    } else if (trend === 'new') {
      return (
        <LucideClientIcon
          icon={Sparkles}
          className="w-4 h-4 text-yellow-500 ml-1"
          aria-label="New"
        />
      );
    }

    return null;
  };

  // Get rank badge for top positions
  const getRankBadge = (position) => {
    if (position === 1) {
      return (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-yellow-500 text-white rounded-full shadow-md">
          <LucideClientIcon icon={Award} className="w-4 h-4" />
        </span>
      );
    } else if (position === 2) {
      return (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-gray-400 text-white rounded-full shadow-md">
          <LucideClientIcon icon={Award} className="w-4 h-4" />
        </span>
      );
    } else if (position === 3) {
      return (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-amber-700 text-white rounded-full shadow-md">
          <LucideClientIcon icon={Award} className="w-4 h-4" />
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white p-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {icon && (
              <LucideClientIcon
                icon={icon}
                className="w-5 h-5 mr-2"
                aria-hidden="true"
              />
            )}
            <h3 className="font-bold text-lg">{title}</h3>
          </div>

          {viewAllLink && (
            <Link
              href={getCountryLink(viewAllLink)}
              className="text-white/90 hover:text-white flex items-center text-sm font-medium transition-colors"
              aria-label={viewAllLabel || `View all ${title}`}
            >
              View All
              <LucideClientIcon
                icon={ChevronRight}
                className="w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>

      {/* Ranking List */}
      <div className="p-4">
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.id || `ranking-item-${index}`}>
              <Link
                href={getCountryLink(`/${type === 'reviewer' ? 'profile' : type === 'location' ? 'restaurants' : type}/${item.id || item.slug}`)}
                className={`flex items-center p-2 rounded-lg hover:${highlightClass} transition-colors relative`}
              >
                {/* Position Number */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${index < 3 ? `bg-${gradientFrom}/10 text-${gradientFrom}` : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} font-bold mr-3`}>
                  {index + 1}
                </div>

                {/* Item Image/Avatar */}
                {type === 'reviewer' ? (
                  <div className="relative w-10 h-10 mr-3">
                    <Avatar
                      src={item.avatarUrl || item.imageUrl}
                      fallback={item.name}
                      size="md"
                      className="shadow-sm"
                    />
                    {getRankBadge(index + 1)}
                  </div>
                ) : (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 shadow-sm">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={40}
                        height={40}
                        objectFit="cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    {getRankBadge(index + 1)}
                  </div>
                )}

                {/* Item Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    {getTrendIcon(item.trend)}
                  </div>

                  {type === 'dish' && item.restaurant && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.restaurant}
                    </p>
                  )}

                  {type === 'restaurant' && item.cuisine && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.cuisine}
                    </p>
                  )}

                  {type === 'reviewer' && item.specialty && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.specialty}
                    </p>
                  )}

                  {type === 'location' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.region || item.city || item.area}
                    </p>
                  )}
                </div>

                {/* Item Value/Rating */}
                <div className="ml-2 flex items-center">
                  {(type === 'dish' || type === 'restaurant') && item.rating ? (
                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-full text-sm">
                      <LucideClientIcon icon={Star} className="w-3.5 h-3.5 mr-1" />
                      <span>{typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}</span>
                      {item.value && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({item.value} {itemValueLabel})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {item.value} {itemValueLabel}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default RankingCard;
