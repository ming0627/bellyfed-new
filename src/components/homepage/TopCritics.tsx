import React from 'react';
import { Award } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

interface TopReviewer {
  name: string;
  avatar: string;
  reviews: number;
  highlight?: boolean;
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
    <section className="mb-12">
      <div className="flex items-center mb-4">
        <LucideClientIcon icon={Award} className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-bold">Top Food Critics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topReviewers.map((reviewer, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-md p-4 ${
              reviewer.highlight ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center mb-3">
              <img
                src={reviewer.avatar}
                alt={reviewer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="font-semibold">{reviewer.name}</h3>
                <p className="text-sm text-gray-500">
                  {reviewer.reviews} reviews
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {reviewer.badges.map((badge, badgeIndex) => (
                <div
                  key={badgeIndex}
                  className="flex items-center bg-gray-50 p-2 rounded"
                >
                  <span className="text-lg mr-2" aria-hidden="true">
                    {badge.icon}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.tooltip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
