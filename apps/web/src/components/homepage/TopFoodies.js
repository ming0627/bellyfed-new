import React, { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Utensils, MapPin } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * RankingCard component for displaying a ranked list of items
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.viewAllLink - Link for "View All" button
 * @param {string} props.viewAllLabel - Accessible label for "View All" button
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.gradientFrom - Starting gradient color
 * @param {string} props.gradientTo - Ending gradient color
 * @param {Array} props.items - Array of items to display
 * @param {string} props.itemValueLabel - Label for the item value (e.g., "reviews", "votes")
 * @param {string} props.highlightClass - CSS class for highlighted items
 * @returns {JSX.Element} - Rendered component
 */
const RankingCard = memo(function RankingCard({
  title,
  viewAllLink,
  viewAllLabel,
  icon,
  gradientFrom,
  gradientTo,
  items,
  itemValueLabel,
  highlightClass,
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div
        className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} px-4 py-3 text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <LucideClientIcon
              icon={icon}
              className="w-5 h-5 mr-2"
              aria-hidden="true"
            />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <Link
            href={viewAllLink}
            className={`text-sm text-${gradientFrom}-100 hover:text-white flex items-center`}
            aria-label={viewAllLabel}
          >
            View All
            <LucideClientIcon
              icon={ArrowRight}
              className="w-4 h-4 ml-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
      <div className="p-4">
        <ul className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className={`py-3 flex items-center justify-between ${
                item.highlight ? `animate-pulse ${highlightClass}` : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-gray-500 text-sm w-5">{index + 1}</span>
                <span className="ml-3 font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-gray-900 font-semibold">
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString()
                    : item.value}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  {itemValueLabel}
                </span>
                {item.trend && (
                  <span className="ml-2 text-xs text-green-600">
                    {item.trend}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

/**
 * TopFoodies component displays three ranking cards for reviewers, dishes, and locations
 *
 * @param {Object} props - Component props
 * @param {Array} props.reviewers - Array of reviewer objects
 * @param {Array} props.dishes - Array of dish objects
 * @param {Array} props.locations - Array of location objects
 * @param {string} props.countryName - Name of the current country
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
export const TopFoodies = memo(function TopFoodies({
  reviewers,
  dishes,
  locations,
  countryName,
  getCountryLink,
}) {
  // Validate required props
  if (
    !reviewers ||
    !dishes ||
    !locations ||
    !countryName ||
    typeof getCountryLink !== 'function'
  ) {
    console.error('TopFoodies component missing required props');
    return null;
  }

  // Transform reviewers data for the RankingCard component
  const reviewersData = reviewers.map(reviewer => ({
    ...reviewer,
    value: reviewer.reviews,
  }));

  // Transform dishes data for the RankingCard component
  const dishesData = dishes.map(dish => ({
    ...dish,
    value: dish.votes,
  }));

  // Transform locations data for the RankingCard component
  const locationsData = locations.map(location => ({
    ...location,
    value: location.restaurants,
    trend: location.new,
  }));

  return (
    <section className="mb-12" aria-labelledby="top-foodies-heading">
      <h2 id="top-foodies-heading" className="sr-only">
        Top Food Statistics in {countryName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Reviewers */}
        <RankingCard
          title={`Top Reviewers in ${countryName}`}
          viewAllLink={getCountryLink('/social')}
          viewAllLabel={`View all top reviewers in ${countryName}`}
          icon={Trophy}
          gradientFrom="blue-600"
          gradientTo="blue-700"
          items={reviewersData}
          itemValueLabel="reviews"
          highlightClass="bg-blue-50"
        />

        {/* Top Dishes */}
        <RankingCard
          title={`Top Dishes in ${countryName}`}
          viewAllLink={getCountryLink('/dish-restaurants')}
          viewAllLabel={`View all top dishes in ${countryName}`}
          icon={Utensils}
          gradientFrom="orange-500"
          gradientTo="orange-600"
          items={dishesData}
          itemValueLabel="votes"
          highlightClass="bg-orange-50"
        />

        {/* Top Locations */}
        <RankingCard
          title={`Top Areas in ${countryName}`}
          viewAllLink={getCountryLink('/restaurants')}
          viewAllLabel={`View all top areas in ${countryName}`}
          icon={MapPin}
          gradientFrom="green-600"
          gradientTo="green-700"
          items={locationsData}
          itemValueLabel="restaurants"
          highlightClass="bg-green-50"
        />
      </div>
    </section>
  );
});

// Default export for easier imports
export default TopFoodies;
