/**
 * Social Share Component
 * 
 * Provides social media sharing functionality with multiple platforms
 * and customizable sharing options for restaurants, dishes, and content.
 * 
 * Features:
 * - Multiple social media platforms
 * - Custom share messages and URLs
 * - Native sharing API support
 * - Copy to clipboard functionality
 * - Share analytics tracking
 * - Responsive design with icons
 */

import React, { useState } from 'react';
import { Card, Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';

const SocialShare = ({
  url,
  title = 'Check this out on Bellyfed!',
  description = 'Discover amazing food and restaurants',
  imageUrl,
  hashtags = ['bellyfed', 'food', 'restaurant'],
  platforms = ['facebook', 'twitter', 'whatsapp', 'telegram', 'copy'],
  showLabels = true,
  size = 'md',
  variant = 'default', // 'default', 'minimal', 'floating'
  className = ''
}) => {
  // State
  const [copied, setCopied] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Platform configurations
  const platformConfigs = {
    facebook: {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`
    },
    twitter: {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=${hashtags.join(',')}`
    },
    whatsapp: {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`
    },
    telegram: {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    reddit: {
      name: 'Reddit',
      icon: '🤖',
      color: 'bg-orange-600 hover:bg-orange-700',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
    },
    email: {
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: (shareUrl, shareTitle, shareDescription) => 
        `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`
    },
    copy: {
      name: 'Copy Link',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      getUrl: () => null // Special handling for copy
    }
  };

  // Get share URL
  const getShareUrl = () => {
    if (url) return url;
    return `${window.location.origin}/${country}${window.location.pathname}`;
  };

  // Handle platform share
  const handleShare = async (platform) => {
    const shareUrl = getShareUrl();
    const config = platformConfigs[platform];
    
    if (!config) return;

    // Track share attempt
    trackUserEngagement('social', 'share', platform, {
      url: shareUrl,
      title,
      platform
    });

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        trackUserEngagement('social', 'share', 'copy_success', {
          url: shareUrl
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    // Try native sharing first (mobile)
    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        });
        
        trackUserEngagement('social', 'share', 'native_success', {
          url: shareUrl
        });
        return;
      } catch (err) {
        console.log('Native sharing failed, falling back to platform sharing');
      }
    }

    // Platform-specific sharing
    const platformUrl = config.getUrl(shareUrl, title, description);
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'width=600,height=400');
    }
  };

  // Get button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50';
      case 'floating':
        return 'shadow-lg';
      default:
        return '';
    }
  };

  // Render share button
  const renderShareButton = (platform) => {
    const config = platformConfigs[platform];
    if (!config) return null;

    const isNative = platform === 'native';
    const isCopy = platform === 'copy';
    const baseClasses = getSizeClasses();
    const variantClasses = getVariantClasses();
    
    return (
      <button
        key={platform}
        onClick={() => handleShare(platform)}
        className={`
          ${baseClasses} ${variantClasses}
          flex items-center justify-center rounded-lg transition-all duration-200
          ${variant === 'minimal' 
            ? variantClasses 
            : `text-white ${config.color}`
          }
          hover:scale-105 active:scale-95
        `}
        title={config.name}
      >
        <span className="flex items-center justify-center">
          {isCopy && copied ? '✅' : config.icon}
        </span>
      </button>
    );
  };

  // Filter available platforms
  const availablePlatforms = platforms.filter(platform => 
    platformConfigs[platform] || platform === 'native'
  );

  // Add native sharing if supported and not already included
  if (navigator.share && !availablePlatforms.includes('native')) {
    availablePlatforms.unshift('native');
  }

  return (
    <div className={`${className}`}>
      {variant === 'floating' ? (
        <Card className="p-3">
          <div className="flex flex-col gap-2">
            {showLabels && (
              <h3 className="text-sm font-medium text-gray-900 text-center">
                Share
              </h3>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {availablePlatforms.map(renderShareButton)}
            </div>
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-2">
          {showLabels && (
            <span className="text-sm font-medium text-gray-700 mr-2">
              Share:
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map(renderShareButton)}
          </div>
        </div>
      )}

      {/* Copy feedback */}
      {copied && (
        <div className="mt-2 text-xs text-green-600 text-center">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default SocialShare;
