// components/AddRestaurantButton.tsx
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCountry } from '@/contexts/CountryContext';
import { rankingService } from '@/services/rankingService';
// Define the RankingCategory enum locally to avoid namespace conflicts
enum RankingCategory {
  TOP = 'Top',
  TRENDING = 'Trending',
  RECOMMENDED = 'Recommended',
  POPULAR = 'Popular',
  GENERAL = 'General',
  VISITED = 'Visited',
  SECOND_CHANCE = 'Second Chance',
  DISSATISFIED = 'Dissatisfied',
  PLAN_TO_VISIT = 'Plan to Visit',
}

// Define the MenuItem interface locally to avoid namespace conflicts
interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  [key: string]: any;
}

// Define the MenuItemRanking interface locally to avoid namespace conflicts
interface MenuItemRanking {
  id: string;
  name: string;
  country: string;
  category: RankingCategory;
  menuItem: MenuItem;
  sequence: number;
  dish: string;
  userId: string;
  menuItemId: string;
  createdAt: string;
  updatedAt: string;
  rank: number;
  [key: string]: any;
}

interface AddRestaurantButtonProps {
  selectedMenuItem: MenuItem;
}

export function AddRestaurantButton({
  selectedMenuItem,
}: AddRestaurantButtonProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const { currentCountry } = useCountry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      toast.error('Please enter a restaurant name');
      return;
    }

    const newRestaurant: MenuItemRanking = {
      id: `${restaurantName}-${Date.now()}`,
      name: restaurantName,
      country: currentCountry?.code || 'SG',
      category: RankingCategory.PLAN_TO_VISIT,
      menuItem: selectedMenuItem,
      sequence: 0,
      dish: selectedMenuItem.name,
      userId: 'default-user',
      menuItemId: selectedMenuItem.id || 'default-menu-item',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rank: 0, // Add the missing rank property
    };

    console.log(
      'Adding new restaurant with category:',
      RankingCategory.PLAN_TO_VISIT,
    );
    console.log('Adding new restaurant:', newRestaurant);

    // Get existing restaurants from server
    try {
      // First fetch existing rankings
      const response = await fetch('/api/rankings', {
        method: 'GET',
        credentials: 'include',
      });

      let existingRestaurants = [];
      if (response.ok) {
        const data = await response.json();
        existingRestaurants = Array.isArray(data) ? data : [];
      }

      console.log('Existing restaurants:', existingRestaurants);

      // Calculate initial scores for all restaurants including the new one
      const allRestaurants = [...existingRestaurants, newRestaurant];
      const restaurantsWithScores =
        rankingService.calculateScores(allRestaurants);

      console.log('All restaurants with scores:', restaurantsWithScores);

      // Save to server
      await fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantsWithScores),
        credentials: 'include',
      });

      // Dispatch a custom event to notify parent components
      window.dispatchEvent(new Event('foodieRankingsUpdated'));
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant. Please try again.');
    }

    setIsOpen(false);
    setRestaurantName('');
    toast.success('Restaurant added successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mb-4 w-full sm:w-auto bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Enter the name of the new restaurant for {selectedMenuItem.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={restaurantName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRestaurantName(e.target.value)
            }
            placeholder="Restaurant name"
            className="mb-4"
          />
          <Button type="submit">Add Restaurant</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
