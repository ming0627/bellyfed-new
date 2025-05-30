// STEP 3: ADD PROPS HANDLING
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
      <p>Received {topReviewers.length} reviewers from props.</p>
    </div>
  );
}

export default TopCritics;
