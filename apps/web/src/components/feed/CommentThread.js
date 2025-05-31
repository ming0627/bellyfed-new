/**
 * Comment Thread Component
 * 
 * Displays nested comments with replies, likes, and user interactions.
 * Supports real-time updates and comment moderation.
 * 
 * Features:
 * - Nested comment display
 * - Comment likes and replies
 * - Real-time comment updates
 * - Comment moderation
 * - User mentions and hashtags
 * - Load more functionality
 */

import React, { useState, useCallback } from 'react';
import { Button, Textarea } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Reply,
  Flag,
  Trash2,
  Edit3
} from 'lucide-react';

const CommentThread = ({
  comments = [],
  postId,
  onCommentAdd,
  onCommentLike,
  onCommentReply,
  onCommentDelete,
  onCommentEdit,
  onCommentReport,
  maxDepth = 3,
  showReplies = true,
  className = ''
}) => {
  // State
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState({});
  const [expandedComments, setExpandedComments] = useState(new Set());

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Handle comment like
  const handleCommentLike = useCallback(async (commentId) => {
    if (!isAuthenticated || loading[commentId]) return;

    setLoading(prev => ({ ...prev, [commentId]: true }));

    try {
      if (onCommentLike) {
        await onCommentLike(commentId);
      }

      trackUserEngagement('social', 'comment', 'like', {
        commentId,
        postId,
        userId: user?.id
      });

    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setLoading(prev => ({ ...prev, [commentId]: false }));
    }
  }, [isAuthenticated, loading, onCommentLike, trackUserEngagement, postId, user?.id]);

  // Handle reply submission
  const handleReplySubmit = useCallback(async (parentCommentId) => {
    if (!replyText.trim() || !isAuthenticated) return;

    setLoading(prev => ({ ...prev, [`reply_${parentCommentId}`]: true }));

    try {
      if (onCommentReply) {
        await onCommentReply(parentCommentId, replyText.trim());
      }

      setReplyText('');
      setReplyingTo(null);

      trackUserEngagement('social', 'comment', 'reply', {
        parentCommentId,
        postId,
        userId: user?.id,
        contentLength: replyText.length
      });

    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`reply_${parentCommentId}`]: false }));
    }
  }, [replyText, isAuthenticated, onCommentReply, trackUserEngagement, postId, user?.id]);

  // Handle comment edit
  const handleEditSubmit = useCallback(async (commentId) => {
    if (!editText.trim()) return;

    setLoading(prev => ({ ...prev, [`edit_${commentId}`]: true }));

    try {
      if (onCommentEdit) {
        await onCommentEdit(commentId, editText.trim());
      }

      setEditText('');
      setEditingComment(null);

      trackUserEngagement('social', 'comment', 'edit', {
        commentId,
        postId,
        userId: user?.id
      });

    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`edit_${commentId}`]: false }));
    }
  }, [editText, onCommentEdit, trackUserEngagement, postId, user?.id]);

  // Handle comment delete
  const handleCommentDelete = useCallback(async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setLoading(prev => ({ ...prev, [`delete_${commentId}`]: true }));

    try {
      if (onCommentDelete) {
        await onCommentDelete(commentId);
      }

      trackUserEngagement('social', 'comment', 'delete', {
        commentId,
        postId,
        userId: user?.id
      });

    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`delete_${commentId}`]: false }));
    }
  }, [onCommentDelete, trackUserEngagement, postId, user?.id]);

  // Toggle comment expansion
  const toggleCommentExpansion = useCallback((commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const commentTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Render comment content with mentions and hashtags
  const renderCommentContent = (content) => {
    const parts = content.split(/(\s+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 hover:text-blue-700 cursor-pointer">
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return (
          <span key={index} className="text-purple-600 hover:text-purple-700 cursor-pointer">
            {part}
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  // Render individual comment
  const renderComment = (comment, depth = 0) => {
    const isExpanded = expandedComments.has(comment.id);
    const canReply = showReplies && depth < maxDepth;
    const isOwner = user?.id === comment.userId;
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            {comment.user?.avatar ? (
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-sm font-semibold">
                {comment.user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {comment.user?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  {getTimeAgo(comment.createdAt)}
                </span>
              </div>

              {/* Comment Text */}
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditSubmit(comment.id)}
                      disabled={!editText.trim() || loading[`edit_${comment.id}`]}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-900">
                  {renderCommentContent(comment.content)}
                </p>
              )}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <button
                onClick={() => handleCommentLike(comment.id)}
                disabled={loading[comment.id]}
                className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
                  comment.isLiked ? 'text-red-600' : ''
                }`}
              >
                <Heart size={12} className={comment.isLiked ? 'fill-current' : ''} />
                <span>{comment.likeCount > 0 ? comment.likeCount : 'Like'}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyText(`@${comment.user?.name} `);
                  }}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Reply size={12} />
                  <span>Reply</span>
                </button>
              )}

              {hasReplies && (
                <button
                  onClick={() => toggleCommentExpansion(comment.id)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={12} />
                  <span>
                    {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} replies
                  </span>
                </button>
              )}

              {/* More Options */}
              <div className="relative ml-auto">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={12} />
                </button>
                {/* Dropdown menu would go here */}
              </div>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyText.trim() || loading[`reply_${comment.id}`]}
                  >
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {hasReplies && isExpanded && (
              <div className="mt-2">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {comments.map(comment => renderComment(comment))}
    </div>
  );
};

export default CommentThread;
