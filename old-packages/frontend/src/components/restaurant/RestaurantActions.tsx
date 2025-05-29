import { MapPin, Share, MessageSquare, MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface RestaurantActionsProps {
  onBookTable: () => void;
}

export const RestaurantActions = ({
  onBookTable,
}: RestaurantActionsProps): JSX.Element => {
  return (
    <div className="mt-6 flex gap-4">
      <Button variant="outline" className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Direction
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <Share className="w-4 h-4" />
        Share
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Reviews
      </Button>
      <Button
        variant="default"
        className="flex items-center gap-2 bg-blue-600"
        onClick={onBookTable}
      >
        <MenuIcon className="w-4 h-4" />
        Book a table
      </Button>
    </div>
  );
};
