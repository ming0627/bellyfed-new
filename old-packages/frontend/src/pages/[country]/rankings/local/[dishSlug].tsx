import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { COUNTRIES } from '@/config/countries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCountry } from '@/contexts/CountryContext';
import { ArrowLeft } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

export default function LocalDishRankingPage(): JSX.Element {
  const router = useRouter();
  const { country, dishSlug } = router.query;
  const { currentCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);

  // Get dishId and dishName from query params
  const dishId = router.query.dishId as string;
  const dishName = router.query.dishName as string;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace(`/my/rankings/local/${dishSlug}`);
    }
  }, [country, router, dishSlug]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock dish data
  const dishData = {
    id: dishId || 'dish1',
    name: dishName || 'Nasi Lemak Special',
    restaurantName: 'Village Park Restaurant',
    description:
      'Fragrant coconut rice served with sambal, fried anchovies, peanuts, cucumber, and a boiled egg.',
    rating: 4.8,
    numberOfRatings: 1250,
    price: 15.9,
    image:
      'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
    category: 'Malaysian',
    isVegetarian: false,
    spicyLevel: 2,
    country: currentCountry.code,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/${currentCountry.code}/rankings`} passHref>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rankings
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <Card className="overflow-hidden">
              <div className="relative h-[200px] w-full">
                <Image
                  src={dishData.image}
                  alt={dishData.name}
                  fill
                  className="object-cover"
                  priority
                />
                {dishData.isVegetarian && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-green-500/90 text-white hover:bg-green-500/90"
                  >
                    Vegetarian
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">{dishData.name}</h2>
                <p className="text-sm font-medium text-primary mb-2">
                  {dishData.restaurantName}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {dishData.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-1">
                      {dishData.rating.toFixed(1)}
                    </span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({dishData.numberOfRatings})
                    </span>
                  </div>
                  {dishData.spicyLevel > 0 && (
                    <div className="flex items-center">
                      {Array.from({ length: dishData.spicyLevel }).map(
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
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="local" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger
                value="my-ranking"
                onClick={() =>
                  router.push(
                    `/${currentCountry.code}/rankings/my/${dishSlug}${router.query.dishId ? `?dishId=${router.query.dishId}&dishName=${router.query.dishName}` : ''}`,
                  )
                }
              >
                My Ranking
              </TabsTrigger>
              <TabsTrigger value="local">Local</TabsTrigger>
              <TabsTrigger
                value="global"
                onClick={() =>
                  router.push(
                    `/${currentCountry.code}/rankings/global/${dishSlug}${router.query.dishId ? `?dishId=${router.query.dishId}&dishName=${router.query.dishName}` : ''}`,
                  )
                }
              >
                Global
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Local Rankings for {dishData.name}</CardTitle>
                    <CardDescription>
                      See how this dish ranks in {currentCountry.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Local rankings will be implemented in Phase 3.
                      </p>
                      <p className="text-sm text-gray-400">
                        Check back soon for local rankings!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths(): Promise<any> {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: {
  params: { country: string; dishSlug: string };
}): Promise<any> {
  // Validate country code
  const validCountry = COUNTRIES[params.country] ? params.country : 'my';

  return {
    props: {
      country: validCountry,
      dishSlug: params.dishSlug,
    },
    revalidate: 60, // Revalidate every minute
  };
}
