import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ArrowUpDown, X, ArrowDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { MenuItemRanking, RankingCategory } from '@/types';

import { RestaurantCard } from './RestaurantCard';

// components/TopFiveRestaurants.tsx

interface TopFiveRestaurantsProps {
  filteredAndSearchedRestaurants: MenuItemRanking[];
  moveRestaurant: (id: string, newPosition: number) => void;
  changeCategory: (id: string, newCategory: RankingCategory) => void;
  onRestaurantClick: (restaurantId: string) => void;
}

export function TopFiveRestaurants({
  filteredAndSearchedRestaurants,
  moveRestaurant,
  changeCategory,
  onRestaurantClick,
}: TopFiveRestaurantsProps): React.ReactElement {
  const topRestaurants = filteredAndSearchedRestaurants
    .filter((r) => r.category === RankingCategory.TOP)
    .slice(0, 5);

  const renderPodiumActions = (restaurant: MenuItemRanking) => (
    <div className="flex space-x-1 mt-1">
      {/* Change Rank */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-900">Change Ranking</DialogTitle>
            <DialogDescription className="text-green-700">
              Select a new position for {restaurant.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {topRestaurants.map((r, i) => (
              <Button
                key={r.id}
                onClick={() => {
                  moveRestaurant(restaurant.id, i);
                  const closeButton = document.querySelector(
                    '[data-dismiss]',
                  ) as HTMLElement;
                  if (closeButton) closeButton.click();
                }}
                variant="outline"
                className={`bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ${r.id === restaurant.id ? 'border-green-500 font-bold' : ''}`}
              >
                Move to {i + 1}
              </Button>
            ))}
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              data-dismiss
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {/* Move to Visited */}
      <Button
        size="sm"
        variant="outline"
        className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
        onClick={() => changeCategory(restaurant.id, RankingCategory.GENERAL)}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderPodiumItem = (
    restaurant: MenuItemRanking,
    place: number,
    icon: React.ReactNode,
    bgClass: string,
  ) => (
    <motion.div
      key={restaurant.id}
      className={`w-1/3 ${place === 1 ? 'h-40' : 'h-36'} ${bgClass} rounded-t-lg shadow-lg 
                  flex flex-col items-center justify-end p-2 mx-1 relative overflow-hidden cursor-pointer`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        onRestaurantClick(restaurant.id);
      }}
    >
      {icon}
      <span className="text-2xl font-bold text-black mb-1">
        {place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'}
      </span>
      <div className="text-center w-full">
        <h3 className="font-semibold text-black text-xs sm:text-sm break-words">
          {restaurant.name}
        </h3>
        {restaurant.totalScore !== undefined && (
          <p className="text-xs text-black">
            {restaurant.totalScore.toFixed(2)}
          </p>
        )}
      </div>
      {renderPodiumActions(restaurant)}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Podium */}
      <div className="flex justify-center items-end w-full">
        {/* 2nd Place */}
        {topRestaurants[1] &&
          renderPodiumItem(
            topRestaurants[1],
            2,
            <Medal className="w-7 h-7 text-gray-600 absolute top-2" />,
            'bg-gradient-to-b from-gray-300 to-gray-200',
          )}

        {/* 1st Place */}
        {topRestaurants[0] &&
          renderPodiumItem(
            topRestaurants[0],
            1,
            <Trophy className="w-8 h-8 text-yellow-700 absolute top-2" />,
            'bg-gradient-to-b from-yellow-400 to-yellow-300',
          )}

        {/* 3rd Place */}
        {topRestaurants[2] &&
          renderPodiumItem(
            topRestaurants[2],
            3,
            <Award className="w-6 h-6 text-orange-700 absolute top-2" />,
            'bg-gradient-to-b from-orange-400 to-orange-300',
          )}
      </div>

      {/* 4th and 5th Place */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {topRestaurants.slice(3, 5).map((restaurant, idx) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
          >
            <RestaurantCard
              restaurant={restaurant}
              index={idx + 3}
              moveRestaurant={moveRestaurant}
              changeCategory={changeCategory}
              onRestaurantClick={onRestaurantClick}
              topRestaurantsCount={topRestaurants.length}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
