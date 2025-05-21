import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  MapPin,
  TrendingUp,
  Award,
  Utensils,
  Star,
  Heart,
  Check,
  UserCheck,
  ThumbsUp,
  Compass,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Clock
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import ReviewerCard from '@/components/reviewers/ReviewerCard';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import RankingBoard from '@/components/home/RankingBoard';
import AnimatedRankingItem from '@/components/home/AnimatedRankingItem';

// Mock data for top reviewers
const topReviewers = [
  {
    id: '1',
    name: 'Jane Doe',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    reviewCount: 143,
    rank: 1,
    specialty: 'Fine Dining',
    location: 'Kuala Lumpur',
  },
  {
    id: '2',
    name: 'John Smith',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    reviewCount: 111,
    rank: 2,
    specialty: 'Street Food',
    location: 'Penang',
  },
  {
    id: '3',
    name: 'Emily Wong',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    reviewCount: 95,
    rank: 3,
    specialty: 'Desserts',
    location: 'Johor Bahru',
  },
  {
    id: '4',
    name: 'David Chen',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    reviewCount: 84,
    rank: 4,
    specialty: 'Seafood',
    location: 'Kota Kinabalu',
  },
  {
    id: '5',
    name: 'Sarah Lee',
    avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    reviewCount: 83,
    rank: 5,
    specialty: 'Vegetarian',
    location: 'Ipoh',
  },
];

// Mock data for featured restaurants
const featuredRestaurants = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 256,
    cuisine: 'Malaysian',
    priceRange: '$$',
    location: 'Jalan Bukit Bintang, Kuala Lumpur',
    distance: '1.2 km',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Laksa Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=600&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 189,
    cuisine: 'Malaysian',
    priceRange: '$',
    location: 'Jalan Alor, Kuala Lumpur',
    distance: '0.8 km',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Satay Street',
    imageUrl: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=600&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 312,
    cuisine: 'BBQ',
    priceRange: '$',
    location: 'Jalan Petaling, Kuala Lumpur',
    distance: '2.1 km',
    isOpen: false,
  },
  {
    id: '4',
    name: 'Roti Canai Corner',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 178,
    cuisine: 'Indian',
    priceRange: '$',
    location: 'Bangsar, Kuala Lumpur',
    distance: '3.5 km',
    isOpen: true,
  },
];

// Mock data for trending dishes
const trendingDishes = [
  {
    id: '1',
    name: 'Nasi Lemak',
    imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
    votes: 263,
    trend: '↑ 17%',
  },
  {
    id: '2',
    name: 'Char Kway Teow',
    imageUrl: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc22?q=80&w=600&h=400&fit=crop',
    votes: 239,
    trend: '↑ 12%',
  },
  {
    id: '3',
    name: 'Laksa',
    imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?q=80&w=600&h=400&fit=crop',
    votes: 183,
    trend: '↑ 19%',
  },
];

// Mock data for ranking board
const topRankedDishes = [
  {
    id: '1',
    name: 'Nasi Lemak with Sambal Prawns',
    imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
    rating: 4.9,
    restaurant: 'Nasi Lemak House',
    votes: 512,
    trend: '↑ 17%',
  },
  {
    id: '2',
    name: 'Char Kway Teow Special',
    imageUrl: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc22?q=80&w=600&h=400&fit=crop',
    rating: 4.8,
    restaurant: 'Penang Street Food',
    votes: 487,
    trend: '↑ 12%',
  },
  {
    id: '3',
    name: 'Laksa Sarawak',
    imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?q=80&w=600&h=400&fit=crop',
    rating: 4.8,
    restaurant: 'Laksa Paradise',
    votes: 456,
    trend: '↑ 19%',
  },
  {
    id: '4',
    name: 'Roti Canai with Curry',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&h=400&fit=crop',
    rating: 4.7,
    restaurant: 'Roti Canai Corner',
    votes: 423,
    trend: '↑ 8%',
  },
  {
    id: '5',
    name: 'Satay Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=600&h=400&fit=crop',
    rating: 4.7,
    restaurant: 'Satay Street',
    votes: 398,
    trend: '↑ 5%',
  },
  {
    id: '6',
    name: 'Hainanese Chicken Rice',
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=600&h=400&fit=crop',
    rating: 4.6,
    restaurant: 'Chicken Rice Specialist',
    votes: 387,
    trend: '↑ 10%',
  },
  {
    id: '7',
    name: 'Beef Rendang',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&h=400&fit=crop',
    rating: 4.6,
    restaurant: 'Nusantara Cuisine',
    votes: 365,
    trend: '↑ 7%',
  },
  {
    id: '8',
    name: 'Mee Goreng Mamak',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&h=400&fit=crop',
    rating: 4.5,
    restaurant: 'Mamak Corner',
    votes: 342,
    trend: '↑ 4%',
  },
  {
    id: '9',
    name: 'Asam Laksa',
    imageUrl: 'https://images.unsplash.com/photo-1618111377072-2546cb346c69?q=80&w=600&h=400&fit=crop',
    rating: 4.5,
    restaurant: 'Penang Flavors',
    votes: 321,
    trend: '↑ 6%',
  },
  {
    id: '10',
    name: 'Curry Mee',
    imageUrl: 'https://images.unsplash.com/photo-1569058243543-1af6d246cb18?q=80&w=600&h=400&fit=crop',
    rating: 4.4,
    restaurant: 'Curry House',
    votes: 298,
    trend: '↑ 3%',
  },
];

// Extended top reviewers data for ranking board
const topRankedReviewers = topReviewers.map((reviewer, index) => ({
  ...reviewer,
  helpfulCount: 350 - (index * 30),
}));

// Add more reviewers for pagination
const extendedReviewers = [
  ...topRankedReviewers,
  {
    id: '6',
    name: 'Michael Tan',
    avatarUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
    reviewCount: 76,
    rank: 6,
    specialty: 'Hawker Food',
    location: 'Melaka',
    helpfulCount: 180,
  },
  {
    id: '7',
    name: 'Priya Sharma',
    avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    reviewCount: 68,
    rank: 7,
    specialty: 'Indian Cuisine',
    location: 'Kuala Lumpur',
    helpfulCount: 165,
  },
  {
    id: '8',
    name: 'Ahmad Hassan',
    avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
    reviewCount: 62,
    rank: 8,
    specialty: 'Malay Cuisine',
    location: 'Kuantan',
    helpfulCount: 150,
  },
  {
    id: '9',
    name: 'Lisa Wong',
    avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
    reviewCount: 59,
    rank: 9,
    specialty: 'Cafes',
    location: 'Petaling Jaya',
    helpfulCount: 140,
  },
  {
    id: '10',
    name: 'Raj Patel',
    avatarUrl: 'https://randomuser.me/api/portraits/men/36.jpg',
    reviewCount: 54,
    rank: 10,
    specialty: 'Fusion Cuisine',
    location: 'Shah Alam',
    helpfulCount: 130,
  },
];

// Top ranked restaurants
const topRankedRestaurants = [
  {
    id: '1',
    name: 'Nasi Lemak House',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 512,
    cuisine: 'Malaysian',
    priceRange: '$$',
  },
  {
    id: '2',
    name: 'Laksa Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=600&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 487,
    cuisine: 'Malaysian',
    priceRange: '$',
  },
  {
    id: '3',
    name: 'Satay Street',
    imageUrl: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=600&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 456,
    cuisine: 'BBQ',
    priceRange: '$',
  },
  {
    id: '4',
    name: 'Roti Canai Corner',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 423,
    cuisine: 'Indian',
    priceRange: '$',
  },
  {
    id: '5',
    name: 'Penang Street Food',
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 398,
    cuisine: 'Street Food',
    priceRange: '$',
  },
  {
    id: '6',
    name: 'Chicken Rice Specialist',
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=600&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 387,
    cuisine: 'Chinese',
    priceRange: '$$',
  },
  {
    id: '7',
    name: 'Nusantara Cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 365,
    cuisine: 'Indonesian',
    priceRange: '$$',
  },
  {
    id: '8',
    name: 'Mamak Corner',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 342,
    cuisine: 'Mamak',
    priceRange: '$',
  },
  {
    id: '9',
    name: 'Penang Flavors',
    imageUrl: 'https://images.unsplash.com/photo-1618111377072-2546cb346c69?q=80&w=600&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 321,
    cuisine: 'Malaysian',
    priceRange: '$$',
  },
  {
    id: '10',
    name: 'Curry House',
    imageUrl: 'https://images.unsplash.com/photo-1569058243543-1af6d246cb18?q=80&w=600&h=400&fit=crop',
    rating: 4.4,
    reviewCount: 298,
    cuisine: 'Indian',
    priceRange: '$$',
  },
];

const HomePage: React.FC = () => {
  const router = useRouter();

  // State for animating ranking items
  const [animatingItems, setAnimatingItems] = useState<{[key: string]: boolean}>({});

  // Function to trigger random animations periodically
  useEffect(() => {
    // Function to randomly select items to animate
    const animateRandomItems = () => {
      const newAnimatingItems: {[key: string]: boolean} = {};

      // Randomly select 1-2 items from each category to animate
      ['dish', 'reviewer', 'restaurant'].forEach(category => {
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
        const itemsCount = category === 'dish' ? topRankedDishes.length :
                          category === 'reviewer' ? topReviewers.length :
                          topRankedRestaurants.length;

        // Select random indices
        const indices = new Set<number>();
        while (indices.size < count) {
          indices.add(Math.floor(Math.random() * itemsCount));
        }

        // Set those items to animate
        indices.forEach(index => {
          newAnimatingItems[`${category}-${index}`] = true;
        });
      });

      setAnimatingItems(newAnimatingItems);

      // Reset animations after they complete
      setTimeout(() => {
        setAnimatingItems({});
      }, 600); // Animation duration + small buffer
    };

    // Set up interval to trigger animations
    const intervalId = setInterval(animateRandomItems, 5000); // Every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Layout
      title="Bellyfed - Discover the Best Food Experiences"
      description="Find the best restaurants, dishes, and food experiences in Malaysia."
    >
      {/* Hero Section */}
      <section className="relative -mt-6 mb-16 animate-fade-in">
        <div className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-coral-500 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative z-10 py-16 px-6 md:py-24 md:px-12 max-w-5xl">
            <Badge
              variant="premium"
              size="md"
              className="mb-6 animate-fade-in shadow-md"
            >
              <Award size={14} className="mr-1.5" />
              Malaysia's Top Food Discovery Platform
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight animate-slide-up">
              <span className="block">Discover Your Next</span>
              <span className="block text-accent-gold-500">Culinary Adventure</span>
            </h1>

            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Find the best restaurants, read reviews from top food critics, and explore trending dishes in your area.
            </p>

            <div className="relative max-w-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>
              <form className="flex shadow-lg">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search for restaurants, dishes, or cuisines..."
                    className="w-full py-4 px-5 pl-12 rounded-l-xl border-0 focus:ring-2 focus:ring-primary-300 text-neutral-800 text-base transition-all duration-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                </div>
                <Button
                  type="submit"
                  className="rounded-l-none px-8 py-4 text-base font-medium bg-accent-gold-500 hover:bg-accent-gold-600 text-neutral-900 transition-all duration-300 hover:shadow-md"
                  withRipple
                >
                  Search
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2 text-white/80 text-sm">
                <span>Popular:</span>
                <Button variant="ghost" size="xs" className="text-white/90 hover:text-white hover:bg-white/10 transition-colors">Nasi Lemak</Button>
                <Button variant="ghost" size="xs" className="text-white/90 hover:text-white hover:bg-white/10 transition-colors">Laksa</Button>
                <Button variant="ghost" size="xs" className="text-white/90 hover:text-white hover:bg-white/10 transition-colors">Satay</Button>
                <Button variant="ghost" size="xs" className="text-white/90 hover:text-white hover:bg-white/10 transition-colors">Roti Canai</Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 backdrop-blur-sm transform skew-x-12 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full transform -translate-x-1/3 translate-y-1/3 animate-pulse-subtle"></div>
          <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full animate-float"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>

          {/* Food illustration elements - subtle icons */}
          <div className="absolute top-12 right-12 text-white/20 transform rotate-12 animate-bounce-subtle">
            <Utensils size={48} />
          </div>
          <div className="absolute bottom-12 left-1/4 text-white/10 transform -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>
            <MapPin size={64} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="hidden md:flex justify-between items-center bg-white dark:bg-neutral-800 rounded-xl shadow-card py-4 px-8 mt-6 mx-auto max-w-5xl transform -translate-y-1/2 border border-primary-100 dark:border-primary-900/20">
          <div className="text-center px-4 group">
            <div className="text-2xl font-heading font-bold text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform">1,200+</div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Restaurants</div>
          </div>
          <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="text-center px-4 group">
            <div className="text-2xl font-heading font-bold text-secondary-600 dark:text-secondary-500 group-hover:scale-110 transition-transform">15,000+</div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Reviews</div>
          </div>
          <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="text-center px-4 group">
            <div className="text-2xl font-heading font-bold text-accent-gold-600 dark:text-accent-gold-500 group-hover:scale-110 transition-transform">500+</div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Food Critics</div>
          </div>
          <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="text-center px-4 group">
            <div className="text-2xl font-heading font-bold text-accent-coral-600 dark:text-accent-coral-500 group-hover:scale-110 transition-transform">50+</div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">Cities</div>
          </div>
        </div>
      </section>

      {/* Malaysia's Finest Food Reviewers Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <Badge variant="soft-secondary" size="md" className="mb-3">
              <Award size={14} className="mr-1.5" />
              Top Critics
            </Badge>
            <h2 className="text-3xl font-heading font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Malaysia's Finest Food Reviewers
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-lg">
              Follow the most trusted food critics and never miss their latest discoveries
            </p>
          </div>
          <Button
            variant="outline-primary"
            size="md"
            className="mt-4 md:mt-0"
            rightIcon={<Award size={16} />}
          >
            View All Critics
          </Button>
        </div>

        {/* Three equal columns layout for Top Dishes, Top Reviewers, and Top Restaurants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Dishes Column */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
            <div className="bg-gradient-dishes px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Utensils className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Top Dishes</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {topRankedDishes.slice(0, 10).map((dish, index) => (
                  <AnimatedRankingItem
                    key={dish.id}
                    index={index}
                    item={dish}
                    type="dish"
                    isAnimating={animatingItems[`dish-${index}`]}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Top Reviewers Column */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
            <div className="bg-gradient-reviewers px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Top Reviewers</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {topReviewers.slice(0, 10).map((reviewer, index) => (
                  <AnimatedRankingItem
                    key={reviewer.id}
                    index={index}
                    item={reviewer}
                    type="reviewer"
                    isAnimating={animatingItems[`reviewer-${index}`]}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Top Restaurants Column */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
            <div className="bg-gradient-restaurants px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Top Restaurants</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {topRankedRestaurants.slice(0, 10).map((restaurant, index) => (
                  <AnimatedRankingItem
                    key={restaurant.id}
                    index={index}
                    item={restaurant}
                    type="restaurant"
                    isAnimating={animatingItems[`restaurant-${index}`]}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile view - tabs for switching between categories */}
        <div className="mt-8 md:hidden">
          <div className="flex justify-center mb-4">
            <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
              <button className="px-4 py-2 rounded-full bg-primary-500 text-white font-medium text-sm shadow-sm">
                Dishes
              </button>
              <button className="px-4 py-2 rounded-full text-neutral-700 dark:text-neutral-300 font-medium text-sm">
                Reviewers
              </button>
              <button className="px-4 py-2 rounded-full text-neutral-700 dark:text-neutral-300 font-medium text-sm">
                Restaurants
              </button>
            </div>
          </div>

          {/* Mobile dishes list */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {topRankedDishes.slice(0, 5).map((dish, index) => (
                <AnimatedRankingItem
                  key={`mobile-dish-${dish.id}`}
                  index={index}
                  item={dish}
                  type="dish"
                  isAnimating={animatingItems[`dish-${index}`]}
                />
              ))}
            </ul>
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-700">
              <button className="w-full py-2 text-center text-primary-600 dark:text-primary-500 font-medium text-sm">
                View All Dishes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Dishes Section */}
      <section className="mb-20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900/20 dark:to-neutral-900 rounded-3xl transform -skew-y-1 -translate-y-10 scale-y-[1.15]"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <Badge variant="soft-gold" size="md" className="mb-3 shadow-sm">
              <TrendingUp size={14} className="mr-1.5" />
              Popular Now
            </Badge>
            <h2 className="text-3xl font-heading font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Trending Dishes
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-lg">
              Discover what's hot right now in Malaysia's food scene
            </p>
          </div>
          <Button
            variant="outline-primary"
            size="md"
            className="mt-4 md:mt-0 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            rightIcon={<TrendingUp size={16} />}
          >
            Explore All Trending Dishes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingDishes.map((dish, index) => (
            <Card
              key={dish.id}
              className="overflow-hidden group"
              variant="elevated"
              hover="lift"
              padding="none"
              radius="xl"
              shadow="card"
            >
              <div className="relative">
                <div className="w-full h-56 overflow-hidden">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"></div>

                {/* Trending badge */}
                <Badge
                  variant="gradient"
                  size="md"
                  className="absolute top-4 right-4 shadow-md animate-pulse-subtle"
                >
                  <TrendingUp size={14} className="mr-1.5" />
                  {dish.trend}
                </Badge>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2 group-hover:text-accent-gold-500 transition-colors">
                    {dish.name}
                  </h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <span className="font-medium">{dish.votes}</span>
                    <span className="ml-1">votes this month</span>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="p-4 bg-white dark:bg-neutral-800 flex justify-between items-center border-t border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center">
                  <Button
                    variant="soft-primary"
                    size="sm"
                    className="mr-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    Find Restaurants
                  </Button>
                </div>
                <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                  <Button
                    variant="ghost"
                    size="icon.sm"
                    className="text-neutral-500 hover:text-primary-500 transition-colors"
                    aria-label="Share"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile view - horizontal scrolling cards */}
        <div className="mt-8 md:hidden overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex space-x-4 w-max">
            {trendingDishes.map((dish) => (
              <div key={`mobile-${dish.id}`} className="w-72">
                <Card
                  className="overflow-hidden group"
                  variant="elevated"
                  hover="lift"
                  padding="none"
                  radius="xl"
                  shadow="card"
                >
                  <div className="relative">
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70"></div>

                    {/* Trending badge */}
                    <Badge
                      variant="gradient"
                      size="sm"
                      className="absolute top-3 right-3 shadow-md animate-pulse-subtle"
                    >
                      <TrendingUp size={12} className="mr-1" />
                      {dish.trend}
                    </Badge>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-heading font-bold text-white mb-1 group-hover:text-accent-gold-500 transition-colors">
                        {dish.name}
                      </h3>
                      <div className="flex items-center text-white/80 text-xs">
                        <span className="font-medium">{dish.votes}</span>
                        <span className="ml-1">votes</span>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-3 bg-white dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
                    <Button
                      variant="soft-primary"
                      size="xs"
                      className="w-full hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      Find Restaurants
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <Badge variant="soft-purple" size="md" className="mb-3">
              <Utensils size={14} className="mr-1.5" />
              Editor's Choice
            </Badge>
            <h2 className="text-3xl font-heading font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              Featured Restaurants
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-lg">
              Handpicked dining experiences you shouldn't miss in Malaysia
            </p>
          </div>
          <Button
            variant="outline-primary"
            size="md"
            className="mt-4 md:mt-0"
            rightIcon={<Utensils size={16} />}
          >
            Browse All Restaurants
          </Button>
        </div>

        {/* Desktop view - grid layout */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          {/* Large featured restaurant */}
          <div className="col-span-12 md:col-span-6">
            <RestaurantCard
              id={featuredRestaurants[0].id}
              name={featuredRestaurants[0].name}
              imageUrl={featuredRestaurants[0].imageUrl}
              rating={featuredRestaurants[0].rating}
              reviewCount={featuredRestaurants[0].reviewCount}
              cuisine={featuredRestaurants[0].cuisine}
              priceRange={featuredRestaurants[0].priceRange as '$' | '$$' | '$$$' | '$$$$'}
              location={featuredRestaurants[0].location}
              distance={featuredRestaurants[0].distance}
              isOpen={featuredRestaurants[0].isOpen}
              isVerified={true}
              isPremium={true}
              popularDish="Nasi Lemak with Sambal Prawns"
              onToggleFavorite={(id) => console.log(`Toggled favorite for ${id}`)}
              className="h-full"
            />
          </div>

          {/* Right side grid */}
          <div className="col-span-12 md:col-span-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredRestaurants.slice(1).map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                imageUrl={restaurant.imageUrl}
                rating={restaurant.rating}
                reviewCount={restaurant.reviewCount}
                cuisine={restaurant.cuisine}
                priceRange={restaurant.priceRange as '$' | '$$' | '$$$' | '$$$$'}
                location={restaurant.location}
                distance={restaurant.distance}
                isOpen={restaurant.isOpen}
                isVerified={index === 0}
                isNew={index === 1}
                popularDish={index === 0 ? "Char Kway Teow" : undefined}
                onToggleFavorite={(id) => console.log(`Toggled favorite for ${id}`)}
              />
            ))}
          </div>
        </div>

        {/* Mobile view - horizontal cards */}
        <div className="md:hidden space-y-6">
          {featuredRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={`mobile-${restaurant.id}`}
              id={restaurant.id}
              name={restaurant.name}
              imageUrl={restaurant.imageUrl}
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
              cuisine={restaurant.cuisine}
              priceRange={restaurant.priceRange as '$' | '$$' | '$$$' | '$$$$'}
              location={restaurant.location}
              distance={restaurant.distance}
              isOpen={restaurant.isOpen}
              isVerified={index === 0}
              isPremium={index === 0}
              isNew={index === 1}
              popularDish={index === 0 ? "Nasi Lemak with Sambal Prawns" : index === 1 ? "Char Kway Teow" : undefined}
              onToggleFavorite={(id) => console.log(`Toggled favorite for ${id}`)}
              variant="horizontal"
            />
          ))}
        </div>

        {/* Restaurant categories */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {['Malaysian', 'Chinese', 'Indian', 'Thai', 'Japanese', 'Western', 'Vegetarian', 'Desserts'].map((category, index) => (
            <Card
              key={category}
              className="text-center group cursor-pointer"
              variant="flat"
              hover="grow"
              padding="sm"
              radius="lg"
            >
              <div className="flex flex-col items-center p-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index % 4 === 0 ? 'bg-primary-100 text-primary-600' :
                  index % 4 === 1 ? 'bg-secondary-100 text-secondary-600' :
                  index % 4 === 2 ? 'bg-accent-cream-100 text-accent-cream-800' :
                  'bg-accent-plum-100 text-accent-plum-600'
                } group-hover:scale-110 transition-transform`}>
                  <Utensils size={16} />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{category}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-20">
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-700"></div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTAtMTZjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTE2IDE2YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNG0tMTYgMGMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0LTEuOCA0LTQgNC00LTEuOC00LTRtLTE2IDBjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTAtMTZjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00TTIwIDM0YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNG0xNi0xNmMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0LTEuOCA0LTQgNC00LTEuOC00LTRtLTE2IDBjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00bTE2IDE2YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNCIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8 max-w-2xl">
              <Badge variant="premium" size="md" className="mb-4 shadow-sm">
                Join Our Community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4 leading-tight">
                Become a Food Critic and Share Your Culinary Adventures
              </h2>
              <p className="text-white/90 text-lg max-w-xl leading-relaxed">
                Share your dining experiences, build your reputation, and help others discover great food. Join our community of food enthusiasts today and make your voice heard!
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  variant="gradient"
                  size="lg"
                  className="shadow-lg bg-accent-gold-500 hover:bg-accent-gold-600 text-neutral-900"
                  onClick={() => router.push('/signup')}
                  withRipple
                >
                  Sign Up Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  onClick={() => router.push('/about')}
                >
                  Learn More
                </Button>
              </div>

              {/* Testimonial */}
              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <Avatar
                      src="https://randomuser.me/api/portraits/women/44.jpg"
                      fallback="JD"
                      size="md"
                      border="thick"
                    />
                  </div>
                  <div>
                    <p className="text-white/90 italic text-sm mb-2">
                      "Joining Bellyfed changed how I experience food. I've discovered amazing restaurants I never knew existed and connected with fellow food lovers across Malaysia."
                    </p>
                    <div className="flex items-center">
                      <span className="text-white font-medium text-sm">Jane Doe</span>
                      <span className="mx-2 text-white/50">•</span>
                      <span className="text-white/80 text-xs">Top 5 Reviewer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative image - only visible on larger screens */}
            <div className="hidden lg:block relative w-64 h-64">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"></div>
              <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full"></div>
              <div className="absolute inset-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Utensils size={64} className="text-white" />
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 transform skew-x-12 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
