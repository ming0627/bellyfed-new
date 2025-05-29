import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Edit,
  MapPin,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCountry } from '@/contexts/CountryContext';

interface RankingCardProps {
  ranking: {
    id: string;
    dishId: string;
    dishName: string;
    dishSlug: string;
    restaurantId: string;
    restaurantName: string;
    restaurantAddress?: string;
    rank?: number | null;
    tasteStatus?: string | null;
    notes: string;
    photoUrls: string[];
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RankingCard({
  ranking,
  onEdit,
  onDelete,
}: RankingCardProps): JSX.Element {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { currentCountry } = useCountry();

  const formattedDate = formatDistanceToNow(new Date(ranking.createdAt), {
    addSuffix: true,
  });

  const getRankBadge = (): React.ReactElement | null => {
    if (ranking.rank) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
          Rank {ranking.rank}
        </Badge>
      );
    }

    if (ranking.tasteStatus === 'ACCEPTABLE') {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <ThumbsUp className="h-3 w-3 text-green-500 mr-1" />
          Acceptable
        </Badge>
      );
    }

    if (ranking.tasteStatus === 'SECOND_CHANCE') {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
          Second Chance
        </Badge>
      );
    }

    if (ranking.tasteStatus === 'DISSATISFIED') {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <ThumbsDown className="h-3 w-3 text-red-500 mr-1" />
          Dissatisfied
        </Badge>
      );
    }

    return null;
  };

  const handleDelete = (): void => {
    setIsDeleteDialogOpen(false);
    onDelete?.();
  };

  const openPhotoGallery = (index: number): void => {
    setCurrentPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            <Link
              href={`/${currentCountry.code}/dish/${ranking.dishSlug}`}
              className="hover:text-amber-600 transition-colors"
            >
              {ranking.dishName}
            </Link>
          </h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <Link
              href={`/${currentCountry.code}/restaurant/${ranking.restaurantId}`}
              className="hover:text-amber-600 transition-colors"
            >
              {ranking.restaurantName}
            </Link>
          </div>
          {ranking.restaurantAddress && (
            <p className="text-xs text-gray-500 mt-1 ml-4">
              {ranking.restaurantAddress}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">{getRankBadge()}</div>
      </CardHeader>

      <CardContent className="p-4">
        <p className="text-gray-700 text-sm mb-4">{ranking.notes}</p>

        {ranking.photoUrls && ranking.photoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {ranking.photoUrls.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="aspect-square relative rounded-md overflow-hidden cursor-pointer"
                onClick={() => openPhotoGallery(index)}
              >
                <Image
                  src={url}
                  alt={`Photo ${index + 1} of ${ranking.dishName}`}
                  fill
                  className="object-cover"
                />
                {ranking.photoUrls.length > 3 && index === 2 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                    +{ranking.photoUrls.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500">{formattedDate}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}

        {onDelete && (
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Ranking</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your ranking for{' '}
                  {ranking.dishName} at {ranking.restaurantName}? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>

      {/* Photo Gallery Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="relative aspect-video">
            {ranking.photoUrls && ranking.photoUrls.length > 0 && (
              <Image
                src={ranking.photoUrls[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1} of ${ranking.dishName}`}
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {currentPhotoIndex + 1} of {ranking.photoUrls.length}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPhotoIndex((prev) =>
                    prev === 0 ? ranking.photoUrls.length - 1 : prev - 1,
                  )
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPhotoIndex((prev) =>
                    prev === ranking.photoUrls.length - 1 ? 0 : prev + 1,
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
