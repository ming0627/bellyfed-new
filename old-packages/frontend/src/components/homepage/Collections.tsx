import { useQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { restaurantService } from '@/services/restaurantService';

interface CollectionsProps {
  countryName: string;
  getCountryLink: (path: string) => string;
}

interface Collection {
  title: string;
  description: string;
  places: string;
  image: string;
  link: string;
  topRanked: unknown[]; // Using unknown[] to accommodate different restaurant types
}

export function Collections({
  countryName,
  getCountryLink,
}: CollectionsProps): JSX.Element {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleFilter = (filter: string): void => {
    console.log(`Filter toggled: ${filter}`);
  };

  // Fetch restaurants data once and use it for all collections
  const { data: restaurantsData, isLoading: isLoadingCollections } = useQuery({
    queryKey: ['restaurants-collections', countryName],
    queryFn: async () => {
      const response = await restaurantService.listRestaurants({
        limit: 15, // Fetch enough for all collections at once
      });
      return response;
    },
  });

  // Process the data for collections
  const collections: Collection[] = React.useMemo(() => {
    if (!restaurantsData) return [];

    // Split the restaurants into three groups of 5
    const halalRestaurants = restaurantsData.restaurants.slice(0, 5);
    const malaysianRestaurants = restaurantsData.restaurants.slice(5, 10);
    const indianRestaurants = restaurantsData.restaurants.slice(10, 15);

    return [
      {
        title: 'Halal Certified',
        description:
          'Certified Halal establishments following Islamic dietary laws',
        places: `${halalRestaurants.length} Places`,
        image: '/bellyfed.png',
        link: getCountryLink('/rankings?dish=Halal'),
        topRanked: halalRestaurants,
      },
      {
        title: 'Top Ranked Malaysian',
        description: 'The best Malaysian cuisine restaurants in the area',
        places: `${malaysianRestaurants.length} Places`,
        image: '/bellyfed.png',
        link: getCountryLink('/rankings?dish=Malaysian'),
        topRanked: malaysianRestaurants,
      },
      {
        title: 'Indian Delights',
        description: 'Authentic Indian cuisine with rich flavors and spices',
        places: `${indianRestaurants.length} Places`,
        image: '/bellyfed.png',
        link: getCountryLink('/rankings?dish=Indian'),
        topRanked: indianRestaurants,
      },
    ];
  }, [restaurantsData, getCountryLink]);

  return (
    <>
      {/* Collections Section */}
      <section className="py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Collections</h2>
            <p className="text-gray-500 mt-1">
              Explore curated lists of top ranked restaurants and their
              signature dishes
            </p>
          </div>
          <Link
            href={getCountryLink('/rankings')}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
          >
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {collections.map((collection) => (
                <div
                  key={collection.title}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 first:pl-0 touch-pan-y"
                >
                  <div
                    onClick={() => {
                      toggleFilter(collection.title);
                      router.push(collection.link);
                    }}
                    className="relative group cursor-pointer rounded-lg overflow-hidden"
                  >
                    <div className="relative h-[280px]">
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-bold text-xl">
                          {collection.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full shadow-md"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full shadow-md"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </section>

      {/* Collections Grid Section */}
      <section className="py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Collections</h2>
            <p className="text-gray-500 mt-1">
              Curated lists of the best dining experiences
            </p>
          </div>
        </div>

        {isLoadingCollections ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="pt-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.link}
                className="block transform transition-all duration-200 hover:scale-[1.02]"
              >
                <Card className="h-full">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {collection.description}
                    </p>
                    <Badge variant="secondary">{collection.places}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
