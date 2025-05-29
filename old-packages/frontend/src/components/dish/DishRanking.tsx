import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/databaseService';

// Define a type for the database service with the methods we need
interface IDatabaseService {
  getDishRankings: (dishId: string) => Promise<{
    total_votes: number;
    average_rank: number;
    ranks: Record<string, number>;
  }>;
  createRanking: (
    dishId: string,
    restaurantId: string,
    dishType: string,
    rank: number | null,
    tasteStatus: string | null,
    notes: string,
    photoUrls: string[],
  ) => Promise<{
    id: string;
    [key: string]: unknown;
  }>;
}
// Cast the database service to our interface
const typedDatabaseService = databaseService as unknown as IDatabaseService;
import {
  Camera,
  Upload,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from 'lucide-react';

interface DishRankingProps {
  dishId: string;
  dishName: string;
  restaurantId: string;
  restaurantName: string;
  dishType: string;
}

interface RankingStats {
  totalRankings: number;
  averageRank: number;
  ranks: Record<string, number>;
  tasteStatuses: Record<string, number>;
}

interface UserRanking {
  ranking_id?: string;
  user_id: string;
  dish_id: string;
  restaurant_id: string;
  dish_type?: string;
  rank?: number | null;
  taste_status?: string | null;
  notes?: string;
  photo_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

const DishRanking: React.FC<DishRankingProps> = ({
  dishId,
  dishName,
  restaurantId,
  restaurantName,
  dishType,
}) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [rankingStats, setRankingStats] = useState<RankingStats | null>(null);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);

  const [showRankingDialog, setShowRankingDialog] = useState(false);
  const [rankingType, setRankingType] = useState<'rank' | 'taste'>('rank');
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [selectedTasteStatus, setSelectedTasteStatus] = useState<string | null>(
    null,
  );
  const [notes, setNotes] = useState('');
  // Using underscore prefix to indicate intentionally unused variable
  const [photoUrls, _setPhotoUrls] = useState<string[]>([
    '/images/placeholder-dish.jpg',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setIsLoading(true);
        const data = await typedDatabaseService.getDishRankings(dishId);
        setRankingStats({
          totalRankings: data.total_votes || 0,
          averageRank: data.average_rank || 0,
          ranks: data.ranks || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          tasteStatuses: { ACCEPTABLE: 0, SECOND_CHANCE: 0, DISSATISFIED: 0 },
        });

        // Since we don't have user rankings in the new API response,
        // we'll need to fetch them separately or handle this differently
        // For now, we'll just use default values
        setUserRanking(null);
      } catch (error) {
        console.error('Error fetching dish rankings:', error);
        toast({
          message: 'Failed to load dish rankings',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingData();
  }, [dishId, toast]);

  const handleOpenRankingDialog = (): void => {
    if (!isAuthenticated) {
      toast({
        message: 'You must be signed in to rank dishes',
        type: 'error',
      });
      return;
    }
    setShowRankingDialog(true);
  };

  const handleCloseRankingDialog = (): void => {
    setShowRankingDialog(false);
  };

  const handleRankingTypeChange = (type: 'rank' | 'taste'): void => {
    setRankingType(type);
    if (type === 'rank') {
      setSelectedTasteStatus(null);
    } else {
      setSelectedRank(null);
    }
  };

  const handleSubmitRanking = async () => {
    if (!isAuthenticated) {
      toast({
        message: 'You must be signed in to rank dishes',
        type: 'error',
      });
      return;
    }

    if (rankingType === 'rank' && selectedRank === null) {
      toast({
        message: 'Please select a rank for the dish',
        type: 'error',
      });
      return;
    }

    if (rankingType === 'taste' && selectedTasteStatus === null) {
      toast({
        message: 'Please select a taste status for the dish',
        type: 'error',
      });
      return;
    }

    if (!notes || notes.trim() === '') {
      toast({
        message: 'Please provide notes for your ranking',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await typedDatabaseService.createRanking(
        dishId,
        restaurantId,
        dishType,
        rankingType === 'rank' ? selectedRank : null,
        rankingType === 'taste' ? selectedTasteStatus : null,
        notes,
        photoUrls,
      );

      // Update local state with the response
      if (response) {
        // Refresh the rankings data
        try {
          const updatedData =
            await typedDatabaseService.getDishRankings(dishId);
          setRankingStats({
            totalRankings: updatedData.total_votes || 0,
            averageRank: updatedData.average_rank || 0,
            ranks: updatedData.ranks || {
              '1': 0,
              '2': 0,
              '3': 0,
              '4': 0,
              '5': 0,
            },
            tasteStatuses: { ACCEPTABLE: 0, SECOND_CHANCE: 0, DISSATISFIED: 0 },
          });
        } catch (error) {
          console.error('Error refreshing rankings:', error);
        }

        // Create a local user ranking object
        setUserRanking({
          ranking_id: response.id || 'new-ranking',
          user_id: 'current-user-id',
          dish_id: dishId,
          restaurant_id: restaurantId,
          dish_type: dishType,
          rank: rankingType === 'rank' ? selectedRank : null,
          taste_status: rankingType === 'taste' ? selectedTasteStatus : null,
          notes,
          photo_urls: photoUrls,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      toast({
        message: `You've successfully ranked ${dishName}!`,
        type: 'success',
      });

      handleCloseRankingDialog();
    } catch (error) {
      console.error('Error submitting ranking:', error);
      toast({
        message: 'Failed to submit ranking',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (): void => {
    // In a real app, this would open a file picker and upload the photo
    toast({
      message: 'Photo upload functionality is not implemented in this demo',
      type: 'success',
    });
  };

  const renderRankingStats = (): React.ReactNode => {
    if (!rankingStats) return null;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dish Rankings</CardTitle>
          <CardDescription>
            {rankingStats.totalRankings}{' '}
            {rankingStats.totalRankings === 1 ? 'ranking' : 'rankings'} •
            {rankingStats.averageRank > 0
              ? ` Average Rank: ${rankingStats.averageRank.toFixed(1)}`
              : ' No ranks yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ranks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ranks">Ranks (1-5)</TabsTrigger>
              <TabsTrigger value="taste">Taste Status</TabsTrigger>
            </TabsList>
            <TabsContent value="ranks" className="space-y-4 pt-4">
              <div className="space-y-2">
                {Object.entries(rankingStats.ranks).map(([rank, count]) => (
                  <div key={rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {rank}
                      </Badge>
                      <span>Rank {rank}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="taste" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                    <span>Acceptable</span>
                  </div>
                  <span>{rankingStats.tasteStatuses.ACCEPTABLE || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>Second Chance</span>
                  </div>
                  <span>{rankingStats.tasteStatuses.SECOND_CHANCE || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                    <span>Dissatisfied</span>
                  </div>
                  <span>{rankingStats.tasteStatuses.DISSATISFIED || 0}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleOpenRankingDialog}
            className="w-full"
            disabled={!isAuthenticated}
          >
            {userRanking ? 'Update Your Ranking' : 'Rank This Dish'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderUserRanking = (): React.ReactNode => {
    if (!userRanking) return null;

    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Your Ranking</CardTitle>
          <CardDescription>
            {userRanking.created_at
              ? `Ranked on ${new Date(userRanking.created_at).toLocaleDateString()}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userRanking.rank && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {userRanking.rank}
                </Badge>
                <span>Rank {userRanking.rank}</span>
              </div>
            )}
            {userRanking.taste_status && (
              <div className="flex items-center gap-2">
                {userRanking.taste_status === 'ACCEPTABLE' && (
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                )}
                {userRanking.taste_status === 'SECOND_CHANCE' && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                {userRanking.taste_status === 'DISSATISFIED' && (
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                )}
                <span>{userRanking.taste_status}</span>
              </div>
            )}
            <div className="mt-2">
              <h4 className="text-sm font-medium">Notes:</h4>
              <p className="text-sm text-gray-500">{userRanking.notes}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleOpenRankingDialog}
            variant="outline"
            className="w-full"
          >
            Update Ranking
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderRankingStats()}
      {userRanking && renderUserRanking()}

      <Dialog open={showRankingDialog} onOpenChange={setShowRankingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rank {dishName}</DialogTitle>
            <DialogDescription>
              Share your professional assessment of this dish at{' '}
              {restaurantName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex space-x-4">
              <Button
                variant={rankingType === 'rank' ? 'default' : 'outline'}
                onClick={() => handleRankingTypeChange('rank')}
                className="flex-1"
              >
                <Star className="mr-2 h-4 w-4" />
                Rank (1-5)
              </Button>
              <Button
                variant={rankingType === 'taste' ? 'default' : 'outline'}
                onClick={() => handleRankingTypeChange('taste')}
                className="flex-1"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Taste Status
              </Button>
            </div>

            {rankingType === 'rank' && (
              <div className="space-y-2">
                <Label>Select a rank (1 is the best)</Label>
                <RadioGroup
                  value={selectedRank?.toString() || ''}
                  onValueChange={(value: string) =>
                    setSelectedRank(parseInt(value))
                  }
                  className="flex space-x-2"
                >
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center space-x-1">
                      <RadioGroupItem
                        value={rank.toString()}
                        id={`rank-${rank}`}
                      />
                      <Label htmlFor={`rank-${rank}`}>{rank}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {rankingType === 'taste' && (
              <div className="space-y-2">
                <Label>Select a taste status</Label>
                <RadioGroup
                  value={selectedTasteStatus || ''}
                  onValueChange={setSelectedTasteStatus}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ACCEPTABLE" id="taste-acceptable" />
                    <Label
                      htmlFor="taste-acceptable"
                      className="flex items-center"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                      Acceptable
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="SECOND_CHANCE"
                      id="taste-second-chance"
                    />
                    <Label
                      htmlFor="taste-second-chance"
                      className="flex items-center"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                      Second Chance
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="DISSATISFIED"
                      id="taste-dissatisfied"
                    />
                    <Label
                      htmlFor="taste-dissatisfied"
                      className="flex items-center"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                      Dissatisfied
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Professional Notes (required)</Label>
              <Textarea
                id="notes"
                placeholder="Share your professional assessment of this dish..."
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos (required)</Label>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePhotoUpload}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button variant="outline" onClick={handlePhotoUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photoUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-md overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`Photo ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseRankingDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRanking} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ranking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DishRanking;
