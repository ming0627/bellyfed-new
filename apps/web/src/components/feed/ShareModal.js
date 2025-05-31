/**
 * Share Modal Component
 * 
 * Modal for sharing content across different platforms and methods.
 * Supports social media sharing, copying links, and internal sharing.
 * 
 * Features:
 * - Multiple sharing platforms
 * - Link copying functionality
 * - Internal user sharing
 * - Custom share messages
 * - Analytics tracking
 * - QR code generation
 */

import React, { useState, useCallback } from 'react';
import { Button, Card, Input, Textarea } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { 
  X, 
  Copy, 
  Check, 
  QrCode,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Mail,
  Link,
  Users
} from 'lucide-react';

const ShareModal = ({
  isOpen = false,
  onClose,
  content = {},
  shareUrl,
  title = 'Share this post',
  description = 'Check out this amazing content on Bellyfed!',
  className = ''
}) => {
  // State
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showQR, setShowQR] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user } = useAuth();

  // Share platforms
  const sharePlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageCircle,
      color: 'bg-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`
    }
  ];

  // Handle platform share
  const handlePlatformShare = useCallback((platform) => {
    // Track share action
    trackUserEngagement('social', 'share', platform.id, {
      contentId: content.id,
      contentType: content.type,
      platform: platform.id,
      userId: user?.id
    });

    // Open share URL
    if (platform.url) {
      window.open(platform.url, '_blank', 'width=600,height=400');
    }
  }, [trackUserEngagement, content, user?.id]);

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      trackUserEngagement('social', 'share', 'copy_link', {
        contentId: content.id,
        contentType: content.type,
        userId: user?.id
      });

    } catch (error) {
      console.error('Failed to copy link:', error);
      
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
  }, [shareUrl, trackUserEngagement, content, user?.id]);

  // Handle internal share
  const handleInternalShare = useCallback(() => {
    // This would integrate with your internal messaging system
    console.log('Sharing internally to users:', selectedUsers);
    console.log('Custom message:', customMessage);

    trackUserEngagement('social', 'share', 'internal', {
      contentId: content.id,
      contentType: content.type,
      recipientCount: selectedUsers.length,
      hasCustomMessage: !!customMessage,
      userId: user?.id
    });

    // Close modal after sharing
    onClose?.();
  }, [selectedUsers, customMessage, trackUserEngagement, content, user?.id, onClose]);

  // Generate QR code (simplified - in real app you'd use a QR library)
  const generateQRCode = useCallback(() => {
    setShowQR(true);
    
    trackUserEngagement('social', 'share', 'qr_code', {
      contentId: content.id,
      contentType: content.type,
      userId: user?.id
    });
  }, [trackUserEngagement, content, user?.id]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Preview */}
        {content.preview && (
          <div className="p-4 border-b">
            <div className="flex gap-3">
              {content.image && (
                <img
                  src={content.image}
                  alt="Content preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {content.title || title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {content.description || description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Share Platforms */}
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Share to</h4>
          <div className="grid grid-cols-3 gap-3">
            {sharePlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformShare(platform)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center text-white`}>
                  <platform.icon size={20} />
                </div>
                <span className="text-sm text-gray-700">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy Link */}
        <div className="p-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Copy link</h4>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">QR Code</h4>
            <Button
              onClick={generateQRCode}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <QrCode size={16} />
              Generate QR
            </Button>
          </div>
          
          {showQR && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                <QrCode size={64} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                QR code for easy sharing
              </p>
            </div>
          )}
        </div>

        {/* Internal Share */}
        <div className="p-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Share with friends</h4>
          
          {/* Custom Message */}
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message (optional)"
            className="w-full mb-3"
            rows={2}
          />

          {/* User Selection (simplified) */}
          <div className="mb-3">
            <Input
              placeholder="Search friends to share with..."
              className="w-full"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedUsers.map((userId) => (
                <span
                  key={userId}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  User {userId}
                  <button
                    onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={handleInternalShare}
            disabled={selectedUsers.length === 0}
            className="w-full flex items-center gap-2"
          >
            <Users size={16} />
            Share with {selectedUsers.length} friend{selectedUsers.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ShareModal;
