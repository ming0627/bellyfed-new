/**
 * ReviewCardExample
 * 
 * This is an example of how to use the ReviewCard component.
 * It demonstrates how to display restaurant reviews with different configurations.
 */

import React, { useState } from 'react';
import ReviewCard from '../components/restaurant/ReviewCard.js';
import Layout from '../components/layout/Layout.js';
import { useCountry } from '@bellyfed/hooks';

/**
 * Example of using the ReviewCard component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const ReviewCardExample = () => {
  const { currentCountry } = useCountry();
  
  // Generate country-specific links
  const getCountryLink = (path) => {
    if (!currentCountry) return path;
    return `/${currentCountry.code}${path}`;
  };
  
  // Sample review data
  const sampleReviews = [
    {
      id: 'review1',
      userId: 'user1',
      userName: 'Sarah Lee',
      userProfilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5,
      title: 'Best dining experience in months!',
      content: 'I had an absolutely wonderful experience at this restaurant. The ambiance was perfect for a date night, with dim lighting and soft music playing in the background. The service was impeccable - our waiter was attentive without being intrusive, and he had excellent recommendations for both food and wine pairings. Now, let\'s talk about the food. The appetizers were delightful, especially the truffle arancini which had the perfect crispy exterior and creamy interior. For the main course, I had the pan-seared salmon with a lemon butter sauce that was cooked to perfection - crispy skin and moist, flaky flesh. My partner had the filet mignon, which was tender and flavorful. The dessert, a chocolate soufflé, was the perfect end to a perfect meal. I would highly recommend this restaurant to anyone looking for a special dining experience.',
      visitDate: '2023-06-15T08:30:00Z',
      createdAt: '2023-06-16T10:15:00Z',
      isVerifiedVisit: true,
      helpfulCount: 12,
      comments: 3,
      isHelpful: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', caption: 'Salmon dish' },
        { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80', caption: 'Steak' },
        { url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80', caption: 'Dessert' },
      ],
      dishRatings: [
        { dishId: 'dish1', dishName: 'Truffle Arancini', rating: 5 },
        { dishId: 'dish2', dishName: 'Pan-Seared Salmon', rating: 5 },
        { dishId: 'dish3', dishName: 'Chocolate Soufflé', rating: 4 },
      ],
      categoryRatings: {
        food: 5,
        service: 5,
        ambience: 4,
        value: 4,
      },
    },
    {
      id: 'review2',
      userId: 'user2',
      userName: 'John Tan',
      userProfilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 3,
      title: 'Decent food but slow service',
      content: 'The food was pretty good, but the service was quite slow. We waited almost 30 minutes for our appetizers and another 45 minutes for our main courses. The restaurant wasn\'t even that busy, so I\'m not sure what caused the delay. The flavors were good though, and the portions were generous.',
      visitDate: '2023-06-10T14:45:00Z',
      createdAt: '2023-06-11T09:20:00Z',
      isVerifiedVisit: true,
      helpfulCount: 8,
      comments: 2,
      isHelpful: true,
      categoryRatings: {
        food: 4,
        service: 2,
        ambience: 3,
        value: 3,
      },
    },
    {
      id: 'review3',
      userId: 'user3',
      userName: 'Mei Ling',
      userProfilePicture: null,
      rating: 1,
      title: 'Terrible experience, would not recommend',
      content: 'I had a terrible experience at this restaurant. The food was cold, the service was rude, and the prices were outrageous for the quality. I would not recommend this place to anyone.',
      visitDate: '2023-06-05T11:20:00Z',
      createdAt: '2023-06-05T18:45:00Z',
      isVerifiedVisit: false,
      helpfulCount: 5,
      comments: 4,
      isHelpful: false,
    },
  ];
  
  // State for helpful status
  const [reviews, setReviews] = useState(sampleReviews);
  
  // Handle marking review as helpful
  const handleMarkHelpful = (reviewId, isHelpful) => {
    console.log(`Marked review ${reviewId} as ${isHelpful ? 'helpful' : 'not helpful'}`);
    // In a real app, this would call an API to update the helpful status
  };
  
  // Handle reporting review
  const handleReport = (reviewId) => {
    console.log(`Reported review ${reviewId}`);
    // In a real app, this would open a modal to report the review
  };
  
  // Handle sharing review
  const handleShare = (reviewId) => {
    console.log(`Shared review ${reviewId}`);
    // In a real app, this would open a share dialog
  };

  return (
    <Layout
      title="Review Card Example"
      description="Example of using the ReviewCard component"
    >
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Review Card Example
        </h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurant Reviews
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                getCountryLink={getCountryLink}
                onMarkHelpful={handleMarkHelpful}
                onReport={handleReport}
                onShare={handleShare}
                className="mb-6"
              />
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About This Example
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates the ReviewCard component, which displays a restaurant review. The component shows:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
            <li>Reviewer information (name, avatar, verification status)</li>
            <li>Review rating with stars</li>
            <li>Review content with title and text</li>
            <li>Expandable/collapsible long reviews</li>
            <li>Review photos</li>
            <li>Dish ratings</li>
            <li>Category ratings (food, service, ambience, value)</li>
            <li>Review date and verified visit status</li>
            <li>Actions like marking as helpful, commenting, sharing, or reporting</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400">
            The component is designed to be flexible and can be used in various contexts, such as restaurant detail pages, review listings, or user profiles.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewCardExample;
