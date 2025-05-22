import React, { useState, memo } from 'react';
import { useRouter } from 'next/router';
import { Star, Camera, X, AlertTriangle } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';
import Link from 'next/link';
import Image from 'next/image';

/**
 * ReviewForm component for submitting reviews for restaurants and dishes
 *
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {Object} props.dish - Optional dish data object
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @param {Function} props.onSubmit - Function to handle form submission
 * @returns {JSX.Element} - Rendered component
 */
const ReviewForm = memo(function ReviewForm({
  restaurant,
  dish,
  getCountryLink,
  onSubmit,
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle rating change
  const handleRatingChange = value => {
    setRating(value);
    if (errors.rating) {
      setErrors({ ...errors, rating: null });
    }
  };

  // Handle review text change
  const handleReviewTextChange = e => {
    setReviewText(e.target.value);
    if (errors.reviewText) {
      setErrors({ ...errors, reviewText: null });
    }
  };

  // Handle photo upload
  const handlePhotoUpload = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // In a real app, this would upload the files to a server
    // For now, we'll just create object URLs for preview
    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      url: URL.createObjectURL(file),
      file,
    }));

    setPhotos([...photos, ...newPhotos]);
  };

  // Handle photo removal
  const handleRemovePhoto = photoId => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Please enter your review';
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would call an API to submit the review
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the onSubmit callback with the review data
      if (onSubmit) {
        onSubmit({
          rating,
          reviewText,
          photos,
          restaurantId: restaurant.id,
          dishId: dish?.id,
        });
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirmation close
  const handleConfirmationClose = () => {
    // Navigate back to the restaurant page
    router.push(getCountryLink(`/restaurants/${restaurant.id}`));
  };

  // If confirmation is shown, display a success message
  if (showConfirmation) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <LucideClientIcon icon={Star} className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Review Submitted Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for sharing your experience. Your review will help others
          discover great food.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleConfirmationClose}
            className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Back to Restaurant
          </button>
          <Link
            href={getCountryLink('/profile')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            View My Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Write a Review
        </h2>
        <div className="mt-2">
          <Link
            href={getCountryLink(`/restaurants/${restaurant.id}`)}
            className="text-lg font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            {restaurant.name}
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {restaurant.location}
          </div>
        </div>

        {dish && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md">
            <div className="flex items-center">
              <div className="w-12 h-12 flex-shrink-0 relative">
                <Image
                  src={dish.imageUrl}
                  alt={dish.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                  loading="lazy"
                />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-gray-900 dark:text-white">
                  {dish.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dish.price}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
            Your Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingChange(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
                aria-label={`Rate ${value} stars`}
              >
                <LucideClientIcon
                  icon={Star}
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {rating > 0 ? (
                <>
                  <span className="font-medium">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                </>
              ) : (
                'Select a rating'
              )}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label
            htmlFor="reviewText"
            className="block text-lg font-medium text-gray-900 dark:text-white mb-2"
          >
            Your Review
          </label>
          <textarea
            id="reviewText"
            rows={6}
            placeholder="Share your experience with this restaurant. What did you like or dislike? Would you recommend it to others?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={reviewText}
            onChange={handleReviewTextChange}
          />
          {errors.reviewText && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.reviewText}
            </p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-900 dark:text-white mb-2">
            Add Photos
          </label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="relative group w-20 h-20 rounded-md overflow-hidden shadow-sm"
              >
                <Image
                  src={photo.url}
                  alt={`Uploaded photo ${photo.id}`}
                  layout="fill"
                  objectFit="cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove photo"
                >
                  <LucideClientIcon icon={X} className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <LucideClientIcon
                icon={Camera}
                className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-1"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Add Photo
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You can upload up to 5 photos. Max size: 5MB each.
          </p>
        </div>

        {/* Guidelines */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start">
            <LucideClientIcon
              icon={AlertTriangle}
              className="w-5 h-5 text-yellow-500 mr-2 mt-0.5"
            />
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                Review Guidelines
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Be honest and respectful in your review</li>
                <li>Focus on your personal experience</li>
                <li>Avoid offensive language or personal attacks</li>
                <li>Don&apos;t include personal information or contact details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReviewForm;
