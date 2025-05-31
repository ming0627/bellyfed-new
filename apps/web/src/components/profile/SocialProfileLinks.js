import React, { useState, useCallback } from 'react';
import { Instagram, Twitter, Facebook, Globe, Plus, X, ExternalLink, Save } from 'lucide-react';

/**
 * Social Profile Links Component
 * 
 * Manages social media profile links for user profiles. Allows users to
 * add, edit, and remove links to their social media accounts with validation
 * and preview functionality.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.socialLinks - Current social links object
 * @param {Function} props.onSocialLinksChange - Callback when links change
 * @param {boolean} props.isEditing - Whether in edit mode
 * @param {string} props.className - Additional CSS classes
 */
export default function SocialProfileLinks({
  socialLinks = {},
  onSocialLinksChange,
  isEditing = false,
  className = ''
}) {
  const [editingLinks, setEditingLinks] = useState(socialLinks);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLinkType, setNewLinkType] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Supported social platforms with their configurations
   */
  const socialPlatforms = {
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      baseUrl: 'https://instagram.com/',
      placeholder: 'username',
      pattern: /^[a-zA-Z0-9._]+$/,
      color: 'text-pink-500'
    },
    twitter: {
      name: 'Twitter',
      icon: Twitter,
      baseUrl: 'https://twitter.com/',
      placeholder: 'username',
      pattern: /^[a-zA-Z0-9_]+$/,
      color: 'text-blue-500'
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      baseUrl: 'https://facebook.com/',
      placeholder: 'username or page',
      pattern: /^[a-zA-Z0-9.]+$/,
      color: 'text-blue-600'
    },
    website: {
      name: 'Website',
      icon: Globe,
      baseUrl: '',
      placeholder: 'https://yourwebsite.com',
      pattern: /^https?:\/\/.+/,
      color: 'text-gray-600'
    }
  };

  /**
   * Validate social link URL
   * @param {string} platform - Platform type
   * @param {string} url - URL to validate
   * @returns {string|null} Error message or null if valid
   */
  const validateSocialLink = useCallback((platform, url) => {
    if (!url.trim()) {
      return 'URL is required';
    }

    const config = socialPlatforms[platform];
    if (!config) {
      return 'Invalid platform';
    }

    if (platform === 'website') {
      if (!config.pattern.test(url)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    } else {
      // For social platforms, accept either username or full URL
      const isFullUrl = url.startsWith('http');
      if (isFullUrl) {
        if (!url.includes(config.baseUrl.replace('https://', ''))) {
          return `Please enter a valid ${config.name} URL`;
        }
      } else {
        if (!config.pattern.test(url)) {
          return `Please enter a valid ${config.name} username`;
        }
      }
    }

    return null;
  }, [socialPlatforms]);

  /**
   * Normalize URL for storage
   * @param {string} platform - Platform type
   * @param {string} url - Input URL
   * @returns {string} Normalized URL
   */
  const normalizeUrl = useCallback((platform, url) => {
    const config = socialPlatforms[platform];
    if (!config) return url;

    if (platform === 'website') {
      return url;
    }

    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }

    // Otherwise, prepend the base URL
    return config.baseUrl + url;
  }, [socialPlatforms]);

  /**
   * Handle link change
   * @param {string} platform - Platform type
   * @param {string} url - New URL
   */
  const handleLinkChange = useCallback((platform, url) => {
    setEditingLinks(prev => ({
      ...prev,
      [platform]: url
    }));

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [platform]: null
    }));
  }, []);

  /**
   * Handle link removal
   * @param {string} platform - Platform to remove
   */
  const handleRemoveLink = useCallback((platform) => {
    setEditingLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[platform];
      return newLinks;
    });

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[platform];
      return newErrors;
    });
  }, []);

  /**
   * Handle adding new link
   */
  const handleAddNewLink = useCallback(() => {
    if (!newLinkType || !newLinkUrl) {
      setErrors(prev => ({
        ...prev,
        newLink: 'Please select a platform and enter a URL'
      }));
      return;
    }

    const error = validateSocialLink(newLinkType, newLinkUrl);
    if (error) {
      setErrors(prev => ({
        ...prev,
        newLink: error
      }));
      return;
    }

    const normalizedUrl = normalizeUrl(newLinkType, newLinkUrl);
    setEditingLinks(prev => ({
      ...prev,
      [newLinkType]: normalizedUrl
    }));

    // Reset new link form
    setNewLinkType('');
    setNewLinkUrl('');
    setIsAddingNew(false);
    setErrors(prev => ({
      ...prev,
      newLink: null
    }));
  }, [newLinkType, newLinkUrl, validateSocialLink, normalizeUrl]);

  /**
   * Handle save changes
   */
  const handleSave = useCallback(() => {
    const validationErrors = {};

    // Validate all links
    Object.entries(editingLinks).forEach(([platform, url]) => {
      const error = validateSocialLink(platform, url);
      if (error) {
        validationErrors[platform] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Normalize all URLs before saving
    const normalizedLinks = {};
    Object.entries(editingLinks).forEach(([platform, url]) => {
      normalizedLinks[platform] = normalizeUrl(platform, url);
    });

    if (onSocialLinksChange) {
      onSocialLinksChange(normalizedLinks);
    }
  }, [editingLinks, validateSocialLink, normalizeUrl, onSocialLinksChange]);

  /**
   * Get display URL for a platform
   * @param {string} platform - Platform type
   * @param {string} url - Full URL
   * @returns {string} Display URL
   */
  const getDisplayUrl = (platform, url) => {
    if (platform === 'website') return url;
    
    const config = socialPlatforms[platform];
    if (url.startsWith(config.baseUrl)) {
      return url.replace(config.baseUrl, '@');
    }
    return url;
  };

  const availablePlatforms = Object.keys(socialPlatforms).filter(
    platform => !editingLinks[platform]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Social Links
        </h3>
        {isEditing && (
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
        )}
      </div>

      {/* Existing Links */}
      <div className="space-y-3">
        {Object.entries(editingLinks).map(([platform, url]) => {
          const config = socialPlatforms[platform];
          if (!config) return null;

          const IconComponent = config.icon;

          return (
            <div key={platform} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <IconComponent className={`w-5 h-5 ${config.color}`} />
              
              <div className="flex-1">
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleLinkChange(platform, e.target.value)}
                      placeholder={config.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    {errors[platform] && (
                      <p className="text-sm text-red-500 mt-1">{errors[platform]}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {getDisplayUrl(platform, url)}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={() => handleRemoveLink(platform)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Link */}
      {isEditing && availablePlatforms.length > 0 && (
        <div className="space-y-3">
          {!isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Social Link
            </button>
          ) : (
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div className="space-y-3">
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select platform...</option>
                  {availablePlatforms.map(platform => (
                    <option key={platform} value={platform}>
                      {socialPlatforms[platform].name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder={newLinkType ? socialPlatforms[newLinkType]?.placeholder : 'Enter URL...'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                {errors.newLink && (
                  <p className="text-sm text-red-500">{errors.newLink}</p>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddNewLink}
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewLinkType('');
                      setNewLinkUrl('');
                      setErrors(prev => ({ ...prev, newLink: null }));
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {Object.keys(editingLinks).length === 0 && !isEditing && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No social links added yet</p>
        </div>
      )}
    </div>
  );
}
