import { Trophy } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TopReviewer {
  name: string;
  avatar: string;
  reviews: number;
  highlight: boolean;
  badges: {
    type: 'reviewer' | 'expertise' | 'regional' | 'fineDining' | 'michelin';
    name: string;
    icon: string;
    tooltip: string;
    category?: string;
    region?: string;
    level?: 'junior' | 'regular' | 'senior' | 'lead' | 'director';
    reviewCount?: number;
  }[];
}

interface TopCriticsProps {
  topReviewers: TopReviewer[];
}

export function TopCritics({ topReviewers }: TopCriticsProps): JSX.Element {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top Food Critics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topReviewers.map((reviewer) => (
            <Card key={reviewer.name} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={reviewer.avatar}
                      alt={reviewer.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{reviewer.name}</h3>
                    <p className="text-gray-600">{reviewer.reviews} reviews</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reviewer.badges.map((badge, badgeIndex) => (
                        <TooltipProvider key={badgeIndex}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="cursor-help transition-colors hover:bg-gray-100"
                              >
                                {badge.icon} {badge.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{badge.tooltip}</p>
                              {badge.category && (
                                <p>Category: {badge.category}</p>
                              )}
                              {badge.region && <p>Region: {badge.region}</p>}
                              {badge.level && (
                                <p>
                                  Level:{' '}
                                  {badge.level.charAt(0).toUpperCase() +
                                    badge.level.slice(1)}
                                </p>
                              )}
                              {badge.reviewCount && (
                                <p>Reviews: {badge.reviewCount}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
