import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import RestaurantList from '../../../components/restaurants/RestaurantList';
import {
  getCountryStaticPaths,
  getCountryStaticProps,
} from '../../../utils/countryHelpers.js';

/**
 * Restaurants listing page for a specific country
 */
export default function RestaurantsPage({ country }) {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get country name from code
  const getCountryName = code => {
    const countries = {
      us: 'United States',
      my: 'Malaysia',
      sg: 'Singapore',
      jp: 'Japan',
    };
    return countries[code] || 'Your Country';
  };

  // Get country link helper
  const getCountryLink = (path) => `/${country}${path}`;

  // Mock restaurant data based on country
  const getMockRestaurants = (countryCode) => {
    const baseRestaurants = {
      my: [
        {
          id: 1,
          name: 'Village Park Restaurant',
          cuisine: 'Malaysian',
          rating: 4.8,
          reviewCount: 1247,
          priceRange: '$$',
          distance: '0.8 km',
          image: '/images/restaurants/village-park.jpg',
          description: 'Famous for authentic nasi lemak and traditional Malaysian breakfast',
          slug: 'village-park-restaurant'
        },
        {
          id: 2,
          name: 'Restoran Yut Kee',
          cuisine: 'Hainanese',
          rating: 4.6,
          reviewCount: 892,
          priceRange: '$',
          distance: '1.2 km',
          image: '/images/restaurants/yut-kee.jpg',
          description: 'Historic kopitiam serving Hainanese chicken chop since 1928',
          slug: 'restoran-yut-kee'
        },
        {
          id: 3,
          name: 'Jalan Alor Food Street',
          cuisine: 'Street Food',
          rating: 4.5,
          reviewCount: 2156,
          priceRange: '$',
          distance: '2.1 km',
          image: '/images/restaurants/jalan-alor.jpg',
          description: 'Bustling street food paradise with diverse local delicacies',
          slug: 'jalan-alor-food-street'
        },
        {
          id: 4,
          name: 'Atmosphere 360',
          cuisine: 'International',
          rating: 4.3,
          reviewCount: 567,
          priceRange: '$$$',
          distance: '15.2 km',
          image: '/images/restaurants/atmosphere-360.jpg',
          description: 'Revolving restaurant with panoramic city views',
          slug: 'atmosphere-360'
        }
      ],
      us: [
        {
          id: 5,
          name: 'The Golden Spoon',
          cuisine: 'American',
          rating: 4.7,
          reviewCount: 1834,
          priceRange: '$$$',
          distance: '0.5 km',
          image: '/images/restaurants/golden-spoon.jpg',
          description: 'Upscale American cuisine with farm-to-table ingredients',
          slug: 'the-golden-spoon'
        },
        {
          id: 6,
          name: 'Bella Vista',
          cuisine: 'Italian',
          rating: 4.6,
          reviewCount: 1245,
          priceRange: '$$',
          distance: '1.1 km',
          image: '/images/restaurants/bella-vista.jpg',
          description: 'Authentic Italian dishes with homemade pasta',
          slug: 'bella-vista'
        }
      ]
    };

    // Add some international restaurants for all countries
    const internationalRestaurants = [
      {
        id: 7,
        name: 'Sakura Sushi',
        cuisine: 'Japanese',
        rating: 4.4,
        reviewCount: 678,
        priceRange: '$$',
        distance: '1.8 km',
        image: '/images/restaurants/sakura-sushi.jpg',
        description: 'Fresh sushi and sashimi with traditional Japanese ambiance',
        slug: 'sakura-sushi'
      },
      {
        id: 8,
        name: 'Spice Garden',
        cuisine: 'Indian',
        rating: 4.2,
        reviewCount: 445,
        priceRange: '$',
        distance: '2.3 km',
        image: '/images/restaurants/spice-garden.jpg',
        description: 'Aromatic Indian curries and tandoor specialties',
        slug: 'spice-garden'
      }
    ];

    return [...(baseRestaurants[countryCode] || baseRestaurants.us), ...internationalRestaurants];
  };

  useEffect(() => {
    // Simulate API call
    const loadRestaurants = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = getMockRestaurants(country);
      setRestaurants(mockData);
      setIsLoading(false);
    };

    loadRestaurants();
  }, [country]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-12 w-12 text-orange-500 mr-4" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
              Restaurants in{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {getCountryName(country)}
              </span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the best restaurants and dining experiences in your area.
          </p>
        </div>

        <RestaurantList
          restaurants={restaurants}
          isLoading={isLoading}
          getCountryLink={getCountryLink}
          showFilters={true}
          emptyMessage={`No restaurants found in ${getCountryName(country)}`}
        />
      </div>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'us' } },
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
      { params: { country: 'jp' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
  };
}
