'use client';

import logger from '@/utils/logger';
import { Button } from '@/components/ui/button';

// pages/MyFoodieLeaderboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CustomTabs, TabsContent } from '@/components/ui/custom-tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountry } from '@/contexts/CountryContext';
import { foodCategories } from '@/data/foodCategories';
import { rankingService } from '@/services/rankingService';
import {
  DishCategory,
  MenuItem,
  MenuItemRanking,
  RankingCategory,
  RestaurantWithRanking,
} from '@/types';

import { BarChart, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

import { AddDishDialog } from './AddDishDialog';
import { AddRestaurantButton } from './AddRestaurantButton';
import { LocationSearch } from './LocationSearch';
import { RestaurantCard } from './RestaurantCard';
import { SearchAndFilter } from './SearchAndFilter';
import { Statistics } from './Statistics';
import { TopFiveRestaurants } from './TopFiveRestaurants';

export const RANKING_CATEGORIES = [
  'Top 5',
  'Dissatisfied',
  'Second Chance',
  'Plan to Visit',
  'Visited',
] as const;
export type RankingCategoryLabel = (typeof RANKING_CATEGORIES)[number];

function convertRankingCategory(
  category: RankingCategory,
): RankingCategoryLabel {
  switch (category) {
    case RankingCategory.TOP:
      return 'Top 5';
    case RankingCategory.DISSATISFIED:
      return 'Dissatisfied';
    case RankingCategory.SECOND_CHANCE:
      return 'Second Chance';
    case RankingCategory.PLAN_TO_VISIT:
      return 'Plan to Visit';
    case RankingCategory.VISITED:
      return 'Visited';
    default:
      return 'Top 5';
  }
}

export function MyFoodieLeaderboard(): JSX.Element {
  const router = useRouter();
  const { currentCountry } = useCountry();
  const defaultMenuItem: MenuItem = {
    id: 'default-menu-item',
    sectionId: foodCategories[0]?.id || 'category1',
    name: foodCategories[0]?.name || 'Nasi Lemak',
    price: 0,
    order: 0,
    menuId: 'default',
    dishCategory: DishCategory.MAIN,
    dishTags: [],
    establishmentId: 'default-establishment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItem>(defaultMenuItem);
  const [existingMenuItems, setExistingMenuItems] = useState<string[]>(
    foodCategories.filter((cat) => cat.isExisting).map((cat) => cat.name),
  );
  const [newMenuItems, setNewMenuItems] = useState<string[]>(
    foodCategories.filter((cat) => !cat.isExisting).map((cat) => cat.name),
  );
  const [activeTab, setActiveTab] = useState<string>('top5');
  const [restaurants, setRestaurants] = useState<MenuItemRanking[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<
    MenuItemRanking[]
  >([]);
  const [searchRestaurant, setSearchRestaurant] = useState('');
  const [quickFilter, setQuickFilter] = useState<RankingCategory | 'all'>(
    'all',
  );

  // Load saved rankings on component mount
  const loadRestaurants = useCallback(async () => {
    logger.info('Loading restaurants from server');
    try {
      // Fetch rankings from server API
      const response = await fetch('/api/rankings', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          logger.info('Found restaurants:', data);
          setRestaurants(data);
        } else {
          logger.info('No restaurants found on server');
        }
      } else {
        logger.error(
          'Error loading rankings from server:',
          response.statusText,
        );
      }
    } catch (e) {
      logger.error('Error loading saved rankings:', e);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // No need to listen for localStorage changes since we're using server-side storage

  // Listen for custom event
  useEffect(() => {
    const handleRankingsUpdate = (): void => {
      logger.info('foodieRankingsUpdated event received');
      loadRestaurants();
    };

    window.addEventListener('foodieRankingsUpdated', handleRankingsUpdate);
    return () =>
      window.removeEventListener('foodieRankingsUpdated', handleRankingsUpdate);
  }, [loadRestaurants]);

  // Update filtered restaurants when restaurants change
  useEffect(() => {
    const filtered = restaurants.filter((r) => {
      const matchesMenuItem =
        !selectedMenuItem.name || r.menuItem?.name === selectedMenuItem.name;
      const matchesCountry =
        !currentCountry || r.country === currentCountry.code;
      return matchesMenuItem && matchesCountry;
    });
    logger.info('Filtered restaurants:', filtered); // Debug log
    setFilteredRestaurants(filtered);
  }, [selectedMenuItem, restaurants, currentCountry]);

  // Save rankings whenever they change
  useEffect(() => {
    if (restaurants.length > 0) {
      // Save rankings to server API
      fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurants),
        credentials: 'include',
      }).catch((error) => {
        logger.error('Error saving rankings to server:', error);
      });
    }
  }, [restaurants]);

  // Calculate scores for restaurants
  useEffect(() => {
    if (restaurants.length === 0) return;

    // Transform MenuItemRanking array to RankingItem array
    const rankingItems = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category,
      menuItem: restaurant.menuItem?.name || restaurant.dish || '',
    }));

    // Calculate scores using the transformed array
    const restaurantsWithScores = rankingService.calculateScores(rankingItems);

    // Map the scores back to the original restaurants
    const updatedRestaurants = restaurants.map((restaurant) => {
      const withScore = restaurantsWithScores.find(
        (r) => r.id === restaurant.id,
      );
      if (!withScore) return restaurant;
      return {
        ...restaurant,
        normalizedPoints: withScore.normalizedPoints || 0,
        interactionPoints: withScore.interactionPoints || 0,
        totalScore: withScore.totalScore || 0,
      };
    });

    // Only update if scores have actually changed
    const scoresChanged = updatedRestaurants.some(
      (r, i) =>
        r.totalScore !== restaurants[i].totalScore ||
        r.normalizedPoints !== restaurants[i].normalizedPoints ||
        r.interactionPoints !== restaurants[i].interactionPoints,
    );

    if (scoresChanged) {
      setRestaurants(updatedRestaurants);
    }
  }, [restaurants]);

  const moveRestaurant = (id: string, newPosition: number): void => {
    const restaurantIndex = restaurants.findIndex((r) => r.id === id);
    if (restaurantIndex === -1) return;

    const newRestaurants = [...restaurants];
    const [movedRestaurant] = newRestaurants.splice(restaurantIndex, 1);
    newRestaurants.splice(newPosition, 0, movedRestaurant);
    setRestaurants(newRestaurants);
    toast.success(
      `Moved ${movedRestaurant.name} to position ${newPosition + 1}`,
    );
  };

  const changeCategory = (id: string, newCategory: RankingCategory): void => {
    const restaurantToMove = restaurants.find((r) => r.id === id);
    if (!restaurantToMove) return;

    if (newCategory === RankingCategory.TOP) {
      const topRestaurants = restaurants.filter(
        (r) =>
          r.category === RankingCategory.TOP &&
          r.menuItem?.name === restaurantToMove.menuItem?.name,
      );
      if (topRestaurants.length >= 5) {
        toast.error('Top 5 is full. Remove a restaurant first.');
        return;
      }
    }

    const updatedRestaurants = restaurants.map((r) => {
      if (r.id === id) {
        if (newCategory === RankingCategory.TOP) {
          const topRestaurants = restaurants.filter(
            (r) =>
              r.category === RankingCategory.TOP &&
              r.menuItem?.name === restaurantToMove.menuItem?.name,
          );
          return {
            ...r,
            category: newCategory,
            rankPosition: (topRestaurants.length + 1) as 1 | 2 | 3 | 4 | 5,
          };
        }
        return { ...r, category: newCategory };
      }
      return r;
    });

    setRestaurants(updatedRestaurants);
    // Save updated restaurants to server API
    fetch('/api/rankings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRestaurants),
      credentials: 'include',
    }).catch((error) => {
      logger.error('Error saving rankings to server:', error);
    });

    toast.success(
      `Moved ${restaurantToMove.name} to ${convertRankingCategory(newCategory)}`,
    );
  };

  const handleRestaurantClick = useCallback(
    (restaurantId: string) => {
      router.push(`/${currentCountry.code}/restaurant/${restaurantId}`);
    },
    [router, currentCountry],
  );

  type CategoryMapType = {
    [key: string]: RankingCategory;
  };

  // Function to convert tab label to ID
  const getTabId = useCallback((label: TabLabel): string => {
    return label.toLowerCase().replace(/\s+/g, '');
  }, []);

  // Tab labels for the UI
  const tabLabels = useMemo(
    () =>
      [
        'Top 5',
        'Dissatisfied',
        'Second Chance',
        'Plan to Visit',
        'Visited',
      ] as const,
    [],
  );

  type TabLabel = (typeof tabLabels)[number];

  // Create a mapping from category to tab ID
  const categoryMapping = useMemo<CategoryMapType>(
    () => ({
      top5: RankingCategory.TOP,
      dissatisfied: RankingCategory.DISSATISFIED,
      secondchance: RankingCategory.SECOND_CHANCE,
      plantovisit: RankingCategory.PLAN_TO_VISIT,
      visited: RankingCategory.VISITED,
    }),
    [],
  );

  // Debug function to check category values
  const debugCategories = useCallback(() => {
    logger.info('Current restaurants:', restaurants);
    logger.info('Filtered restaurants:', filteredRestaurants);
    logger.info('Category mapping:', categoryMapping);
    logger.info('RankingCategory enum:', RankingCategory);
    logger.info('Tab IDs:', tabLabels.map(getTabId));
    restaurants.forEach((r) => {
      // Convert RankingCategory to TabLabel for debugging
      const categoryLabel =
        Object.entries(categoryMapping).find(
          ([_, value]) => value === r.category,
        )?.[0] || '';
      logger.info(
        `Restaurant ${r.name} - Actual Category: ${r.category}, Expected Category: ${categoryMapping[categoryLabel]}`,
      );
    });
  }, [restaurants, filteredRestaurants, categoryMapping, tabLabels, getTabId]);

  useEffect(() => {
    debugCategories();
  }, [restaurants, debugCategories]);

  const filteredAndSearchedRestaurants = useMemo(() => {
    const results = filteredRestaurants.filter((r) => {
      const matchesSearch =
        !searchRestaurant ||
        r.name.toLowerCase().includes(searchRestaurant.toLowerCase());
      const matchesFilter = quickFilter === 'all' || r.category === quickFilter;
      logger.info(
        `Restaurant ${r.name} - Category: ${r.category}, Filter: ${quickFilter}, Matches: ${matchesFilter}`,
      );
      return matchesSearch && matchesFilter;
    });
    logger.info('Filtered and searched restaurants:', results);
    return results;
  }, [filteredRestaurants, searchRestaurant, quickFilter]);

  const getRestaurantsByCategory = useCallback(
    (category: RankingCategory) => {
      return filteredAndSearchedRestaurants.filter(
        (r) => r.category === category,
      );
    },
    [filteredAndSearchedRestaurants],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <Card className="bg-white bg-opacity-90 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-amber-900">
              Foodie Ranks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add LocationSearch component */}
              <LocationSearch
                onLocationSelect={(place) => {
                  logger.info('Selected place:', place);
                  // Handle the selected location here
                }}
                className="mb-4"
              />

              {/* Dish Selection and Add Dish */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <Select
                    value={selectedMenuItem.name}
                    onValueChange={(value) =>
                      setSelectedMenuItem({ ...selectedMenuItem, name: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-orange-50">
                      <SelectValue placeholder="Select a menu item" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingMenuItems.map((menuItem) => (
                        <SelectItem key={menuItem} value={menuItem}>
                          {menuItem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AddDishDialog
                  existingMenuItems={existingMenuItems}
                  newMenuItems={newMenuItems}
                  setExistingMenuItems={setExistingMenuItems}
                  setNewMenuItems={setNewMenuItems}
                  setSelectedMenuItem={(name: string) =>
                    setSelectedMenuItem({ ...selectedMenuItem, name })
                  }
                />
              </div>

              {/* Search and Filter */}
              <SearchAndFilter
                searchRestaurant={searchRestaurant}
                setSearchRestaurant={setSearchRestaurant}
                quickFilter={quickFilter}
                setQuickFilter={
                  setQuickFilter as React.Dispatch<React.SetStateAction<string>>
                }
              />

              {/* Statistics and Recently Added */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full mb-2">
                      <BarChart className="w-4 h-4 mr-2" />
                      Show Statistics
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Statistics
                      filteredRestaurants={
                        filteredRestaurants as unknown as RestaurantWithRanking[]
                      }
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Recently Added
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>

              {/* Tabs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">My Foodie Leaderboard</h1>
                  <AddRestaurantButton selectedMenuItem={selectedMenuItem} />
                </div>

                <CustomTabs
                  tabs={tabLabels}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  <TabsContent value="top5">
                    {/* Top Five Restaurants */}
                    <TopFiveRestaurants
                      filteredAndSearchedRestaurants={getRestaurantsByCategory(
                        RankingCategory.TOP,
                      )}
                      moveRestaurant={moveRestaurant}
                      changeCategory={changeCategory}
                      onRestaurantClick={handleRestaurantClick}
                    />

                    {/* Other Top Restaurants */}
                    {getRestaurantsByCategory(RankingCategory.TOP)
                      .slice(5)
                      .map((restaurant, index) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          index={index + 6}
                          moveRestaurant={moveRestaurant}
                          changeCategory={changeCategory}
                          onRestaurantClick={handleRestaurantClick}
                          topRestaurantsCount={
                            getRestaurantsByCategory(RankingCategory.TOP).length
                          }
                        />
                      ))}
                  </TabsContent>

                  {/* Other Tabs */}
                  {tabLabels.slice(1).map((label) => (
                    <TabsContent value={getTabId(label)} key={label}>
                      {getRestaurantsByCategory(
                        categoryMapping[getTabId(label)],
                      ).map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          index={0}
                          showRank={false}
                          moveRestaurant={moveRestaurant}
                          changeCategory={changeCategory}
                          onRestaurantClick={handleRestaurantClick}
                          topRestaurantsCount={
                            getRestaurantsByCategory(RankingCategory.TOP).length
                          }
                        />
                      ))}
                    </TabsContent>
                  ))}
                </CustomTabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
