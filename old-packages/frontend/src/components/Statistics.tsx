// components/Statistics.tsx
import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantWithRanking, RankingCategory } from '@/types';
interface StatisticsProps {
  filteredRestaurants: RestaurantWithRanking[];
}

export const Statistics: React.FC<StatisticsProps> = ({
  filteredRestaurants,
}) => {
  const totalRestaurants = filteredRestaurants.length;
  const categoryCounts = filteredRestaurants.reduce(
    (acc, r) => {
      const category = r.category;
      if (
        category &&
        Object.values(RankingCategory).includes(category as RankingCategory)
      ) {
        acc[category as RankingCategory] =
          (acc[category as RankingCategory] || 0) + 1;
      }
      return acc;
    },
    {} as Record<RankingCategory, number>,
  );

  return (
    <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <BarChart className="w-5 h-5 mr-2 text-amber-600" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg font-semibold text-amber-700 mb-2">
            Total Restaurants: {totalRestaurants}
          </p>
          {Object.entries(categoryCounts).map(([category, count], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex justify-between items-center mb-1"
            >
              <span className="text-amber-800">{category}:</span>
              <span className="font-semibold text-amber-600">{count}</span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
