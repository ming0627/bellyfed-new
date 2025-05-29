import { motion } from 'framer-motion';
import { Star, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountry } from '@/contexts/CountryContext';
import { postgresService } from '@/services/postgresService';

interface TopDish {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  totalVotes: number;
  averageRating: number;
}

export function TopRatedDishes(): JSX.Element {
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { currentCountry } = useCountry();

  useEffect(() => {
    const loadTopDishes = async () => {
      setIsLoading(true);
      try {
        const response = await postgresService.getTopDishes(5);
        // The API returns { dishes: [...], total: number }
        setTopDishes(response.dishes || []);
      } catch (error) {
        console.error('Error loading top dishes:', error);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadTopDishes();
  }, []);

  const handleDishClick = (dishId: string, dishName: string): void => {
    router.push({
      pathname: `/${currentCountry.code}/dishes`,
      query: { dishId, dishName },
    });
  };

  const handleViewAllClick = (): void => {
    router.push(`/${currentCountry.code}/dishes`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          Top Rated Dishes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          onClick={handleViewAllClick}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDishClick(dish.id, dish.name)}
                >
                  <CardContent className="p-4">
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
                        <Badge variant="outline" className="mt-1">
                          {dish.totalVotes} votes
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
