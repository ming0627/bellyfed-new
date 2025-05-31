import React, { memo, useMemo, useState, useEffect } from 'react';
import {
  Star,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';

/**
 * TopRatedDishes component displays a card-based list of top-rated dishes
 * Migrated from old-packages with enhanced functionality and animations
 *
 * @returns {JSX.Element} - Rendered component
 */
const TopRatedDishes = memo(function TopRatedDishes() {
  const [topDishes, setTopDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopDishes = async () => {
      setIsLoading(true);
      try {
        // Simulate API call - in real app, this would fetch from backend
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use mock data if API fails
        setTopDishes([
          {
            id: 'dish1',
            name: 'Nasi Lemak Special',
            restaurantId: 'restaurant1',
            restaurantName: 'Village Park Restaurant',
            location: 'Damansara Uptown',
            totalVotes: 1250,
            averageRating: 4.8,
            image:
              'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&h=400&fit=crop',
            price: 'RM 12.90',
            category: 'Malaysian',
            trending: true,
            trendingPercentage: 15,
            waitTime: '10-15 min',
          },
          {
            id: 'dish2',
            name: 'Char Kuey Teow',
            restaurantId: 'restaurant2',
            restaurantName: 'Penang Famous',
            location: 'Georgetown',
            totalVotes: 980,
            averageRating: 4.7,
            image:
              'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=600&h=400&fit=crop',
            price: 'RM 8.50',
            category: 'Street Food',
            trending: false,
            waitTime: '5-10 min',
          },
          {
            id: 'dish3',
            name: 'Laksa',
            restaurantId: 'restaurant3',
            restaurantName: 'Janggut Laksa',
            location: 'PJ Old Town',
            totalVotes: 1400,
            averageRating: 4.9,
            image:
              'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=600&h=400&fit=crop',
            price: 'RM 10.00',
            category: 'Malaysian',
            trending: true,
            trendingPercentage: 28,
            waitTime: '15-20 min',
          },
          {
            id: 'dish4',
            name: 'Chicken Rice',
            restaurantId: 'restaurant4',
            restaurantName: 'Nam Heong',
            location: 'Chinatown',
            totalVotes: 1100,
            averageRating: 4.6,
            image:
              'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=600&h=400&fit=crop',
            price: 'RM 7.80',
            category: 'Chinese',
            trending: false,
            waitTime: '10-15 min',
          },
        ]);
      } catch (error) {
        console.error('Error loading top dishes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopDishes();
  }, []);

  const handleDishClick = (dishId, dishName) => {
    // In real app, this would navigate to dish details
    console.log(`Navigate to dish: ${dishName} (${dishId})`);
  };

  const handleViewAllClick = () => {
    // In real app, this would navigate to dishes page
    console.log('Navigate to all dishes');
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Actual dishes
          topDishes.map((dish, index) => (
            <div
              key={dish.id}
              className="opacity-0 animate-[fadeInUp_0.3s_ease-out_forwards] cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleDishClick(dish.id, dish.name)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {dish.averageRating}
                    </span>
                    {dish.trending && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />+
                        {dish.trendingPercentage}%
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {dish.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-900">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {dish.restaurantName}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {dish.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dish.waitTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-500">
                      {dish.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dish.totalVotes.toLocaleString()} votes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      {!isLoading && (
        <div className="mt-8 text-center">
          <button
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
            onClick={handleViewAllClick}
          >
            Discover More Dishes
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
});

export default TopRatedDishes;
