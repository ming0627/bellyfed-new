import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import RestaurantList from '../../../components/restaurants/RestaurantList.js';

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

  // Generate country-specific links
  const getCountryLink = path => {
    return `/${country}${path}`;
  };

  // Load mock restaurant data
  useEffect(() => {
    const loadRestaurants = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock restaurant data based on country
      const mockRestaurants = [
        {
          id: '1',
          name:
            country === 'my' ? 'Village Park Restaurant' : 'The Golden Spoon',
          imageUrl:
            'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
          rating: 4.8,
          reviewCount: 324,
          cuisine: country === 'my' ? 'Malaysian' : 'Italian',
          priceRange: '$$',
          location: country === 'my' ? 'Petaling Jaya' : 'Downtown',
          distance: '1.2 km',
          isOpen: true,
          isVerified: true,
          description:
            country === 'my'
              ? 'Famous for their signature Nasi Lemak with crispy fried chicken'
              : 'Fine dining with contemporary Italian cuisine and exceptional service',
          popularDish: country === 'my' ? 'Nasi Lemak' : 'Truffle Pasta',
        },
        {
          id: '2',
          name: country === 'my' ? 'Restoran Yut Kee' : 'Bella Vista',
          imageUrl:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&h=400&fit=crop',
          rating: 4.6,
          reviewCount: 256,
          cuisine: country === 'my' ? 'Malaysian' : 'Mediterranean',
          priceRange: '$$$',
          location: country === 'my' ? 'Kuala Lumpur' : 'Midtown',
          distance: '2.1 km',
          isOpen: true,
          isVerified: true,
          description:
            country === 'my'
              ? 'Historic Hainanese coffee shop serving traditional Malaysian breakfast'
              : 'Authentic Mediterranean flavors with fresh seafood and pasta',
          popularDish: country === 'my' ? 'Roti Babi' : 'Seafood Paella',
        },
        {
          id: '3',
          name: country === 'my' ? 'Jalan Alor Food Street' : 'Sakura Sushi',
          imageUrl:
            'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&h=400&fit=crop',
          rating: 4.4,
          reviewCount: 189,
          cuisine: country === 'my' ? 'Street Food' : 'Japanese',
          priceRange: '$',
          location: country === 'my' ? 'Bukit Bintang' : 'Little Tokyo',
          distance: '3.5 km',
          isOpen: false,
          isVerified: false,
          description:
            country === 'my'
              ? 'Bustling street food paradise with diverse local delicacies'
              : 'Fresh sushi and traditional Japanese dishes in an authentic setting',
          popularDish: country === 'my' ? 'Char Kway Teow' : 'Chirashi Bowl',
        },
        {
          id: '4',
          name: country === 'my' ? "Madam Kwan's" : 'Le Petit Bistro',
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=400&fit=crop',
          rating: 4.3,
          reviewCount: 412,
          cuisine: country === 'my' ? 'Malaysian' : 'French',
          priceRange: '$$$',
          location: country === 'my' ? 'KLCC' : 'French Quarter',
          distance: '6.2 km',
          isOpen: true,
          isVerified: true,
          description:
            country === 'my'
              ? 'Upscale restaurant serving Malaysian classics in a modern setting'
              : 'Cozy French bistro with classic dishes and extensive wine selection',
          popularDish: country === 'my' ? 'Nasi Bojari' : 'Coq au Vin',
        },
        {
          id: '5',
          name: country === 'my' ? 'Dim Sum Restaurant' : 'Taco Libre',
          imageUrl:
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=600&h=400&fit=crop',
          rating: 4.2,
          reviewCount: 167,
          cuisine: country === 'my' ? 'Chinese' : 'Mexican',
          priceRange: '$$',
          location: country === 'my' ? 'Chinatown' : 'Mission District',
          distance: '4.8 km',
          isOpen: true,
          isVerified: false,
          description:
            country === 'my'
              ? 'Traditional dim sum served in bamboo steamers with tea'
              : 'Vibrant Mexican cantina with fresh tacos and craft margaritas',
          popularDish: country === 'my' ? 'Har Gow' : 'Fish Tacos',
        },
        {
          id: '6',
          name: country === 'my' ? 'Banana Leaf Restaurant' : 'Urban Grill',
          imageUrl:
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=400&fit=crop',
          rating: 4.5,
          reviewCount: 298,
          cuisine: country === 'my' ? 'Indian' : 'American',
          priceRange: '$$',
          location: country === 'my' ? 'Brickfields' : 'Downtown',
          distance: '5.1 km',
          isOpen: true,
          isVerified: true,
          description:
            country === 'my'
              ? 'Authentic South Indian cuisine served on traditional banana leaves'
              : 'Modern American grill with premium steaks and craft cocktails',
          popularDish: country === 'my' ? 'Fish Head Curry' : 'Ribeye Steak',
        },
      ];

      setRestaurants(mockRestaurants);
      setIsLoading(false);
    };

    loadRestaurants();
  }, [country]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="w-12 h-12 text-orange-500 mr-3" />
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
        </div>
      </div>

      {/* Restaurant List */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
