/**
 * RankingDialog Component
 *
 * A dialog component for creating or editing rankings.
 * It allows users to rank dishes, add notes, upload photos, and select taste status.
 *
 * Features:
 * - Create or edit rankings for dishes
 * - Select rank from 1 to 5
 * - Add notes about the dish
 * - Upload photos of the dish
 * - Select taste status (Loved it, Liked it, It was okay, Didn't like it)
 * - Responsive design
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  Upload,
  Trash2,
  Camera,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Loader2
} from 'lucide-react';
/**
 * RankingDialog component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {Function} props.onSubmit - Function to call when the form is submitted
 * @param {Object} props.initialData - Initial data for the form
 * @param {string} props.initialData.dishId - ID of the dish being ranked
 * @param {string} props.initialData.dishName - Name of the dish being ranked
 * @param {string} props.initialData.restaurantId - ID of the restaurant where the dish is served
 * @param {string} props.initialData.restaurantName - Name of the restaurant where the dish is served
 * @param {number} props.initialData.rank - Initial rank (1-5)
 * @param {string} props.initialData.tasteStatus - Initial taste status (loved, liked, okay, disliked)
 * @param {string} props.initialData.notes - Initial notes
 * @param {Array<string>} props.initialData.photoUrls - Initial photo URLs
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {boolean} props.isEditing - Whether the dialog is for editing an existing ranking
 * @returns {JSX.Element} - Rendered component
 */
const RankingDialog = memo(function RankingDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData = {
    dishId: '',
    dishName: '',
    restaurantId: '',
    restaurantName: '',
    rank: null,
    tasteStatus: null,
    notes: '',
    photoUrls: [],
  },
  isSubmitting = false,
  isEditing = false,
}) {
  // Form state
  const [rank, setRank] = useState(initialData.rank);
  const [tasteStatus, setTasteStatus] = useState(initialData.tasteStatus);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [photoUrls, setPhotoUrls] = useState(initialData.photoUrls || []);
  const [newPhotos, setNewPhotos] = useState([]);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setRank(initialData.rank);
      setTasteStatus(initialData.tasteStatus);
      setNotes(initialData.notes || '');
      setPhotoUrls(initialData.photoUrls || []);
      setNewPhotos([]);
    }
  }, [isOpen, initialData]);

  // Handle rank selection
  const handleRankSelect = useCallback((selectedRank) => {
    setRank(selectedRank === rank ? null : selectedRank);
  }, [rank]);

  // Handle taste status selection
  const handleTasteStatusSelect = useCallback((selectedStatus) => {
    setTasteStatus(selectedStatus === tasteStatus ? null : selectedStatus);
  }, [tasteStatus]);

  // Handle notes change
  const handleNotesChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);

  // Handle photo upload
  const handlePhotoUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // In a real app, we would upload the files to a server and get URLs back
    // For now, we'll just create object URLs for the files
    const newPhotoUrls = files.map(file => URL.createObjectURL(file));
    setNewPhotos(prev => [...prev, ...newPhotoUrls]);
  }, []);

  // Handle photo removal
  const handlePhotoRemove = useCallback((index, isNewPhoto) => {
    if (isNewPhoto) {
      setNewPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Combine existing and new photos
    const allPhotoUrls = [...photoUrls, ...newPhotos];

    // Call onSubmit with form data
    onSubmit({
      dishId: initialData.dishId,
      dishName: initialData.dishName,
      restaurantId: initialData.restaurantId,
      restaurantName: initialData.restaurantName,
      rank,
      tasteStatus,
      notes,
      photoUrls: allPhotoUrls,
    });
  }, [initialData, rank, tasteStatus, notes, photoUrls, newPhotos, onSubmit]);

  // If dialog is not open, don't render anything
  if (!isOpen) return null;

  // Taste status options
  const tasteStatusOptions = [
    { value: 'loved', label: 'Loved it', icon: Heart, color: 'text-red-500' },
    { value: 'liked', label: 'Liked it', icon: ThumbsUp, color: 'text-green-500' },
    { value: 'okay', label: 'It was okay', icon: Meh, color: 'text-yellow-500' },
    { value: 'disliked', label: 'Didn\'t like it', icon: ThumbsDown, color: 'text-gray-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Ranking' : 'Add Ranking'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit}>
            {/* Dish and Restaurant Info */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{initialData.dishName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{initialData.restaurantName}</p>
            </div>

            {/* Rank Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Ranking
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRankSelect(value)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full focus:outline-none ${
                      rank === value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Taste Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How did you like it?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tasteStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTasteStatusSelect(option.value)}
                    className={`flex items-center p-3 rounded-lg focus:outline-none ${
                      tasteStatus === option.value
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <option.icon className={`w-5 h-5 mr-2 ${option.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add your thoughts about this dish..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            {/* Photos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos (Optional)
              </label>

              {/* Existing Photos */}
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {photoUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, false)}
                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Photos */}
              {newPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {newPhotos.map((url, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`New Photo ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, true)}
                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:border-orange-500 dark:hover:border-orange-500">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Camera className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add Photos
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Submitting...'}
              </span>
            ) : (
              isEditing ? 'Update Ranking' : 'Submit Ranking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default RankingDialog;
