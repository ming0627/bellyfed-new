import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { LucideClientIcon } from './ui/lucide-icon.js';
import { CuisineType } from '../config/restaurantConfig.js';
import { useCountry } from '../contexts/CountryContext.js';
import { restaurants as mockRestaurants } from '../data/restaurants.js';
import { FoodEstablishment } from '../types.js';

import { Collections } from './homepage/Collections.js';
import { FeaturedRestaurants } from './homepage/FeaturedRestaurants.js';
import { Navigation } from './homepage/Navigation.js';
import { PremiumBanner } from './homepage/PremiumBanner.js';
import { TopCritics } from './homepage/TopCritics.js';
import { TopFoodies } from './homepage/TopFoodies.js';
import { TopRatedDishes } from './homepage/TopRatedDishes.js';

interface TopReviewer {
  name: string;
  avatar: string;
  reviews: number;
  highlight: boolean;
  badges: {
    type: 'reviewer' | 'expertise' | 'regional' | 'fineDining' | 'michelin';
    name: string;
    icon: string;
    tooltip: string;
    category?: string;
    region?: string;
    level?: 'junior' | 'regular' | 'senior' | 'lead' | 'director';
    reviewCount?: number;
  }[];
}

interface CuisineTypeStats {
  type: string;
  restaurantCount: number;
  averageRating: number;
}

const mockTopReviewers: TopReviewer[] = [
  {
    name: 'Sarah Chen',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
    reviews: 156,
    highlight: false,
    badges: [
      {
        type: 'regional',
        name: 'District Manager',
        icon: '🏙️',
        tooltip: 'Top authority for Orchard district dining',
        region: 'Orchard, Singapore',
        level: 'director',
        reviewCount: 85,
      },
      {
        type: 'fineDining',
        name: 'Fine Dining Director',
        icon: '🍽️',
        tooltip: 'Distinguished fine dining expert',
        level: 'director',
        reviewCount: 75,
      },
    ],
  },
  {
    name: 'Mike Wong',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop',
    reviews: 132,
    highlight: false,
    badges: [
      {
        type: 'expertise',
        name: 'Lead Ramen Expert',
        icon: '🍜',
        tooltip: 'Leading authority on ramen',
        category: 'Japanese',
        level: 'lead',
        reviewCount: 60,
      },
    ],
  },
];

export function Homepage(): JSX.Element {
  const { currentCountry } = useCountry();
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);

  const [reviewers, setReviewers] = useState(
    currentCountry.reviewers.map((r: any) => ({ ...r, highlight: false })),
  );
  const [dishes, setDishes] = useState(
    currentCountry.dishes.map((d: any) => ({
      ...d,
      highlight: false,
      dish: d.name,
    })),
  );
  const [locations, setLocations] = useState(
    currentCountry.locations.map((l: any) => ({
      ...l,
      highlight: false,
      area: l.name,
      new: l.newCount,
    })),
  );

  // Update data when country changes
  useEffect(() => {
    setReviewers(
      currentCountry.reviewers.map((r: any) => ({ ...r, highlight: false })),
    );
    setDishes(
      currentCountry.dishes.map((d: any) => ({
        ...d,
        highlight: false,
        dish: d.name,
      })),
    );
    setLocations(
      currentCountry.locations.map(l => ({
        ...l,
        highlight: false,
        area: l.name,
        new: l.newCount,
      })),
    );
  }, [currentCountry]);

  // Update all internal links to include country code
  const getCountryLink = (path: string) => `/${currentCountry.code}${path}`;

  // Function to randomly update stats
  const updateStats = useCallback(() => {
    // Update reviewers
    setReviewers(prev => {
      const newReviews = prev.map(reviewer => {
        const newReviews = reviewer.reviews + Math.floor(Math.random() * 8); // Increased range
        return {
          ...reviewer,
          reviews: newReviews,
          highlight: newReviews !== reviewer.reviews,
        };
      });
      return [...newReviews].sort((a, b) => b.reviews - a.reviews);
    });

    // Update dishes
    setDishes(prev => {
      const newDishes = prev.map(dish => {
        const change = Math.floor(Math.random() * 15); // Increased range
        const newVotes = dish.votes + change;
        const newTrend = `↑ ${Math.floor(Math.random() * 15 + 5)}%`; // Increased range
        return {
          ...dish,
          votes: newVotes,
          trend: newTrend,
          highlight: newVotes !== dish.votes,
        };
      });
      return [...newDishes].sort((a, b) => b.votes - a.votes);
    });

    // Update locations
    setLocations(prev => {
      const newLocations = prev.map(location => {
        const newRestaurants = Math.floor(Math.random() * 5); // Increased range
        const newTotal = location.restaurants + newRestaurants;
        const newAdded = `+${Math.floor(Math.random() * 8 + 1)} this month`; // Increased range
        return {
          ...location,
          restaurants: newTotal,
          new: newAdded,
          highlight: newTotal !== location.restaurants,
        };
      });
      return [...newLocations].sort((a, b) => b.restaurants - a.restaurants);
    });
  }, []);

  // Update stats more frequently
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats();
      // Update top reviewers
      setTopReviewers(prev =>
        prev.map(reviewer => ({
          ...reviewer,
          reviews: reviewer.reviews + Math.floor(Math.random() * 3),
          highlight: true,
        })),
      );
    }, 800);
    return () => clearInterval(interval);
  }, [updateStats]);

  const [topReviewers, setTopReviewers] = useState(mockTopReviewers);

  const { data: restaurants, isLoading } = useQuery<FoodEstablishment[]>({
    queryKey: ['restaurants'],
    queryFn: () => {
      // Use mock restaurant data
      return Promise.resolve(mockRestaurants);
    },
  });

  const [, setCuisineStats] = useState<CuisineTypeStats[]>([]);
  useEffect(() => {
    if (!restaurants) return;

    // Calculate cuisine stats
    const stats = new Map<string, { count: number; totalRating: number }>();
    restaurants.forEach(restaurant => {
      restaurant.cuisineTypes?.forEach(cuisine => {
        const current = stats.get(cuisine) || { count: 0, totalRating: 0 };
        stats.set(cuisine, {
          count: current.count + 1,
          totalRating:
            current.totalRating + (restaurant.ranking?.totalScore || 0),
        });
      });
    });

    const cuisineStatsArray = Array.from(stats.entries()).map(
      ([cuisine, { count, totalRating }]) => ({
        type: cuisine,
        restaurantCount: count,
        averageRating: totalRating / count,
      }),
    );

    setCuisineStats(cuisineStatsArray);
  }, [restaurants]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LucideClientIcon
          icon={Loader2}
          className="w-6 h-6 animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PremiumBanner
        showPremiumBanner={showPremiumBanner}
        setShowPremiumBanner={setShowPremiumBanner}
      />

      <Navigation getCountryLink={getCountryLink} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <TopFoodies
          reviewers={reviewers}
          dishes={dishes}
          locations={locations}
          countryName={currentCountry.name}
          getCountryLink={getCountryLink}
        />

        <TopCritics topReviewers={topReviewers} />

        <TopRatedDishes />

        <Collections
          countryName={currentCountry.name}
          getCountryLink={getCountryLink}
        />

        <FeaturedRestaurants
          countryName={currentCountry.name}
          getCountryLink={getCountryLink}
        />
      </main>
    </div>
  );
}
