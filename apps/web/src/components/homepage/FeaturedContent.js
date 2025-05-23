import React, { memo } from 'react';
import Link from 'next/link';
import { Star, Award, TrendingUp, Users, ArrowRight, Calendar } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * FeaturedContent component displays highlighted content and community picks
 *
 * @param {Object} props - Component props
 * @param {string} props.countryName - Name of the current country
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const FeaturedContent = memo(function FeaturedContent({ countryName, getCountryLink }) {
  // Mock featured content data
  const featuredItems = [
    {
      id: '1',
      type: 'restaurant-of-week',
      title: 'Restaurant of the Week',
      subtitle: 'Community Choice',
      name: 'Sakura Sushi Bar',
      description: 'Authentic Japanese cuisine with the freshest ingredients and traditional preparation methods.',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&h=300&fit=crop',
      rating: 4.9,
      reviewCount: 234,
      badge: 'Editor\'s Pick',
      link: '/restaurant/sakura-sushi-bar',
      stats: {
        label: 'Weekly Votes',
        value: '1,247'
      }
    },
    {
      id: '2',
      type: 'trending-dish',
      title: 'Trending This Week',
      subtitle: 'Most Voted Dish',
      name: 'Truffle Ramen',
      description: 'Rich tonkotsu broth elevated with premium truffle oil and seasonal vegetables.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&h=300&fit=crop',
      rating: 4.8,
      reviewCount: 156,
      badge: 'Trending',
      link: '/dish/truffle-ramen',
      stats: {
        label: 'Votes This Week',
        value: '892'
      }
    },
    {
      id: '3',
      type: 'community-challenge',
      title: 'Community Challenge',
      subtitle: 'Join the Fun',
      name: 'Street Food Safari',
      description: 'Discover and review 5 different street food vendors this month to earn exclusive badges.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&h=300&fit=crop',
      badge: 'Active',
      link: '/challenges/street-food-safari',
      stats: {
        label: 'Participants',
        value: '1,523'
      },
      endDate: '2024-01-31'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'restaurant-of-week':
        return Award;
      case 'trending-dish':
        return TrendingUp;
      case 'community-challenge':
        return Users;
      default:
        return Star;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'restaurant-of-week':
        return 'from-purple-400 to-purple-500';
      case 'trending-dish':
        return 'from-orange-400 to-orange-500';
      case 'community-challenge':
        return 'from-blue-400 to-blue-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Editor\'s Pick':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Trending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          Featured in{' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {countryName}
          </span>
        </h2>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
          Discover what's trending, community favorites, and exciting challenges happening right now.
        </p>
      </div>

      {/* Featured Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredItems.map((item, index) => (
          <Link
            key={item.id}
            href={getCountryLink(item.link)}
            className="group block"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-orange-200/50 transform hover:-translate-y-2">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Type Badge */}
                <div className={`absolute top-4 left-4 p-2 bg-gradient-to-r ${getTypeColor(item.type)} rounded-lg backdrop-blur-sm`}>
                  <LucideClientIcon
                    icon={getTypeIcon(item.type)}
                    className="w-5 h-5 text-white"
                  />
                </div>

                {/* Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(item.badge)}`}>
                  {item.badge}
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-heading font-bold text-white text-xl mb-1">
                    {item.name}
                  </h4>
                  {item.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <LucideClientIcon icon={Star} className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{item.rating}</span>
                      </div>
                      <span className="text-white/80 text-sm">({item.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-600">{item.title}</span>
                    <span className="text-xs text-gray-500">{item.subtitle}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-500">{item.stats.value}</div>
                    <div className="text-xs text-gray-500">{item.stats.label}</div>
                  </div>

                  {item.endDate && (
                    <div className="text-center">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <LucideClientIcon icon={Calendar} className="w-4 h-4" />
                        <span className="text-sm">Ends Jan 31</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.type === 'community-challenge' ? 'Join Challenge' : 'Learn More'}
                  </span>
                  <LucideClientIcon
                    icon={ArrowRight}
                    className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <span className="font-medium">Want to be featured?</span>
          <Link
            href={getCountryLink('/submit-content')}
            className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            <span className="font-medium">Submit Your Content</span>
            <LucideClientIcon icon={ArrowRight} className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
});

export default FeaturedContent;
