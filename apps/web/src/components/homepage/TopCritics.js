// STEP 10: ENHANCED VISUAL FEEDBACK - CLICK ANIMATIONS
import React from 'react';
import ImageModule from 'next/image';
import { Trophy } from 'lucide-react';

// Solution for Next.js 15.x: Extract the actual Image component from default property
// This is required because Next.js 15.x exports Image as { default: Component, getImageProps: Function }
const Image = ImageModule.default;

function TopCritics({ topReviewers }) {
  // Basic prop validation/safety checks
  if (!topReviewers || !Array.isArray(topReviewers)) {
    return (
      <div className="py-4">
        <h2 className="text-xl font-semibold mb-2">Top Food Critics</h2>
        <p className="text-gray-600">No reviewers data available.</p>
      </div>
    );
  }

  // Step 9: Simple click handler for reviewer interaction
  const handleReviewerClick = (reviewer, rank) => {
    const name = reviewer?.name || `Reviewer ${rank}`;
    const reviews = reviewer?.reviews || 0;
    alert(
      `Clicked on ${name}\nRank: #${rank}\nReviews: ${reviews.toLocaleString()}`,
    );
  };

  return (
    <div className="py-6 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
        <Trophy className="w-6 h-6 text-orange-500" />
        Top Food Critics
      </h2>

      {/* Enhanced data display with improved styling */}
      <div className="space-y-4">
        {topReviewers.map((reviewer, index) => {
          // Safe property access with fallbacks
          const name = reviewer?.name || `Reviewer ${index + 1}`;
          const reviews = reviewer?.reviews || 0;

          return (
            <div
              key={index}
              onClick={() => handleReviewerClick(reviewer, index + 1)}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-150 border border-transparent hover:border-gray-200 cursor-pointer active:scale-95 active:shadow-sm"
            >
              <div className="relative">
                <Image
                  src={reviewer?.avatar || '/placeholder-avatar.jpg'}
                  alt={`${name} avatar`}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-orange-100"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  {reviews.toLocaleString()} reviews
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-600">
                    Rank #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopCritics;
