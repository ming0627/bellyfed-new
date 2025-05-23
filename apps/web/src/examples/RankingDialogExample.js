/**
 * RankingDialogExample
 * 
 * This is an example of how to use the RankingDialog component.
 * It demonstrates how to open the dialog, handle form submission, and display the results.
 */

import React, { useState, useCallback } from 'react';
import { Award, Star, Plus } from 'lucide-react';
import RankingDialog from '../components/rankings/RankingDialog.js';
import Layout from '../components/layout/Layout.js';
import { LucideClientIcon } from '../components/ui/lucide-icon.js';

/**
 * Example of using the RankingDialog component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const RankingDialogExample = () => {
  // State for dialog visibility
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for dialog mode (create or edit)
  const [isEditing, setIsEditing] = useState(false);
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for current ranking data
  const [currentRanking, setCurrentRanking] = useState(null);
  
  // State for submitted ranking data
  const [submittedRanking, setSubmittedRanking] = useState(null);
  
  // Sample dish data
  const sampleDish = {
    dishId: 'dish-123',
    dishName: 'Nasi Lemak',
    restaurantId: 'restaurant-456',
    restaurantName: 'Village Park Restaurant',
    rank: null,
    tasteStatus: null,
    notes: '',
    photoUrls: [],
  };
  
  // Sample existing ranking data
  const sampleExistingRanking = {
    dishId: 'dish-123',
    dishName: 'Nasi Lemak',
    restaurantId: 'restaurant-456',
    restaurantName: 'Village Park Restaurant',
    rank: 5,
    tasteStatus: 'loved',
    notes: 'This is the best Nasi Lemak I\'ve ever had! The sambal is spicy but not overwhelming, and the coconut rice is perfectly cooked.',
    photoUrls: [
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1626694733135-2d4c1b8c2f9e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    ],
  };
  
  // Open dialog for creating a new ranking
  const handleOpenCreateDialog = useCallback(() => {
    setCurrentRanking(sampleDish);
    setIsEditing(false);
    setIsDialogOpen(true);
  }, []);
  
  // Open dialog for editing an existing ranking
  const handleOpenEditDialog = useCallback(() => {
    setCurrentRanking(sampleExistingRanking);
    setIsEditing(true);
    setIsDialogOpen(true);
  }, []);
  
  // Close dialog
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update submitted ranking data
      setSubmittedRanking(data);
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting ranking:', error);
      alert('Failed to submit ranking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  // Format taste status for display
  const formatTasteStatus = (status) => {
    switch (status) {
      case 'loved':
        return 'Loved it';
      case 'liked':
        return 'Liked it';
      case 'okay':
        return 'It was okay';
      case 'disliked':
        return 'Didn\'t like it';
      default:
        return 'Not specified';
    }
  };

  return (
    <Layout
      title="Ranking Dialog Example"
      description="Example of using the RankingDialog component"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Ranking Dialog Example
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Create Ranking Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Ranking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the button below to open the dialog for creating a new ranking for Nasi Lemak.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateDialog}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
            >
              <LucideClientIcon icon={Plus} className="w-5 h-5 mr-2" />
              Create Ranking
            </button>
          </div>
          
          {/* Edit Ranking Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Edit Existing Ranking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the button below to open the dialog for editing an existing ranking for Nasi Lemak.
            </p>
            <button
              type="button"
              onClick={handleOpenEditDialog}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              <LucideClientIcon icon={Award} className="w-5 h-5 mr-2" />
              Edit Ranking
            </button>
          </div>
        </div>
        
        {/* Submitted Ranking Display */}
        {submittedRanking && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Submitted Ranking
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {submittedRanking.dishName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {submittedRanking.restaurantName}
                </p>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">Rank:</span>
                <div className="flex items-center">
                  {submittedRanking.rank ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold">
                      {submittedRanking.rank}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Not ranked</span>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">Taste Status:</span>
                <span className="text-gray-900 dark:text-white">
                  {submittedRanking.tasteStatus ? formatTasteStatus(submittedRanking.tasteStatus) : 'Not specified'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">Notes:</span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {submittedRanking.notes || 'No notes provided'}
                </p>
              </div>
              
              {submittedRanking.photoUrls.length > 0 && (
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium block mb-2">Photos:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {submittedRanking.photoUrls.map((url, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Ranking Dialog */}
      <RankingDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={currentRanking}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default RankingDialogExample;
