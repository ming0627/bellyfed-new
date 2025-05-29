import { Trophy } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { RankingCategory, RestaurantRanking, S3Object } from '@/types';
import { getImageUrl } from '@/utils/image';

interface HeroSectionProps {
  name: string;
  description?: string;
  image?: S3Object;
  ranking?: RestaurantRanking;
}

export function HeroSection({
  name,
  description,
  image,
  ranking,
}: HeroSectionProps): JSX.Element {
  const rankingBadge =
    ranking &&
    (ranking.category === RankingCategory.TOP ? (
      <Badge variant="secondary" className="bg-red-600 text-white">
        #{ranking.rankPosition} in {ranking.cuisineType} Restaurants
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-600 text-white">
        {ranking.category}
      </Badge>
    ));

  return (
    <div className="relative h-[200px] sm:h-[250px] md:h-[300px]">
      <div className="relative h-full content-container">
        <Image
          src={getImageUrl(image)}
          alt={`${name} hero image`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className="px-4 sm:px-6 pb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {name}
            </h1>
            {description && (
              <p className="text-sm sm:text-base opacity-90 mb-2">
                {description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
              {rankingBadge}
              {ranking && (
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {ranking.category === RankingCategory.TOP
                      ? 'Top Ranked'
                      : ranking.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
