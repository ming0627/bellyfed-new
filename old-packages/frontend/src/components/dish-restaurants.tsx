import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCountry } from '@/contexts/CountryContext';

// Mock data for restaurants by dish ID
const mockRestaurantsByDish: Record<string, Restaurant[]> = {
  '1': [
    // Nasi Lemak
    {
      id: 'vp1',
      name: 'Village Park Restaurant',
      rating: 4.8,
      votes: 1245,
      image:
        'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
      location: 'Damansara Uptown, PJ',
      openingHours: '7:00 AM - 7:30 PM',
      cuisine: ['Malaysian', 'Local'],
      price: '$$',
      description: 'Fragrant coconut rice with traditional accompaniments',
    },
    {
      id: 'nl2',
      name: 'Ali, Muthu & Ah Hock',
      rating: 4.5,
      votes: 876,
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000',
      location: 'Bangsar, KL',
      openingHours: '8:00 AM - 5:00 PM',
      cuisine: ['Malaysian', 'Fusion'],
      price: '$$',
      description: 'Fragrant coconut rice with traditional accompaniments',
    },
    {
      id: 'nl3',
      name: 'Nasi Lemak Antarabangsa',
      rating: 4.3,
      votes: 1023,
      image:
        'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000',
      location: 'Kampung Baru, KL',
      openingHours: '6:00 AM - 4:00 PM',
      cuisine: ['Malaysian', 'Traditional'],
      price: '$',
      description: 'Fragrant coconut rice with traditional accompaniments',
    },
    {
      id: 'nl4',
      name: "Madam Kwan's",
      rating: 4.2,
      votes: 1542,
      image:
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000',
      location: 'KLCC, KL',
      openingHours: '10:00 AM - 10:00 PM',
      cuisine: ['Malaysian', 'Contemporary'],
      description: 'Fragrant coconut rice with traditional accompaniments',
      price: '$$$',
    },
  ],
  '2': [
    // Vegetarian Curry Laksa
    {
      id: 'pvk1',
      name: 'Pure Veg Kitchen',
      rating: 4.6,
      votes: 782,
      image:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
      location: 'SS2, PJ',
      openingHours: '10:00 AM - 9:00 PM',
      cuisine: ['Vegetarian', 'Malaysian'],
      price: '$$',
      description: 'Flavorful vegetarian curry laksa with rich broth',
    },
    {
      id: 'gv2',
      name: 'Green Valley',
      rating: 4.4,
      votes: 543,
      image:
        'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000',
      location: 'Bangsar South',
      openingHours: '11:00 AM - 8:30 PM',
      cuisine: ['Vegetarian', 'Chinese'],
      price: '$$',
      description: 'Flavorful vegetarian curry laksa with rich broth',
    },
    {
      id: 'vl3',
      name: 'Loving Hut',
      rating: 4.3,
      votes: 421,
      image:
        'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?q=80&w=1000',
      location: 'Taman Desa, KL',
      openingHours: '10:30 AM - 9:00 PM',
      cuisine: ['Vegan', 'Asian Fusion'],
      price: '$$',
      description: 'Flavorful vegetarian curry laksa with rich broth',
    },
  ],
  '3': [
    // Char Kway Teow
    {
      id: 'pf1',
      name: 'Penang Famous',
      rating: 4.7,
      votes: 1876,
      image:
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
      location: 'Damansara Heights',
      openingHours: '11:30 AM - 9:30 PM',
      cuisine: ['Chinese', 'Malaysian'],
      price: '$$',
      description: 'Wok-fried flat rice noodles with a smoky aroma',
    },
    {
      id: 'rc2',
      name: 'Robert Char Koay Teow',
      rating: 4.5,
      votes: 1243,
      image:
        'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      location: 'SS2, PJ',
      openingHours: '5:00 PM - 11:00 PM',
      cuisine: ['Chinese', 'Street Food'],
      price: '$',
      description: 'Wok-fried flat rice noodles with a smoky aroma',
    },
    {
      id: 'ckt3',
      name: 'Lot 10 Hutong CKT',
      rating: 4.3,
      votes: 987,
      image:
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1000',
      location: 'Bukit Bintang, KL',
      openingHours: '10:00 AM - 10:00 PM',
      cuisine: ['Chinese', 'Hawker'],
      price: '$$',
      description: 'Wok-fried flat rice noodles with a smoky aroma',
    },
  ],
  '4': [
    // Roti Canai
    {
      id: 'mc1',
      name: 'Mamak Corner',
      rating: 4.6,
      votes: 2134,
      image:
        'https://images.unsplash.com/photo-1633237308525-cd587cf71926?q=80&w=1000',
      location: 'Petaling Street',
      openingHours: '24 hours',
      cuisine: ['Indian', 'Mamak'],
      price: '$',
      description: 'Flaky flatbread served with curry dipping sauce',
    },
    {
      id: 'vr2',
      name: 'Valentine Roti',
      rating: 4.4,
      votes: 1532,
      image:
        'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?q=80&w=1000',
      location: 'Bangsar',
      openingHours: '6:30 AM - 6:30 PM',
      cuisine: ['Indian', 'Malaysian'],
      price: '$',
      description: 'Flaky flatbread served with curry dipping sauce',
    },
    {
      id: 'rc3',
      name: 'Transfer Road Roti',
      rating: 4.7,
      votes: 876,
      image:
        'https://images.unsplash.com/photo-1668236543090-82c96a12b8d3?q=80&w=1000',
      location: 'Penang Road',
      openingHours: '6:00 AM - 1:00 PM',
      cuisine: ['Indian', 'Street Food'],
      price: '$',
      description: 'Flaky flatbread served with curry dipping sauce',
    },
  ],
  '5': [
    // Satay
    {
      id: 'ss1',
      name: 'Satay Station',
      rating: 4.5,
      votes: 1432,
      image:
        'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=1000',
      location: 'Kampung Baru',
      openingHours: '4:00 PM - 1:00 AM',
      cuisine: ['Malaysian', 'BBQ'],
      price: '$$',
      description: 'Grilled skewered meat with peanut sauce',
    },
    {
      id: 'hs2',
      name: 'Haji Samuri',
      rating: 4.8,
      votes: 2341,
      image:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000',
      location: 'Kajang',
      openingHours: '11:00 AM - 10:00 PM',
      cuisine: ['Malaysian', 'BBQ'],
      price: '$$',
      description: 'Grilled skewered meat with peanut sauce',
    },
    {
      id: 'fs3',
      name: 'Fat Satay',
      rating: 4.3,
      votes: 987,
      image:
        'https://images.unsplash.com/photo-1534797258760-1bd2cc95a5bd?q=80&w=1000',
      location: 'Cheras',
      openingHours: '5:00 PM - 12:00 AM',
      cuisine: ['Malaysian', 'Street Food'],
      price: '$',
      description: 'Grilled skewered meat with peanut sauce',
    },
  ],
  '7': [
    // Chili Crab
    {
      id: 'js1',
      name: 'Jumbo Seafood',
      rating: 4.7,
      votes: 2345,
      image:
        'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1000',
      location: 'East Coast Seafood Centre',
      openingHours: '11:30 AM - 10:30 PM',
      cuisine: ['Seafood', 'Chinese'],
      price: '$$$',
      description: "Singapore's most famous chili crab with signature sauce",
    },
    {
      id: 'ns2',
      name: 'No Signboard Seafood',
      rating: 4.5,
      votes: 1876,
      image:
        'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1000',
      location: 'Geylang',
      openingHours: '11:00 AM - 10:30 PM',
      cuisine: ['Seafood', 'Chinese'],
      price: '$$$',
      description: 'Signature seafood dish with sweet and spicy sauce',
    },
    {
      id: 'ls3',
      name: 'Long Beach Seafood',
      rating: 4.6,
      votes: 2134,
      image:
        'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1000',
      location: 'Dempsey Road',
      openingHours: '11:30 AM - 10:00 PM',
      cuisine: ['Seafood', 'Chinese'],
      price: '$$$',
      description: 'Signature seafood dish with sweet and spicy sauce',
    },
  ],
  '8': [
    // Chicken Rice
    {
      id: 'tt1',
      name: 'Tian Tian Chicken Rice',
      rating: 4.8,
      votes: 3421,
      image:
        'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000',
      location: 'Maxwell Food Centre',
      openingHours: '10:00 AM - 8:00 PM',
      cuisine: ['Chinese', 'Local'],
      price: '$',
      description: "Award-winning chicken rice, Anthony Bourdain's favorite",
    },
    {
      id: 'bk2',
      name: 'Boon Tong Kee',
      rating: 4.5,
      votes: 2134,
      image:
        'https://images.unsplash.com/photo-1562967915-6ba607ff7d05?q=80&w=1000',
      location: 'Balestier Road',
      openingHours: '11:00 AM - 9:30 PM',
      cuisine: ['Chinese', 'Local'],
      price: '$$',
      description: 'Tender poached chicken with fragrant rice',
    },
    {
      id: 'wn3',
      name: 'Wee Nam Kee',
      rating: 4.4,
      votes: 1876,
      image:
        'https://images.unsplash.com/photo-1569058242567-c389a6b7a48e?q=80&w=1000',
      location: 'United Square',
      openingHours: '10:30 AM - 10:00 PM',
      cuisine: ['Chinese', 'Local'],
      price: '$$',
      description: 'Tender poached chicken with fragrant rice',
    },
  ],
  '9': [
    // Laksa
    {
      id: 'kl1',
      name: '328 Katong Laksa',
      rating: 4.7,
      votes: 2345,
      image:
        'https://images.unsplash.com/photo-1583835746434-cf1534674b41?q=80&w=1000',
      location: 'East Coast Road',
      openingHours: '9:30 AM - 9:30 PM',
      cuisine: ['Peranakan', 'Local'],
      price: '$',
      description: 'Spicy noodle soup with coconut milk base',
    },
    {
      id: 'sl2',
      name: 'Sungei Road Laksa',
      rating: 4.6,
      votes: 1987,
      image:
        'https://images.unsplash.com/photo-1569058242567-c389a6b7a48e?q=80&w=1000',
      location: 'Jalan Berseh',
      openingHours: '9:30 AM - 5:00 PM',
      cuisine: ['Local', 'Street Food'],
      price: '$',
      description: 'Spicy noodle soup with coconut milk base',
    },
    {
      id: 'jl3',
      name: 'Janggut Laksa',
      rating: 4.5,
      votes: 1765,
      image:
        'https://images.unsplash.com/photo-1626804475534-f2289c1f1049?q=80&w=1000',
      location: 'Queensway Shopping Centre',
      openingHours: '10:00 AM - 8:00 PM',
      cuisine: ['Local', 'Peranakan'],
      price: '$',
      description: 'Spicy noodle soup with coconut milk base',
    },
  ],
};

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  votes: number;
  image: string;
  location: string;
  openingHours: string;
  cuisine: string[];
  price: string;
  description: string;
}

interface DishRestaurantsProps {
  dishId: string;
  dishName: string;
}

export function DishRestaurants({
  dishId,
  dishName,
}: DishRestaurantsProps): JSX.Element {
  const { currentCountry } = useCountry();
  const router = useRouter();

  const restaurants = useMemo(() => {
    return mockRestaurantsByDish[dishId] || [];
  }, [dishId]);

  const sortedRestaurants = useMemo(() => {
    return [...restaurants].sort((a, b) => b.rating - a.rating);
  }, [restaurants]);

  const handleBackClick = (): void => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBackClick}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to dishes
      </button>

      <h1 className="text-3xl font-bold mb-2">{dishName}</h1>
      <p className="text-gray-600 mb-6">
        Top restaurants serving {dishName} in {currentCountry.name}
      </p>

      {sortedRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      Top Rated
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold">{restaurant.name}</h2>
                    <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                      <span className="text-green-700 font-bold">
                        {restaurant.rating}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({restaurant.votes})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{restaurant.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{restaurant.openingHours}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisine.map((type: string) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="bg-gray-100">
                      {restaurant.price}
                    </Badge>
                  </div>

                  <p className="text-gray-700 text-sm">
                    {restaurant.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            We couldn't find any restaurants serving this dish.
          </p>
        </div>
      )}
    </div>
  );
}

export default DishRestaurants;
