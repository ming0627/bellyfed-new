import {
  AlertTriangle,
  MapPin,
  Search,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoUploader } from '@/components/ui/photo-uploader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRestaurantSearch } from '@/hooks/useRestaurant';
import { Restaurant } from '@/types/restaurant';
// Custom toast
interface RankingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dishId: string;
  dishName: string;
  restaurantId?: string;
  restaurantName?: string;
  dishType: string;
  initialRanking?: {
    rankingId?: string;
    rank?: number | null;
    tasteStatus?: string | null;
    notes?: string;
    photoUrls?: string[];
    restaurantId?: string;
    restaurantName?: string;
  };
  onSubmit: (data: {
    rank: number | null;
    tasteStatus: string | null;
    notes: string;
    photoUrls: string[];
    restaurantId: string;
    restaurantName: string;
  }) => Promise<void>;
}

export function RankingDialog({
  open,
  onOpenChange,
  dishName,
  restaurantId: initialRestaurantId,
  restaurantName: initialRestaurantName,
  initialRanking,
  onSubmit,
}: RankingDialogProps): React.ReactElement {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rankingType, setRankingType] = useState<'rank' | 'taste'>(
    initialRanking?.rank
      ? 'rank'
      : initialRanking?.tasteStatus
        ? 'taste'
        : 'rank',
  );
  const [selectedRank, setSelectedRank] = useState<number | null>(
    initialRanking?.rank || null,
  );
  const [selectedTasteStatus, setSelectedTasteStatus] = useState<string | null>(
    initialRanking?.tasteStatus || null,
  );
  const [notes, setNotes] = useState(initialRanking?.notes || '');
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    initialRanking?.photoUrls || [],
  );

  // Restaurant selection
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    initialRanking?.restaurantId || initialRestaurantId || '',
  );
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>(
    initialRanking?.restaurantName || initialRestaurantName || '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestaurantSearch, setShowRestaurantSearch] = useState(false);

  const { searchResults, isSearching, searchRestaurants, hasMore, loadMore } =
    useRestaurantSearch();

  // Search for restaurants when query changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchRestaurants({ query: searchQuery });
    }
  }, [searchQuery, searchRestaurants]);

  const handleRankingTypeChange = (type: 'rank' | 'taste'): void => {
    setRankingType(type);
    if (type === 'rank') {
      setSelectedTasteStatus(null);
    } else {
      setSelectedRank(null);
    }
  };

  const handleRestaurantSelect = (restaurant: Restaurant): void => {
    setSelectedRestaurantId(restaurant.restaurantId);
    setSelectedRestaurantName(restaurant.name);
    setShowRestaurantSearch(false);
  };

  const handlePhotoAdded = (photoUrl: string): void => {
    setPhotoUrls([...photoUrls, photoUrl]);
  };

  const handlePhotoRemoved = (photoUrl: string): void => {
    setPhotoUrls(photoUrls.filter((url) => url !== photoUrl));
  };

  const handleSubmit = async () => {
    // Validate form
    if (rankingType === 'rank' && selectedRank === null) {
      toast({
        title: 'Validation Error',
        description: 'Please select a rank',
        variant: 'destructive',
      });
      return;
    }

    if (rankingType === 'taste' && selectedTasteStatus === null) {
      toast({
        title: 'Validation Error',
        description: 'Please select a taste status',
        variant: 'destructive',
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please add some notes',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRestaurantId || !selectedRestaurantName) {
      toast({
        title: 'Validation Error',
        description: 'Please select a restaurant',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rank: rankingType === 'rank' ? selectedRank : null,
        tasteStatus: rankingType === 'taste' ? selectedTasteStatus : null,
        notes,
        photoUrls,
        restaurantId: selectedRestaurantId,
        restaurantName: selectedRestaurantName,
      });

      toast({
        title: initialRanking?.rankingId
          ? 'Ranking updated'
          : 'Ranking created',
        description: `Your ranking for ${dishName} at ${selectedRestaurantName} has been ${initialRanking?.rankingId ? 'updated' : 'saved'}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting ranking:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit ranking',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-amber-50 to-white">
        <DialogHeader className="pb-2 border-b border-amber-100">
          <DialogTitle className="text-xl font-bold text-amber-900">
            {initialRanking?.rankingId ? 'Edit' : 'Create'} Ranking for{' '}
            {dishName}
          </DialogTitle>
          <DialogDescription className="text-amber-800">
            Share your assessment of this dish
            {selectedRestaurantName ? ` at ${selectedRestaurantName}` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-5">
          {/* Restaurant Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-amber-900">
              Restaurant
            </Label>
            {selectedRestaurantId && selectedRestaurantName ? (
              <div className="flex items-center justify-between border border-amber-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="font-medium">{selectedRestaurantName}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => setShowRestaurantSearch(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-14 border-amber-200 bg-white hover:bg-amber-50 shadow-sm"
                onClick={() => setShowRestaurantSearch(true)}
              >
                <Search className="h-5 w-5 mr-2 text-amber-600" />
                <span className="font-medium">Select Restaurant</span>
              </Button>
            )}

            {showRestaurantSearch && (
              <div className="border border-amber-200 rounded-lg p-4 space-y-4 bg-white shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <Input
                      placeholder="Search restaurants..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-10 border-amber-200 focus:ring-amber-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => setShowRestaurantSearch(false)}
                  >
                    Cancel
                  </Button>
                </div>

                {isSearching ? (
                  <div className="text-center py-6">
                    <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-amber-700 mt-3 font-medium">
                      Searching restaurants...
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ScrollArea className="h-[250px] rounded-md">
                    <div className="space-y-3 pr-3">
                      {searchResults.map((restaurant) => (
                        <div
                          key={restaurant.restaurantId}
                          className="border border-amber-100 rounded-lg p-3 cursor-pointer bg-white hover:bg-amber-50 transition-colors shadow-sm hover:shadow-md"
                          onClick={() => handleRestaurantSelect(restaurant)}
                        >
                          <div className="font-medium text-amber-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-amber-700 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 text-amber-500" />
                            {restaurant.address}
                          </div>
                        </div>
                      ))}
                      {hasMore && (
                        <Button
                          variant="ghost"
                          className="w-full text-sm text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                          onClick={loadMore}
                        >
                          Load more results
                        </Button>
                      )}
                    </div>
                  </ScrollArea>
                ) : searchQuery.length >= 3 ? (
                  <div className="text-center py-6 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700">
                      No restaurants found. Try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700">
                      Enter at least 3 characters to search
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ranking Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-amber-900">
              Rating Type
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={rankingType === 'rank' ? 'default' : 'outline'}
                onClick={() => handleRankingTypeChange('rank')}
                className={`flex-1 h-14 ${
                  rankingType === 'rank'
                    ? 'bg-orange-400 hover:bg-orange-500 shadow-md'
                    : 'border-amber-200 text-amber-700 hover:bg-amber-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-medium">Rank (1-5)</span>
                </div>
              </Button>
              <Button
                variant={rankingType === 'taste' ? 'default' : 'outline'}
                onClick={() => handleRankingTypeChange('taste')}
                className={`flex-1 h-14 ${
                  rankingType === 'taste'
                    ? 'bg-orange-400 hover:bg-orange-500 shadow-md'
                    : 'border-amber-200 text-amber-700 hover:bg-amber-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  <span className="font-medium">Taste Status</span>
                </div>
              </Button>
            </div>
          </div>

          {rankingType === 'rank' && (
            <div className="space-y-3 bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
              <Label className="text-sm font-medium text-amber-900">
                Select a rank (1 is the best)
              </Label>
              <RadioGroup
                value={selectedRank?.toString() || ''}
                onValueChange={(value: string) =>
                  setSelectedRank(parseInt(value))
                }
              >
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div
                      key={rank}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedRank === rank
                          ? 'bg-amber-50 border-amber-300'
                          : 'border-amber-200 hover:bg-amber-50 bg-white'
                      }`}
                      onClick={() => setSelectedRank(rank)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                          selectedRank === rank
                            ? 'bg-orange-400 text-white'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rank}
                      </div>
                      <RadioGroupItem
                        value={rank.toString()}
                        id={`rank-${rank}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`rank-${rank}`}
                        className={`text-xs font-medium ${
                          selectedRank === rank
                            ? 'text-amber-800'
                            : 'text-amber-600'
                        }`}
                      >
                        {rank === 1
                          ? 'Best'
                          : rank === 5
                            ? 'Worst'
                            : `Rank ${rank}`}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {rankingType === 'taste' && (
            <div className="space-y-3 bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
              <Label className="text-sm font-medium text-amber-900">
                Select a taste status
              </Label>
              <RadioGroup
                value={selectedTasteStatus || ''}
                onValueChange={setSelectedTasteStatus}
                className="grid grid-cols-1 gap-3"
              >
                <div
                  className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    selectedTasteStatus === 'ACCEPTABLE'
                      ? 'bg-green-50 border-green-300 shadow-sm'
                      : 'border-amber-100 hover:bg-amber-50'
                  }`}
                  onClick={() => setSelectedTasteStatus('ACCEPTABLE')}
                >
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedTasteStatus === 'ACCEPTABLE'
                        ? 'bg-green-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        selectedTasteStatus === 'ACCEPTABLE'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem
                      value="ACCEPTABLE"
                      id="taste-acceptable"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="taste-acceptable"
                      className="font-medium text-amber-900"
                    >
                      Acceptable
                    </Label>
                    <p className="text-xs text-amber-700 mt-1">
                      The dish met or exceeded expectations
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    selectedTasteStatus === 'SECOND_CHANCE'
                      ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                      : 'border-amber-100 hover:bg-amber-50'
                  }`}
                  onClick={() => setSelectedTasteStatus('SECOND_CHANCE')}
                >
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedTasteStatus === 'SECOND_CHANCE'
                        ? 'bg-yellow-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        selectedTasteStatus === 'SECOND_CHANCE'
                          ? 'text-yellow-600'
                          : 'text-amber-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem
                      value="SECOND_CHANCE"
                      id="taste-second-chance"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="taste-second-chance"
                      className="font-medium text-amber-900"
                    >
                      Second Chance
                    </Label>
                    <p className="text-xs text-amber-700 mt-1">
                      The dish was okay but could be better
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    selectedTasteStatus === 'DISSATISFIED'
                      ? 'bg-red-50 border-red-300 shadow-sm'
                      : 'border-amber-100 hover:bg-amber-50'
                  }`}
                  onClick={() => setSelectedTasteStatus('DISSATISFIED')}
                >
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      selectedTasteStatus === 'DISSATISFIED'
                        ? 'bg-red-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    <ThumbsDown
                      className={`h-5 w-5 ${
                        selectedTasteStatus === 'DISSATISFIED'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem
                      value="DISSATISFIED"
                      id="taste-dissatisfied"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="taste-dissatisfied"
                      className="font-medium text-amber-900"
                    >
                      Dissatisfied
                    </Label>
                    <p className="text-xs text-amber-700 mt-1">
                      The dish did not meet expectations
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-amber-900"
            >
              Notes
            </Label>
            <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
              <Textarea
                id="notes"
                placeholder="Share your thoughts about this dish..."
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                rows={4}
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 resize-none bg-gray-900 text-white"
              />
              <p className="text-xs text-orange-600 mt-2">
                Describe the flavors, textures, presentation, and overall
                experience with this dish.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
              <PhotoUploader
                photos={photoUrls}
                maxPhotos={5}
                onPhotoAdded={handlePhotoAdded}
                onPhotoRemoved={handlePhotoRemoved}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-amber-100 pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-amber-200 text-amber-700 hover:bg-amber-50 bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-orange-400 hover:bg-orange-500 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                <span>
                  {initialRanking?.rankingId ? 'Updating...' : 'Saving...'}
                </span>
              </div>
            ) : (
              <>
                {initialRanking?.rankingId ? 'Update Ranking' : 'Save Ranking'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
