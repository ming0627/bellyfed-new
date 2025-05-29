import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COUNTRIES } from '@/config/countries';
import { useCountry } from '@/contexts/CountryContext';
import { dishRankings } from '@/data/dish-rankings';
import { foodCategories } from '@/data/foodCategories';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const DISH_TYPES = ['All', ...foodCategories.map((category) => category.name)];

export default function RankingsPage(): JSX.Element {
  const router = useRouter();
  const { country, dish } = router.query;
  const { currentCountry } = useCountry();
  const [selectedDishType, setSelectedDishType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/rankings');
    }
  }, [country, router]);

  // Set the selected dish type from the query parameter
  useEffect(() => {
    if (dish && typeof dish === 'string') {
      setSelectedDishType(dish);
    }
  }, [dish]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter dishes based on search and category
  const filteredDishes = dishRankings
    .filter(
      (dish) =>
        dish.country === currentCountry.code &&
        (selectedDishType === 'All' || dish.category === selectedDishType) &&
        (dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => b.rating - a.rating);

  const handleDishClick = (dishId: string, dishName: string): void => {
    router.push({
      pathname: `/${currentCountry.code}/rankings/my/${encodeURIComponent(dishName.toLowerCase().replace(/\s+/g, '-'))}`,
      query: {
        dishId,
        dishName,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Food Rankings</h1>
      <p className="text-gray-600 mb-6">
        Discover and rank the best dishes in {currentCountry.name}
      </p>

      <Tabs defaultValue="dishes" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="dishes">Dishes</TabsTrigger>
          <TabsTrigger value="my-rankings">My Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="dishes">
          <Card>
            <CardHeader>
              <CardTitle>Find Dishes to Rank</CardTitle>
              <CardDescription>
                Browse dishes or search for your favorites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search dishes or restaurants"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>
                <Select
                  value={selectedDishType}
                  onValueChange={setSelectedDishType}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
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
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredDishes.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    No dishes found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters to find dishes.
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
                          onClick={() => handleDishClick(dish.id, dish.name)}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-1">
                                  {dish.rating.toFixed(1)}
                                </span>
                                <span className="text-yellow-400">★</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({dish.numberOfRatings})
                                </span>
                              </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-rankings">
          <Card>
            <CardHeader>
              <CardTitle>My Rankings</CardTitle>
              <CardDescription>
                View and manage your personal dish rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">
                  Your personal rankings will appear here once you start ranking
                  dishes.
                </p>
                <p className="text-sm text-gray-400">
                  Browse dishes and click on them to start ranking!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
