import React, { memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Utensils, MapPin, RefreshCw } from 'lucide-react';
import { useCountry } from '../../contexts/CountryContext.js';

/**
 * RankingCard component for displaying a ranked list of items with modern design
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

  // Get the appropriate gradient classes based on the color
  const getGradientClasses = () => {
    switch (gradientFrom) {
      case 'blue-600':
        return 'bg-gradient-to-r from-info to-blue-600';
      case 'orange-500':
        return 'bg-gradient-primary';
      case 'green-600':
        return 'bg-gradient-to-r from-success to-green-600';
      default:
        return 'bg-gradient-primary';
    }
  };

  const getBadgeClasses = () => {
    switch (gradientFrom) {
      case 'blue-600':
        return 'bg-blue-50 text-info border-blue-200';
      case 'orange-500':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'green-600':
        return 'bg-green-50 text-success border-green-200';
      default:
        return 'bg-primary-50 text-primary-700 border-primary-200';
    }
  };

  const getRankingClasses = (index) => {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm';
    switch (gradientFrom) {
      case 'blue-600':
        return `${baseClasses} bg-gradient-to-br from-blue-400 to-info`;
      case 'orange-500':
        return `${baseClasses} bg-gradient-primary`;
      case 'green-600':
        return `${baseClasses} bg-gradient-to-br from-green-400 to-success`;
      default:
        return `${baseClasses} bg-gradient-primary`;
    }
  };

  return (
    <div className="group relative">
      {/* Modern card with glassmorphism effect */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-primary-200/50 transform hover:-translate-y-1">
        {/* Enhanced gradient header */}
        <div className={`bg-gradient-to-r ${getGradientClasses()} px-6 py-4 relative overflow-hidden`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <iconclassName="w-5 h-5 text-white"
                  aria-hidden="true"
                 />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
            </div>
            <Link
              href={viewAllLink}
              className="group/link flex items-center space-x-1 text-white/90 hover:text-white transition-colors duration-200 text-sm font-medium"
              aria-label={viewAllLabel}
            >
              <span>View All</span>
              <ArrowRightclassName="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-200"
                aria-hidden="true"
               />
            </Link>
          </div>
        </div>

        {/* Enhanced content area */}
        <div className="p-6">
          <ul className="space-y-3">
            {items.slice(0, 5).map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className={`group/item flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:bg-gray-50/80 ${
                  item.highlight
                    ? `animate-pulse ${highlightClass} ring-2 ring-orange-200 bg-orange-50/50`
                    : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Enhanced ranking number */}
                  <div className={getRankingClasses(index)}>
                    {index + 1}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-900 group-hover/item:text-neutral-700 transition-colors">
                      {item.name}
                    </span>
                    {item.badges && item.badges.length > 0 && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-neutral-500 mr-1">{item.badges[0].icon}</span>
                        <span className="text-xs text-neutral-600">{item.badges[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-neutral-900 text-lg">
                      {typeof item.value === 'number'
                        ? item.value.toLocaleString()
                        : item.value}
                    </span>
                    <span className="text-neutral-500 text-sm font-medium">
                      {itemValueLabel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getBadgeClasses()}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.trend && (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        {item.trend}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
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
const TopFoodies = memo(function TopFoodies({
  reviewers,
  dishes,
  locations,
  countryName,
  getCountryLink,
}) {
  const { updateRankingData } = useCountry();

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
    <section className="mb-16" aria-labelledby="top-foodies-heading">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Discover Food Excellence in{' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {countryName}
          </span>
        </h1>
        <p className="text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
          Join our vibrant community of food lovers and discover the best dishes,
          top reviewers, and trending restaurants in your area.
        </p>

        {/* Live Stats */}
        <div className="flex justify-center items-center mt-8 space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {reviewersData.reduce((sum, r) => sum + r.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 font-medium">Total Reviews</div>
          </div>
          <div className="w-px h-8 bg-neutral-300"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {dishesData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 font-medium">Dish Votes</div>
          </div>
          <div className="w-px h-8 bg-neutral-300"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {locationsData.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 font-medium">Restaurants</div>
          </div>
        </div>

        {/* Live Update Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={updateRankingData}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:bg-gradient-primary-hover transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <RefreshCwclassName="w-4 h-4"  />
            <span>Update Rankings</span>
          </button>
        </div>
      </div>

      <h2 id="top-foodies-heading" className="sr-only">
        Top Food Statistics in {countryName}
      </h2>

      {/* Enhanced grid with better spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Reviewers */}
        <RankingCard
          title={`Top Reviewers`}
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
          title={`Trending Dishes`}
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
          title={`Hot Spots`}
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

export default TopFoodies;
