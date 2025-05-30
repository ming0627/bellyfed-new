// STEP 4: ADD BASIC DATA DISPLAY
import React from 'react';

function TopCritics({ topReviewers }) {
  // Basic prop validation/safety checks
  if (!topReviewers || !Array.isArray(topReviewers)) {
    return (
      <div>
        <h2>Top Food Critics</h2>
        <p>No reviewers data available.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Top Food Critics</h2>
      <p>Displaying {topReviewers.length} reviewers:</p>

      {/* Basic data display - names and review counts only */}
      <div>
        {topReviewers.map((reviewer, index) => {
          // Safe property access with fallbacks
          const name = reviewer?.name || `Reviewer ${index + 1}`;
          const reviews = reviewer?.reviews || 0;

          return (
            <div key={index}>
              <h3>{name}</h3>
              <p>{reviews} reviews</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopCritics;
