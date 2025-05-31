import React, { memo } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Trophy, Utensils } from 'lucide-react';

// Note: framer-motion is not available in current project, using CSS transitions instead
// import { motion } from 'framer-motion';

/**
 * TopFoodies component displays three ranking cards for reviewers, dishes, and locations
 * Migrated from old-packages with enhanced visual design and animations
 */

const TopFoodies = memo(function TopFoodies({
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

  return (
    <section className="py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Top Foodies</h2>
          <p className="text-gray-500 mt-1">
            Meet our most active food enthusiasts and their discoveries
          </p>
        </div>
        <Link
          href={getCountryLink('/ranking')}
          className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View all rankings
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Reviewers */}
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg p-6">
          <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Top {countryName} Reviewers
          </h3>
          <div className="space-y-3">
            {reviewers.map((user, index) => (
              <div
                key={user.name}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  user.highlight
                    ? 'bg-gradient-to-r from-orange-100/50 to-transparent'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    user.highlight
                      ? 'bg-orange-200 text-orange-700'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold transition-colors ${
                        user.highlight ? 'text-orange-700' : 'text-gray-900'
                      }`}
                    >
                      {user.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                        user.highlight
                          ? 'bg-orange-200 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.badge}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium transition-colors ${
                      user.highlight ? 'text-orange-700' : 'text-gray-500'
                    }`}
                  >
                    {user.reviews} reviews
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Dishes */}
        <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-yellow-500" />
            Trending {countryName} Dishes
          </h3>
          <div className="space-y-3">
            {dishes.map((item, index) => (
              <div
                key={item.dish}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  item.highlight
                    ? 'bg-gradient-to-r from-amber-100/50 to-transparent'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    item.highlight
                      ? 'bg-amber-200 text-amber-700'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold transition-colors ${
                        item.highlight ? 'text-amber-700' : 'text-gray-900'
                      }`}
                    >
                      {item.dish}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                        item.highlight
                          ? 'bg-amber-200 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.trend}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium transition-colors ${
                      item.highlight ? 'text-amber-700' : 'text-gray-500'
                    }`}
                  >
                    {item.votes} votes this week
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Locations */}
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Popular Areas in {countryName}
          </h3>
          <div className="space-y-3">
            {locations.map((location, index) => (
              <div
                key={location.area}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  location.highlight
                    ? 'bg-gradient-to-r from-sky-100/50 to-transparent'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    location.highlight
                      ? 'bg-sky-200 text-sky-700'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold transition-colors ${
                        location.highlight ? 'text-sky-700' : 'text-gray-900'
                      }`}
                    >
                      {location.area}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                        location.highlight
                          ? 'bg-sky-200 text-sky-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {location.new}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium transition-colors ${
                      location.highlight ? 'text-sky-700' : 'text-gray-500'
                    }`}
                  >
                    {location.restaurants} restaurants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default TopFoodies;
