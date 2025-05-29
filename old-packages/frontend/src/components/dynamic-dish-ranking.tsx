import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState, useMemo, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountry } from '@/contexts/CountryContext';
import { dishRankings } from '@/data/dish-rankings';
import { foodCategories } from '@/data/foodCategories';

const DISH_TYPES = ['All', ...foodCategories.map((category) => category.name)];

interface DynamicDishRankingProps {
  initialDishType?: string;
}

export function DynamicDishRanking({
  initialDishType = 'All',
}: DynamicDishRankingProps): React.ReactElement {
  const [selectedDishType, setSelectedDishType] = useState(initialDishType);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { currentCountry } = useCountry();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort dishes based on search, category and country
  const filteredDishes = useMemo(() => {
    return dishRankings
      .filter(
        (dish) =>
          dish.country === currentCountry.code &&
          (selectedDishType === 'All' || dish.category === selectedDishType) &&
          (dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.restaurantName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      )
      .sort((a, b) => b.price - a.price);
  }, [selectedDishType, searchTerm, currentCountry.code]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 border-b">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Dish Rankings</h2>
            <button
              onClick={() => router.push(`/${currentCountry.code}`)}
              className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-2"
            >
              ← Back to Home
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedDishType}
              onValueChange={setSelectedDishType}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select dish type" />
              </SelectTrigger>
              <SelectContent>
                {DISH_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                placeholder="Search dishes or restaurants..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
          <p className="text-sm text-gray-500">
            We're sorry, but we couldn't find any dishes.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    router.push({
                      pathname: `/${currentCountry.code}/dishes`,
                      query: {
                        dishId: dish.id,
                        dishName: dish.name,
                      },
                    });
                  }}
                >
                  <div className="relative h-48 w-full bg-muted">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover"
                      priority={index < 6}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {dish.isVegetarian && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 bg-green-500/90 text-white hover:bg-green-500/90"
                      >
                        Vegetarian
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-semibold leading-tight">
                        {dish.name}
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">
                      {dish.restaurantName}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-end">
                      {dish.spicyLevel > 0 && (
                        <div className="flex items-center">
                          {Array.from({ length: dish.spicyLevel }).map(
                            (_, i) => (
                              <span key={i} className="text-red-500">
                                🌶️
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
