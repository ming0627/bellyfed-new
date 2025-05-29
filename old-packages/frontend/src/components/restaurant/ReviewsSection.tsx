import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { reviewService } from '@/services/reviewService';
import { Review } from '@/types';

interface ReviewsSectionProps {
  restaurantId: string;
}

export function ReviewsSection({
  restaurantId,
}: ReviewsSectionProps): JSX.Element {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadReviews = useCallback(async () => {
    const restaurantReviews = await reviewService.getReviews(restaurantId);
    setReviews(restaurantReviews);
  }, [restaurantId]);

  useEffect(() => {
    loadReviews();
  }, [restaurantId, loadReviews]);

  const filteredReviews =
    selectedCategory === 'all'
      ? reviews
      : reviews.filter((review) => review.dishName === selectedCategory);

  const categories = [
    { id: '1', name: 'Ramen' },
    { id: '2', name: 'Sushi' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All Reviews
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{review.dishName}</h3>
                <p className="text-gray-600">{review.comment}</p>
              </div>
              <div className="bg-yellow-100 px-2 py-1 rounded">
                Rating: {review.rating}/5
              </div>
            </div>
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <p className="text-gray-500 text-center py-4">No reviews found</p>
        )}
      </div>
    </div>
  );
}
