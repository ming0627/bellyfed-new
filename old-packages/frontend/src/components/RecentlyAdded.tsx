// components/RecentlyAdded.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Badge } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodEstablishment } from '@/types';

interface RecentlyAddedProps {
  recentlyAdded: FoodEstablishment[];
}

export const RecentlyAdded: React.FC<RecentlyAddedProps> = ({
  recentlyAdded,
}) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Clock className="w-5 h-5 mr-2 text-amber-600" />
          Recently Added
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {recentlyAdded.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-2 flex justify-between items-center bg-white rounded-lg p-2 shadow"
            >
              <span className="text-amber-800 font-medium">
                {restaurant.name}
              </span>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                {restaurant.category}
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
