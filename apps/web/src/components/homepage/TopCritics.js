// STEP 7: NEXT.JS IMAGE WORKING - FINAL SOLUTION
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

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Top Food Critics
      </h2>
      <p className="text-gray-600 mb-4">
        Displaying {topReviewers.length} reviewers:
      </p>

      {/* Basic data display with minimal styling */}
      <div className="space-y-4">
        {topReviewers.map((reviewer, index) => {
          // Safe property access with fallbacks
          const name = reviewer?.name || `Reviewer ${index + 1}`;
          const reviews = reviewer?.reviews || 0;

          return (
            <div key={index} className="border-b pb-2 flex items-center gap-3">
              <Image
                src={reviewer?.avatar || '/placeholder-avatar.jpg'}
                alt={`${name} avatar`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-gray-600">{reviews} reviews</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopCritics;
