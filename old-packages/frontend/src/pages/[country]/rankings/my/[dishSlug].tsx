import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RankingDialog } from '@/components/rankings/RankingDialog';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COUNTRIES } from '@/config/countries';
import { useCountry } from '@/contexts/CountryContext';
import { useUserRanking } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, ArrowLeft, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

// Custom toast
export default function MyDishRankingPage(): JSX.Element {
  const router = useRouter();
  const { country, dishSlug } = router.query;
  const { currentCountry } = useCountry();
  const { toast } = useToast();
  const [showRankingDialog, setShowRankingDialog] = useState(false);

  // Get dishId from query params
  const dishId = router.query.dishId as string;

  // Fetch user ranking data
  const {
    userRanking,
    dishDetails,
    rankingStats,
    isLoading,
    error,
    createOrUpdateRanking,
    deleteRanking,
  } = useUserRanking(dishSlug as string, dishId);

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace(`/my/rankings/my/${dishSlug}`);
    }
  }, [country, router, dishSlug]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleEditRanking = (): void => {
    setShowRankingDialog(true);
  };

  const handleDeleteRanking = async () => {
    if (!userRanking) return;

    try {
      await deleteRanking();
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitRanking = async (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId: string;
    restaurantName: string;
  }) => {
    try {
      await createOrUpdateRanking(data);
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
      });
    }
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
          ) : dishDetails ? (
            <Card className="overflow-hidden">
              <div className="relative h-[200px] w-full">
                <Image
                  src={dishDetails.imageUrl}
                  alt={dishDetails.name}
                  fill
                  className="object-cover"
                  priority
                />
                {dishDetails.isVegetarian && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-green-500/90 text-white hover:bg-green-500/90"
                  >
                    Vegetarian
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">{dishDetails.name}</h2>
                <p className="text-sm font-medium text-primary mb-2">
                  {dishDetails.restaurantName}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {dishDetails.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-1">
                      {rankingStats?.averageRank.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({rankingStats?.totalRankings || 0})
                    </span>
                  </div>
                  {dishDetails.spicyLevel > 0 && (
                    <div className="flex items-center">
                      {Array.from({ length: dishDetails.spicyLevel }).map(
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
          ) : (
            <Card className="p-6">
              <p className="text-center text-gray-500">
                Dish details not available
              </p>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="my-ranking" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="my-ranking">My Ranking</TabsTrigger>
              <TabsTrigger
                value="local"
                onClick={() =>
                  router.push(
                    `/${currentCountry.code}/rankings/local/${dishSlug}${router.query.dishId ? `?dishId=${router.query.dishId}&dishName=${router.query.dishName}` : ''}`,
                  )
                }
              >
                Local
              </TabsTrigger>
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

            <TabsContent value="my-ranking">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : dishDetails ? (
                <Card>
                  <CardHeader>
                    <CardTitle>My Ranking for {dishDetails.name}</CardTitle>
                    <CardDescription>
                      Your personal assessment of this dish
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userRanking ? (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          {userRanking.rank ? (
                            <div className="flex items-center">
                              <Badge className="text-lg px-3 py-1 bg-orange-500 hover:bg-orange-600">
                                Rank #{userRanking.rank}
                              </Badge>
                              <span className="ml-2 text-sm text-gray-500">
                                (Top ranking)
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              {userRanking.tasteStatus === 'ACCEPTABLE' && (
                                <Badge className="flex items-center space-x-1 bg-green-500 hover:bg-green-600">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>Acceptable</span>
                                </Badge>
                              )}
                              {userRanking.tasteStatus === 'SECOND_CHANCE' && (
                                <Badge className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>Second Chance</span>
                                </Badge>
                              )}
                              {userRanking.tasteStatus === 'DISSATISFIED' && (
                                <Badge className="flex items-center space-x-1 bg-red-500 hover:bg-red-600">
                                  <ThumbsDown className="h-4 w-4" />
                                  <span>Dissatisfied</span>
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {userRanking.restaurantName && (
                          <div>
                            <h3 className="text-sm font-medium mb-2">
                              Restaurant:
                            </h3>
                            <div className="flex items-center">
                              <Link
                                href={`/${currentCountry.code}/restaurant/${userRanking.restaurantId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {userRanking.restaurantName}
                              </Link>
                            </div>
                            {userRanking.restaurantAddress && (
                              <p className="text-gray-500 text-sm mt-1">
                                {userRanking.restaurantAddress}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-medium mb-2">Notes:</h3>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {userRanking.notes}
                          </p>
                        </div>

                        {userRanking.photoUrls &&
                          userRanking.photoUrls.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium mb-2">
                                Photos:
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                {userRanking.photoUrls.map(
                                  (url: string, index: number) => (
                                    <div
                                      key={index}
                                      className="relative h-32 rounded-md overflow-hidden"
                                    >
                                      <Image
                                        src={url}
                                        alt={`Photo ${index + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="mr-2"
                            onClick={handleEditRanking}
                          >
                            Edit Ranking
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteRanking}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          You haven't ranked this dish yet.
                        </p>
                        <Button onClick={handleEditRanking}>
                          Rank This Dish
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-6">
                  <p className="text-center text-gray-500">
                    Dish details not available
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Ranking Dialog */}
      {dishDetails && (
        <RankingDialog
          open={showRankingDialog}
          onOpenChange={setShowRankingDialog}
          dishId={dishDetails.dishId}
          dishName={dishDetails.name}
          restaurantId={dishDetails.restaurantId}
          restaurantName={dishDetails.restaurantName}
          dishType={dishDetails.category}
          initialRanking={userRanking || undefined}
          onSubmit={handleSubmitRanking}
        />
      )}
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
