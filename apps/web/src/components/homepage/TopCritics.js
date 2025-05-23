import React, { memo } from 'react';
import Image from 'next/image';
import { Award } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * TopCritics component displays a grid of top food critics with their badges and achievements.
 *
 * @param {Object} props - Component props
 * @param {Array} props.topReviewers - Array of top reviewer objects
 * @returns {JSX.Element} - Rendered component
 */
export const TopCritics = memo(function TopCritics({ topReviewers }) {
  // Early return if no reviewers are provided
  if (!topReviewers || topReviewers.length === 0) {
    return null;
  }

  return (
    <section className="mb-12" aria-labelledby="top-critics-heading">
      <div className="flex items-center mb-4">
        <LucideClientIcon
          icon={Award}
          className="w-5 h-5 text-yellow-500 mr-2"
          aria-hidden="true"
        />
        <h2 id="top-critics-heading" className="text-xl font-bold">
          Top Food Critics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topReviewers.map((reviewer, index) => (
          <div
            key={`reviewer-${reviewer.name}-${index}`}
            className={`bg-white rounded-lg shadow-md p-4 ${
              reviewer.highlight ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center mb-3">
              {reviewer.avatar ? (
                <Image
                  src={reviewer.avatar}
                  alt={`${reviewer.name}'s profile`}
                  width={48}
                  height={48}
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    {reviewer.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <h3 className="font-semibold">{reviewer.name}</h3>
                <p className="text-sm text-gray-500">
                  {reviewer.reviews.toLocaleString()} reviews
                </p>
              </div>
            </div>

            {reviewer.badges && reviewer.badges.length > 0 && (
              <div className="space-y-2">
                {reviewer.badges.map((badge, badgeIndex) => (
                  <div
                    key={`badge-${badgeIndex}`}
                    className="flex items-center bg-gray-50 p-2 rounded"
                    title={badge.tooltip}
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

// Default export for easier imports
export default TopCritics;
