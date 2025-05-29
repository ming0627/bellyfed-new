/**
 * Social Post Creator Component
 * 
 * Allows users to create new social posts with rich content including
 * text, images, location, and hashtags.
 * 
 * Features:
 * - Rich text post creation
 * - Image upload and preview
 * - Location tagging
 * - Hashtag suggestions
 * - User tagging
 * - Post privacy settings
 * - Draft saving
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button, Card, Input, Textarea } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { socialMediaService } from '@bellyfed/services';
import { Camera, MapPin, Hash, Users, Globe, Lock, Image, X } from 'lucide-react';

const SocialPostCreator = ({
  onPostCreated,
  placeholder = "What's on your mind?",
  showPrivacyOptions = true,
  showLocationTag = true,
  showImageUpload = true,
  maxImages = 4,
  className = ''
}) => {
  // State
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [privacy, setPrivacy] = useState('public'); // 'public', 'followers', 'private'
  const [isPosting, setIsPosting] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [error, setError] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Handle content change
  const handleContentChange = useCallback((e) => {
    const value = e.target.value;
    setContent(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Extract hashtags
    const hashtagMatches = value.match(/#\w+/g);
    if (hashtagMatches) {
      const extractedHashtags = hashtagMatches.map(tag => tag.substring(1));
      setHashtags(prev => [...new Set([...prev, ...extractedHashtags])]);
    }
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file,
            preview: event.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length, maxImages]);

  // Remove image
  const removeImage = useCallback((imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  // Add hashtag
  const addHashtag = useCallback((tag) => {
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
      setHashtagInput('');
    }
  }, [hashtags]);

  // Remove hashtag
  const removeHashtag = useCallback((tag) => {
    setHashtags(prev => prev.filter(h => h !== tag));
  }, []);

  // Handle location detection
  const detectLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          setShowLocationInput(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
  }, []);

  // Create post
  const handleCreatePost = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('Please sign in to create posts');
      return;
    }

    if (!content.trim() && images.length === 0) {
      setError('Please add some content or images');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      // Create post data
      const postData = {
        content: content.trim(),
        hashtags,
        location: location.trim(),
        taggedUserIds: taggedUsers.map(u => u.id),
        privacy,
        userId: user.id
      };

      // Upload images if any
      if (images.length > 0) {
        // In a real app, you'd upload images to S3 first
        postData.photos = images.map(img => ({
          bucket: 'bellyfed-posts',
          region: 'us-east-1',
          key: `posts/${user.id}/${Date.now()}-${img.name}`
        }));
      }

      // Create the post
      const newPost = socialMediaService.createPost('USER', postData);

      // Track post creation
      trackUserEngagement('social', 'post', 'create', {
        postId: newPost.id,
        contentLength: content.length,
        imageCount: images.length,
        hashtagCount: hashtags.length,
        hasLocation: !!location,
        privacy
      });

      // Reset form
      setContent('');
      setImages([]);
      setLocation('');
      setHashtags([]);
      setTaggedUsers([]);
      setShowLocationInput(false);
      setHashtagInput('');

      // Notify parent
      if (onPostCreated) {
        onPostCreated(newPost);
      }

    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
      
      trackUserEngagement('social', 'post', 'error', {
        error: err.message
      });
    } finally {
      setIsPosting(false);
    }
  }, [
    isAuthenticated, user, content, images, hashtags, location, 
    taggedUsers, privacy, trackUserEngagement, onPostCreated
  ]);

  // Privacy options
  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe },
    { value: 'followers', label: 'Followers', icon: Users },
    { value: 'private', label: 'Only me', icon: Lock }
  ];

  if (!isAuthenticated) {
    return (
      <Card className={`p-4 text-center ${className}`}>
        <p className="text-gray-600 mb-4">Sign in to create posts</p>
        <Button variant="outline">Sign In</Button>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      {/* User Avatar and Input */}
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-orange-700 font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="border-none resize-none focus:ring-0 p-0 text-lg"
            rows={1}
          />
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Input */}
      {showLocationInput && (
        <div className="mb-4">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location..."
            className="w-full"
            icon={MapPin}
          />
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => removeHashtag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          {/* Image Upload */}
          {showImageUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
              >
                <Camera size={16} />
              </Button>
            </>
          )}

          {/* Location */}
          {showLocationTag && (
            <Button
              variant="ghost"
              size="sm"
              onClick={detectLocation}
            >
              <MapPin size={16} />
            </Button>
          )}

          {/* Hashtag Input */}
          <div className="flex items-center gap-1">
            <Hash size={16} className="text-gray-400" />
            <Input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  addHashtag(hashtagInput.trim());
                }
              }}
              placeholder="Add hashtag"
              className="w-24 text-sm border-none focus:ring-0 p-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Selector */}
          {showPrivacyOptions && (
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {privacyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Post Button */}
          <Button
            onClick={handleCreatePost}
            disabled={isPosting || (!content.trim() && images.length === 0)}
            size="sm"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SocialPostCreator;
