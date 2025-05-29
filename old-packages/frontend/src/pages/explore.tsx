import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafeImage } from '@/components/ui/safe-image';
import { foodCategories } from '@/data/foodCategories';
import { restaurants } from '@/data/restaurants';
import { getImageUrl } from '@/utils/image';
import { Coffee, Search, Utensils } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ExplorePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Filter restaurants based on search term
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisineTypes.some((cuisine) =>
        cuisine.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Popular menu items data from foodCategories
  const popularMenuItems = foodCategories
    .filter((cat) => cat.isExisting) // Filter existing items
    .slice(0, 4)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      category: 'Malaysian Cuisine', // Default category
      rating: 4.5, // Default rating
      image: `/menu-items/${cat.name.toLowerCase().replace(/\s+/g, '-')}.jpg`, // Generate image path based on name
    }));

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      {/* Search Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Food & Restaurants
        </h1>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search restaurants, cuisines, or menu items..."
            className="w-full pl-10 pr-4 py-2 rounded-lg"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="max-w-7xl mx-auto"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="menu-items">Popular Menu Items</TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all">
          <div className="grid gap-8">
            {/* Popular Menu Items Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Utensils className="mr-2" /> Popular Menu Items
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularMenuItems.map((menuItem) => (
                  <Card
                    key={menuItem.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      <SafeImage
                        src={menuItem.image}
                        fallbackSrc="/menu-items/default.jpg"
                        alt={menuItem.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{menuItem.name}</h3>
                      <p className="text-sm text-gray-600">
                        {menuItem.category}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{menuItem.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Restaurants Section */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Coffee className="mr-2" /> Restaurants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.slice(0, 6).map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                  >
                    <div className="relative h-48">
                      <SafeImage
                        src={getImageUrl(restaurant.image)}
                        fallbackSrc="/default-restaurant.jpg"
                        alt={restaurant.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {restaurant.cuisineTypes.join(', ')}
                          </p>
                        </div>
                        <Badge>{restaurant.priceRange}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredRestaurants.length > 6 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/restaurants')}
                  >
                    View All Restaurants
                  </Button>
                </div>
              )}
            </section>
          </div>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <div className="relative h-48">
                  <SafeImage
                    src={getImageUrl(restaurant.image)}
                    fallbackSrc="/default-restaurant.jpg"
                    alt={restaurant.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {restaurant.cuisineTypes.join(', ')}
                      </p>
                    </div>
                    <Badge>{restaurant.priceRange}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Menu Items Tab */}
        <TabsContent value="menu-items">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMenuItems.map((menuItem) => (
              <Card
                key={menuItem.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <SafeImage
                    src={menuItem.image}
                    fallbackSrc="/menu-items/default.jpg"
                    alt={menuItem.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{menuItem.name}</h3>
                  <p className="text-sm text-gray-600">{menuItem.category}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{menuItem.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
