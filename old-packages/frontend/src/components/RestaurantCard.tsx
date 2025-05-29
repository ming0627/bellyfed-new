// components/RestaurantCard.tsx

import { ArrowUpDown, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

import { MenuItemRanking, RankingCategory } from '../types';

interface RestaurantCardProps {
  restaurant: MenuItemRanking;
  index: number;
  showRank?: boolean;
  moveRestaurant: (id: string, newPosition: number) => void;
  changeCategory: (id: string, newCategory: RankingCategory) => void;
  onRestaurantClick: (restaurantId: string) => void;
  topRestaurantsCount: number;
}

const RestaurantCard = ({
  restaurant,
  index,
  showRank = true,
  moveRestaurant,
  changeCategory,
  onRestaurantClick,
  topRestaurantsCount,
}: RestaurantCardProps): JSX.Element => {
  const colorClasses: { [key: string]: string } = {
    green: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300',
    red: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300',
  };

  const getAvailableActions = (): Array<{
    label: string;
    onClick: (() => void) | null;
    color: string;
    icon: React.ReactNode;
    isDialog: boolean;
  }> => {
    const actions = [];

    switch (restaurant.category) {
      case RankingCategory.TOP:
        actions.push({
          label: 'Change Rank',
          onClick: null,
          color: 'green',
          icon: <ArrowUpDown className="h-4 w-4 mr-1" />,
          isDialog: true,
        });
        actions.push({
          label: 'Move to Visited',
          onClick: () => changeCategory(restaurant.id, RankingCategory.VISITED),
          color: 'red',
          icon: null,
          isDialog: false,
        });
        break;
      case RankingCategory.VISITED:
        actions.push({
          label: 'Move to Second Chance',
          onClick: () =>
            changeCategory(restaurant.id, RankingCategory.SECOND_CHANCE),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Top 5',
          onClick: () => changeCategory(restaurant.id, RankingCategory.TOP),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        break;
      case RankingCategory.SECOND_CHANCE:
        actions.push({
          label: 'Move to Visited',
          onClick: () => changeCategory(restaurant.id, RankingCategory.VISITED),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Top 5',
          onClick: () => changeCategory(restaurant.id, RankingCategory.TOP),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Dissatisfied',
          onClick: () =>
            changeCategory(restaurant.id, RankingCategory.DISSATISFIED),
          color: 'red',
          icon: null,
          isDialog: false,
        });
        break;
      case RankingCategory.DISSATISFIED:
        actions.push({
          label: 'Move to Second Chance',
          onClick: () =>
            changeCategory(restaurant.id, RankingCategory.SECOND_CHANCE),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Visited',
          onClick: () => changeCategory(restaurant.id, RankingCategory.VISITED),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        break;
      case RankingCategory.PLAN_TO_VISIT:
        actions.push({
          label: 'Move to Visited',
          onClick: () => changeCategory(restaurant.id, RankingCategory.VISITED),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Second Chance',
          onClick: () =>
            changeCategory(restaurant.id, RankingCategory.SECOND_CHANCE),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Dissatisfied',
          onClick: () =>
            changeCategory(restaurant.id, RankingCategory.DISSATISFIED),
          color: 'red',
          icon: null,
          isDialog: false,
        });
        actions.push({
          label: 'Move to Top 5',
          onClick: () => changeCategory(restaurant.id, RankingCategory.TOP),
          color: 'green',
          icon: null,
          isDialog: false,
        });
        break;
      default:
        break;
    }

    return actions;
  };

  const actions = getAvailableActions();

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onRestaurantClick(restaurant.id)}
    >
      <Card className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            {showRank && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                {index + 1}
              </div>
            )}
            <h3 className="font-semibold text-amber-900">{restaurant.name}</h3>
          </div>
          {restaurant.totalScore !== undefined && (
            <p className="text-sm text-gray-600">
              Score: {restaurant.totalScore.toFixed(2)}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {actions.map((action, idx) => {
              if (action.isDialog) {
                return (
                  <Dialog key={idx}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={colorClasses[action.color]}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className={`text-${action.color}-900`}>
                          {action.label}
                        </DialogTitle>
                        <DialogDescription
                          className={`text-${action.color}-700`}
                        >
                          Select a new position for {restaurant.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {[...Array(Math.min(topRestaurantsCount, 5))].map(
                          (_, i) => (
                            <Button
                              key={i}
                              onClick={() => {
                                moveRestaurant(restaurant.id, i);
                                const closeButton = document.querySelector(
                                  '[data-dismiss]',
                                ) as HTMLElement;
                                if (closeButton) closeButton.click();
                              }}
                              variant="outline"
                              className={`bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ${i === index ? 'border-green-500 font-bold' : ''}`}
                            >
                              Move to position {i + 1}
                            </Button>
                          ),
                        )}
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
                );
              } else {
                return (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className={colorClasses[action.color]}
                    onClick={action.onClick || undefined}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                );
              }
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

RestaurantCard.displayName = 'RestaurantCard';

export { RestaurantCard };
