import React from 'react';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Award,
  ChefHat,
} from 'lucide-react';

/**
 * FeaturedRestaurants component - Enhanced with rich visuals and detailed information
 */
function FeaturedRestaurants({ countryName, getCountryLink }) {
  // Validate required props
  if (!countryName || typeof getCountryLink !== 'function') {
    return (
      <div>
        <h2>Featured Restaurants</h2>
        <p>Missing required props</p>
      </div>
    );
  }

  // Enhanced mock data with more details
  const restaurants = [
    {
      id: '1',
      name: 'Nasi Lemak House',
      location: 'Bukit Bintang, KL',
      cuisine: 'Malaysian',
      rating: 4.7,
      reviewCount: 256,
      priceRange: 2,
      image:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&h=400&fit=crop',
      isOpen: true,
      distance: '2.3 km',
      tags: ['Halal', 'Family Friendly', 'Local Favorite'],
      specialOffer: '20% off lunch sets',
      isFeatured: true,
    },
    {
      id: '2',
      name: 'Sushi Sensation',
      location: 'KLCC, Kuala Lumpur',
      cuisine: 'Japanese',
      rating: 4.8,
      reviewCount: 189,
      priceRange: 3,
      image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=600&h=400&fit=crop',
      isOpen: true,
      distance: '3.1 km',
      tags: ['Premium', 'Date Night', "Chef's Special"],
      isFeatured: true,
    },
    {
      id: '3',
      name: 'The Hungry Tapir',
      location: 'Bangsar, KL',
      cuisine: 'Fusion',
      rating: 4.6,
      reviewCount: 342,
      priceRange: 3,
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=400&fit=crop',
      isOpen: false,
      distance: '4.5 km',
      tags: ['Trendy', 'Instagram Worthy', 'Craft Cocktails'],
      specialOffer: 'Happy Hour 5-7pm',
      isFeatured: true,
    },
    {
      id: '4',
      name: 'Penang Street Food',
      location: 'Jalan Alor, KL',
      cuisine: 'Street Food',
      rating: 4.5,
      reviewCount: 523,
      priceRange: 1,
      image:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&h=400&fit=crop',
      isOpen: true,
      distance: '1.8 km',
      tags: ['Authentic', 'Budget Friendly', '24 Hours'],
      isFeatured: true,
    },
    {
      id: '5',
      name: 'La Belle Époque',
      location: 'Pavilion KL',
      cuisine: 'French',
      rating: 4.9,
      reviewCount: 124,
      priceRange: 4,
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&h=400&fit=crop',
      isOpen: true,
      distance: '3.7 km',
      tags: ['Fine Dining', 'Wine Selection', 'Michelin Guide'],
      isFeatured: true,
    },
    {
      id: '6',
      name: "Mama's Kitchen",
      location: 'Chow Kit, KL',
      cuisine: 'Home Style',
      rating: 4.4,
      reviewCount: 412,
      priceRange: 2,
      image:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=600&h=400&fit=crop',
      isOpen: true,
      distance: '2.9 km',
      tags: ['Comfort Food', 'Vegetarian Options', 'Cozy'],
      specialOffer: 'Free dessert with mains',
      isFeatured: true,
    },
  ];

  const handleRestaurantClick = restaurantId => {
    console.log(`Navigate to restaurant: ${restaurantId}`);
    // In real app, use getCountryLink(`/restaurant/${restaurantId}`)
  };

  const handleFavorite = (e, restaurantId) => {
    e.stopPropagation();
    console.log(`Toggle favorite for restaurant: ${restaurantId}`);
  };

  const getPriceRange = range => {
    return Array(4)
      .fill()
      .map((_, i) => (
        <DollarSign
          key={i}
          className={`w-3 h-3 ${i < range ? 'text-gray-900' : 'text-gray-300'}`}
        />
      ));
  };

  return (
    <section className="py-8">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="opacity-0 animate-[fadeInUp_0.3s_ease-out_forwards] cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleRestaurantClick(restaurant.id)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay elements */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        restaurant.isOpen
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {restaurant.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                  <button
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    onClick={e => handleFavorite(e, restaurant.id)}
                  >
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                  {restaurant.specialOffer && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-semibold">
                        🎉 {restaurant.specialOffer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {restaurant.cuisine} Cuisine
                      </p>
                    </div>
                    {restaurant.isFeatured && (
                      <Award className="w-5 h-5 text-orange-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {restaurant.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      {getPriceRange(restaurant.priceRange)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-semibold text-sm">
                          {restaurant.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({restaurant.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {restaurant.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Restaurants CTA */}
        <div className="mt-8 text-center">
          <a
            href={getCountryLink('/restaurants')}
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold group"
          >
            Explore All Restaurants in {countryName}
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRestaurants;
