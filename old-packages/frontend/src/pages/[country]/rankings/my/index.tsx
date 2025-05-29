import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout } from '@/components/layout';
import { RankingCard } from '@/components/rankings/RankingCard';
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
import { useCountry } from '@/contexts/CountryContext';
import { useToast } from '@/hooks/use-toast';
import { useCognitoUser } from '@/hooks/useCognitoUser';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getCountryFromContext } from '@/utils/country';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Head from 'next/head';

// Define the ranking type
interface Ranking {
  id: string;
  dishId: string;
  dishName: string;
  dishSlug: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  rank: number | null;
  tasteStatus: string | null;
  notes: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}
export default function MyRankingsPage(): JSX.Element {
  const router = useRouter();
  const { currentCountry } = useCountry();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Use React Query hooks for user data
  const { user: cognitoUser } = useCognitoUser();
  const { profile } = useUserProfile();

  // Fetch user rankings with React Query
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['userRankings', cognitoUser?.id || profile?.id],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      // For now, we'll return mock data
      return [
        {
          id: '1',
          dishId: 'dish1',
          dishName: 'Nasi Lemak',
          dishSlug: 'nasi-lemak',
          restaurantId: 'rest1',
          restaurantName: 'Malaysian Delights',
          restaurantAddress: '123 Jalan Bukit Bintang, Kuala Lumpur',
          rank: 1,
          tasteStatus: null,
          notes:
            "The best nasi lemak I've ever had! The sambal was perfectly spicy and the rice was fragrant.",
          photoUrls: [
            '/images/placeholder-dish.jpg',
            '/images/placeholder-dish.jpg',
          ],
          createdAt: '2023-05-01T12:00:00Z',
          updatedAt: '2023-05-01T12:00:00Z',
        },
        {
          id: '2',
          dishId: 'dish2',
          dishName: 'Char Kway Teow',
          dishSlug: 'char-kway-teow',
          restaurantId: 'rest2',
          restaurantName: 'Penang Street Food',
          restaurantAddress: '45 Gurney Drive, Penang',
          rank: 2,
          tasteStatus: null,
          notes:
            'Authentic Penang-style char kway teow with fresh seafood and perfect wok hei.',
          photoUrls: ['/images/placeholder-dish.jpg'],
          createdAt: '2023-05-02T14:30:00Z',
          updatedAt: '2023-05-02T14:30:00Z',
        },
        {
          id: '3',
          dishId: 'dish3',
          dishName: 'Laksa',
          dishSlug: 'laksa',
          restaurantId: 'rest3',
          restaurantName: 'Sarawak Kitchen',
          restaurantAddress: '78 Jalan Petaling, Kuching',
          rank: null,
          tasteStatus: 'ACCEPTABLE',
          notes:
            'Good laksa but could use more spice. The broth was rich and creamy though.',
          photoUrls: [
            '/images/placeholder-dish.jpg',
            '/images/placeholder-dish.jpg',
            '/images/placeholder-dish.jpg',
            '/images/placeholder-dish.jpg',
          ],
          createdAt: '2023-05-03T09:15:00Z',
          updatedAt: '2023-05-03T09:15:00Z',
        },
        {
          id: '4',
          dishId: 'dish4',
          dishName: 'Roti Canai',
          dishSlug: 'roti-canai',
          restaurantId: 'rest4',
          restaurantName: 'Mamak Corner',
          restaurantAddress: '22 Jalan Alor, Kuala Lumpur',
          rank: null,
          tasteStatus: 'SECOND_CHANCE',
          notes:
            'The roti was a bit too oily, but the curry was good. Will try again.',
          photoUrls: [],
          createdAt: '2023-05-04T18:45:00Z',
          updatedAt: '2023-05-04T18:45:00Z',
        },
        {
          id: '5',
          dishId: 'dish5',
          dishName: 'Satay',
          dishSlug: 'satay',
          restaurantId: 'rest5',
          restaurantName: 'Kajang Satay House',
          restaurantAddress: '56 Jalan Kajang, Selangor',
          rank: null,
          tasteStatus: 'DISSATISFIED',
          notes:
            'The meat was too dry and the peanut sauce was bland. Disappointing experience.',
          photoUrls: ['/images/placeholder-dish.jpg'],
          createdAt: '2023-05-05T20:00:00Z',
          updatedAt: '2023-05-05T20:00:00Z',
        },
      ];
    },
    enabled: !!cognitoUser || !!profile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter and sort rankings
  const filteredRankings = rankings
    ? rankings
        .filter((ranking) => {
          // Search filter
          const matchesSearch =
            ranking.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ranking.restaurantName
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          // Type filter
          if (filterType === 'all') return matchesSearch;
          if (filterType === 'rank')
            return matchesSearch && ranking.rank !== null;
          if (filterType === 'taste')
            return matchesSearch && ranking.tasteStatus !== null;
          if (filterType === 'acceptable')
            return matchesSearch && ranking.tasteStatus === 'ACCEPTABLE';
          if (filterType === 'second-chance')
            return matchesSearch && ranking.tasteStatus === 'SECOND_CHANCE';
          if (filterType === 'dissatisfied')
            return matchesSearch && ranking.tasteStatus === 'DISSATISFIED';

          return matchesSearch;
        })
        .sort((a, b) => {
          // Sort
          if (sortBy === 'date') {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          if (sortBy === 'dish') {
            return a.dishName.localeCompare(b.dishName);
          }
          if (sortBy === 'restaurant') {
            return a.restaurantName.localeCompare(b.restaurantName);
          }
          if (sortBy === 'rank') {
            // Sort by rank (null values at the end)
            if (a.rank === null && b.rank === null) return 0;
            if (a.rank === null) return 1;
            if (b.rank === null) return -1;
            return a.rank - b.rank;
          }

          return 0;
        })
    : [];

  const handleEditRanking = (dishSlug: string): void => {
    router.push(`/${currentCountry.code}/rankings/my/${dishSlug}`);
  };

  const handleDeleteRanking = async (id: string) => {
    try {
      // In a real implementation, this would call an API
      // For now, we'll just update the cache
      queryClient.setQueryData(
        ['userRankings', cognitoUser?.id || profile?.id],
        (oldData: Ranking[] | undefined) =>
          oldData ? oldData.filter((r) => r.id !== id) : [],
      );

      toast({
        title: 'Ranking deleted',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Rankings | Bellyfed</title>
        <meta
          name="description"
          content="View and manage your personal dish rankings"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">My Rankings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search dishes or restaurants"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter By</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rankings</SelectItem>
                      <SelectItem value="rank">Ranked (1-5)</SelectItem>
                      <SelectItem value="taste">Taste Status</SelectItem>
                      <SelectItem value="acceptable">Acceptable</SelectItem>
                      <SelectItem value="second-chance">
                        Second Chance
                      </SelectItem>
                      <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date (Newest First)</SelectItem>
                      <SelectItem value="dish">Dish Name (A-Z)</SelectItem>
                      <SelectItem value="restaurant">
                        Restaurant Name (A-Z)
                      </SelectItem>
                      <SelectItem value="rank">Rank (Best First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Rankings</CardTitle>
                    <CardDescription>
                      {filteredRankings.length}{' '}
                      {filteredRankings.length === 1 ? 'ranking' : 'rankings'}{' '}
                      found
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/${currentCountry.code}/rankings`)
                    }
                  >
                    Find Dishes to Rank
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : filteredRankings.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No rankings found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your filters or search term'
                        : "You haven't ranked any dishes yet"}
                    </p>
                    {!searchTerm && filterType === 'all' && (
                      <Button
                        onClick={() =>
                          router.push(`/${currentCountry.code}/rankings`)
                        }
                      >
                        Browse Dishes to Rank
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredRankings.map((ranking) => (
                      <RankingCard
                        key={ranking.id}
                        ranking={ranking}
                        onEdit={() => handleEditRanking(ranking.dishSlug)}
                        onDelete={() => handleDeleteRanking(ranking.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const country = getCountryFromContext(context);

  if (!country) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      country,
    },
  };
};
