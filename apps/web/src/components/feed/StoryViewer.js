/**
 * Story Viewer Component
 * 
 * Modal component for viewing Instagram-style stories with
 * automatic progression, user interactions, and navigation.
 * 
 * Features:
 * - Full-screen story viewing
 * - Automatic story progression
 * - Manual navigation (tap/click)
 * - Progress indicators
 * - Story reactions
 * - User information display
 * - Keyboard navigation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle,
  Share2,
  MoreHorizontal,
  Pause,
  Play
} from 'lucide-react';

const StoryViewer = ({
  stories = [],
  initialStoryIndex = 0,
  isOpen = false,
  onClose,
  onStoryChange,
  onReaction,
  className = ''
}) => {
  // State
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Refs
  const progressIntervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user } = useAuth();

  // Current story and segment
  const currentStory = stories[currentStoryIndex];
  const currentSegment = currentStory?.segments?.[currentSegmentIndex];

  // Story duration (default 5 seconds for images, actual duration for videos)
  const getSegmentDuration = (segment) => {
    if (segment?.type === 'video' && segment?.duration) {
      return segment.duration * 1000; // Convert to milliseconds
    }
    return 5000; // 5 seconds for images
  };

  // Start progress timer
  const startProgress = useCallback(() => {
    if (isPaused || !currentSegment) return;

    const duration = getSegmentDuration(currentSegment);
    const interval = 50; // Update every 50ms for smooth progress
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (interval / duration) * 100;
        
        if (newProgress >= 100) {
          // Move to next segment or story
          if (currentSegmentIndex < (currentStory?.segments?.length || 1) - 1) {
            setCurrentSegmentIndex(prev => prev + 1);
          } else if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setCurrentSegmentIndex(0);
          } else {
            // End of all stories
            onClose?.();
          }
          return 0;
        }
        
        return newProgress;
      });
    }, interval);
  }, [isPaused, currentSegment, currentSegmentIndex, currentStory, currentStoryIndex, stories.length, onClose]);

  // Stop progress timer
  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Handle story navigation
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
      setProgress(0);
    } else {
      onClose?.();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSegmentIndex(0);
      setProgress(0);
    }
  }, [currentStoryIndex]);

  // Handle segment navigation
  const goToNextSegment = useCallback(() => {
    if (currentSegmentIndex < (currentStory?.segments?.length || 1) - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      goToNextStory();
    }
  }, [currentSegmentIndex, currentStory, goToNextStory]);

  const goToPreviousSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      goToPreviousStory();
    }
  }, [currentSegmentIndex, goToPreviousStory]);

  // Handle click navigation
  const handleStoryClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width / 3) {
      // Left third - previous
      goToPreviousSegment();
    } else if (clickX > (width * 2) / 3) {
      // Right third - next
      goToNextSegment();
    } else {
      // Middle third - pause/play
      setIsPaused(prev => !prev);
    }
  }, [goToPreviousSegment, goToNextSegment]);

  // Handle pause/resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    setShowControls(true);
    
    // Hide controls after 2 seconds
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousSegment();
          break;
        case 'ArrowRight':
          goToNextSegment();
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'Escape':
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, goToPreviousSegment, goToNextSegment, togglePause, onClose]);

  // Start/stop progress based on pause state and story changes
  useEffect(() => {
    if (isOpen && !isPaused) {
      startProgress();
    } else {
      stopProgress();
    }

    return stopProgress;
  }, [isOpen, isPaused, startProgress, stopProgress, currentStoryIndex, currentSegmentIndex]);

  // Track story views
  useEffect(() => {
    if (isOpen && currentStory) {
      trackUserEngagement('social', 'story', 'view', {
        storyId: currentStory.id,
        segmentIndex: currentSegmentIndex,
        authorId: currentStory.userId,
        viewerId: user?.id
      });

      if (onStoryChange) {
        onStoryChange(currentStory, currentStoryIndex);
      }
    }
  }, [isOpen, currentStory, currentSegmentIndex, trackUserEngagement, user?.id, onStoryChange, currentStoryIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgress();
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [stopProgress]);

  if (!isOpen || !currentStory) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${className}`}>
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-1">
          {(currentStory.segments || [currentStory]).map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentSegmentIndex ? '100%' : 
                         index === currentSegmentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Story Header */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {currentStory.user?.avatar ? (
              <img
                src={currentStory.user.avatar}
                alt={currentStory.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {currentStory.user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {currentStory.user?.name || 'Unknown User'}
            </div>
            <div className="text-xs opacity-75">
              {new Date(currentStory.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showControls && (
            <button
              onClick={togglePause}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="relative w-full h-full max-w-md mx-auto cursor-pointer"
        onClick={handleStoryClick}
      >
        {currentSegment?.type === 'video' ? (
          <video
            src={currentSegment.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            src={currentSegment?.url || currentStory.preview}
            alt="Story content"
            className="w-full h-full object-cover"
          />
        )}

        {/* Navigation Areas (invisible) */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full" />
        </div>

        {/* Story Text Overlay */}
        {currentStory.text && (
          <div className="absolute bottom-20 left-4 right-4 text-white">
            <p className="text-lg font-medium drop-shadow-lg">
              {currentStory.text}
            </p>
          </div>
        )}
      </div>

      {/* Story Actions */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onReaction?.('like', currentStory.id)}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <Heart size={20} />
          </button>
          <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
            <MessageCircle size={20} />
          </button>
          <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Navigation Arrows */}
      {currentStoryIndex > 0 && (
        <button
          onClick={goToPreviousStory}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentStoryIndex < stories.length - 1 && (
        <button
          onClick={goToNextStory}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-white"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

export default StoryViewer;
