import { Trophy } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RankingCategory, RestaurantRanking } from '@/types';

interface RankingsSectionProps {
  rankings: RestaurantRanking[];
  totalVotes: number;
}

export function RankingsSection({
  rankings,
  totalVotes,
}: RankingsSectionProps): JSX.Element {
  const topRanking = rankings.find((r) => r.category === RankingCategory.TOP);
  const otherRankings = rankings.filter(
    (r) => r.category !== RankingCategory.TOP,
  );

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-red-50">
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Overall Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {rankings.length > 0 ? (
            <>
              {topRanking && (
                <div className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500 text-white font-bold text-lg"
                      >
                        #{topRanking.rankPosition}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {topRanking.cuisineType}
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on {totalVotes} votes
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500 text-white"
                  >
                    Top {topRanking.rankPosition}
                  </Badge>
                </div>
              )}

              {otherRankings.map((ranking, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                      <Trophy className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {ranking.cuisineType}
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on {totalVotes} votes
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-500 text-white"
                  >
                    Rank {ranking.rankPosition}
                  </Badge>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No rankings available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
