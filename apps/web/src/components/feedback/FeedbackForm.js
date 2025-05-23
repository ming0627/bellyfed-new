/**
 * Feedback Form Component
 * 
 * Collects user feedback with rating and comments.
 */

import React, { useState } from 'react';
import { Card, Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const FeedbackForm = ({
  onSubmit,
  showRating = true,
  placeholder = "Share your feedback...",
  className = ''
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { trackUserEngagement } = useAnalyticsContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ rating, comment });
    }
    setSubmitted(true);
    trackUserEngagement('feedback', 'submit', 'form', { rating, hasComment: !!comment });
  };

  if (submitted) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-green-600">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
          <p className="text-gray-600">Your feedback has been submitted.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>
        
        {showRating && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <Button
          type="submit"
          disabled={!comment.trim() && (!showRating || rating === 0)}
          className="w-full"
        >
          Submit Feedback
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;
