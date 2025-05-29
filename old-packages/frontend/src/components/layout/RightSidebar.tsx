import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Define the FoodCategory interface
interface FoodCategory {
  id: string;
  name: string;
  count?: number;
}

interface RightSidebarProps {
  foodCategories: FoodCategory[];
}

export function RightSidebar({
  foodCategories,
}: RightSidebarProps): JSX.Element {
  return (
    <aside className="hidden xl:block w-64 overflow-y-auto bg-card border-l border-border p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Reviewers</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={`https://source.unsplash.com/random/100x100?face&${
                      i + 30
                    }`}
                    alt={`Top Reviewer ${i + 1}`}
                  />
                  <AvatarFallback>TR{i + 1}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">GourmetGuru{i + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {100 - i * 10} reviews
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground"
              >
                {i + 1}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Trending Categories</h2>
        <div className="flex flex-wrap gap-2">
          {foodCategories.map((category) => (
            <Badge
              key={category.name}
              variant="outline"
              className="bg-primary text-primary-foreground border-none"
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
}
