import React, { memo, useMemo, useState, useEffect } from 'react';
import { Star, Award, ArrowRight } from 'lucide-react';

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
            totalVotes: 1250,
            averageRating: 4.8,
          },
          {
            id: 'dish2',
            name: 'Char Kuey Teow',
            restaurantId: 'restaurant2',
            restaurantName: 'Penang Famous',
            totalVotes: 980,
            averageRating: 4.7,
          },
          {
            id: 'dish3',
            name: 'Laksa',
            restaurantId: 'restaurant3',
            restaurantName: 'Janggut Laksa',
            totalVotes: 1400,
            averageRating: 4.9,
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
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="flex flex-row items-center justify-between p-6 border-b">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold">Top Rated Dishes</h2>
        </div>
        <button
          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 text-sm font-medium flex items-center gap-2 px-3 py-1 rounded transition-colors"
          onClick={handleViewAllClick}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topDishes.map((dish, index) => (
              <div
                key={dish.id}
                className="opacity-0 animate-[fadeInUp_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white border rounded-lg p-4"
                  onClick={() => handleDishClick(dish.id, dish.name)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{dish.name}</h3>
                      <p className="text-sm text-gray-500">
                        {dish.restaurantName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {dish.averageRating.toFixed(1)}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded mt-1">
                        {dish.totalVotes} votes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default TopRatedDishes;
