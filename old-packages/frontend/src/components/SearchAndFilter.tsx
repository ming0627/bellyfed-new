// components/SearchAndFilter.tsx
import { Search } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFilterProps {
  searchRestaurant: string;
  setSearchRestaurant: React.Dispatch<React.SetStateAction<string>>;
  quickFilter: string;
  setQuickFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchRestaurant,
  setSearchRestaurant,
  quickFilter,
  setQuickFilter,
}) => {
  return (
    <div className="mb-6 flex space-x-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search restaurants"
          value={searchRestaurant}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchRestaurant(e.target.value)
          }
        />
      </div>
      <Select
        value={quickFilter}
        onValueChange={(value: string) => setQuickFilter(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="top">Top 5</SelectItem>
          <SelectItem value="Dissatisfied">Dissatisfied</SelectItem>
          <SelectItem value="Second Chance">Second Chance</SelectItem>
          <SelectItem value="Plan to Visit">Plan to Visit</SelectItem>
          <SelectItem value="visited">Visited</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
