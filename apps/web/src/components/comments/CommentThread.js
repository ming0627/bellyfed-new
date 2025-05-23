/**
 * Comment Thread Component
 * 
 * Displays threaded comments with replies, reactions, and moderation.
 * Supports nested conversations and real-time updates.
 * 
 * Features:
 * - Threaded comment display
 * - Reply functionality
 * - Comment reactions (like, dislike)
 * - Comment moderation and reporting
 * - Real-time comment updates
 * - Pagination for large threads
 * - Rich text formatting support
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link.js';
import { Card, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const CommentThread = ({
  targetType = 'dish', // 'dish', 'restaurant', 'review'
  targetId,
  showReplyForm = true,
  showReactions = true,
  maxDepth = 3,
  commentsPerPage = 20,
  enableRealTime = true,
  className = ''
}) => {
  // State
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true,
    total: 0
  });

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();
  const { country } = useCountry();

  // Fetch comments
  const fetchComments = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await analyticsService.getComments({
        targetType,
        targetId,
        page,
        limit: commentsPerPage,
        includeReplies: true,
        maxDepth
      });

      if (append) {
        setComments(prev => [...prev, ...(data.comments || [])]);
      } else {
        setComments(data.comments || []);
      }

      setPagination({
        page,
        hasMore: data.hasMore || false,
        total: data.total || 0
      });

      // Track comments view
      trackUserEngagement('comments', 'thread', 'view', {
        targetType,
        targetId,
        page,
        commentCount: data.comments?.length || 0
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Submit new comment
  const submitComment = async (content, parentId = null) => {
    if (!isAuthenticated) {
      alert('Please sign in to comment');
      return;
    }

    if (!content.trim()) return;

    setSubmitting(true);

    try {
      const comment = await analyticsService.createComment({
        targetType,
        targetId,
        userId: user.id,
        content: content.trim(),
        parentId
      });

      // Add comment to local state
      if (parentId) {
        // Add as reply
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        ));
        setReplyText('');
        setReplyingTo(null);
      } else {
        // Add as top-level comment
        setComments(prev => [comment, ...prev]);
        setNewComment('');
      }

      // Track comment submission
      trackUserEngagement('comments', 'submit', parentId ? 'reply' : 'comment', {
        targetType,
        targetId,
        parentId,
        contentLength: content.length
      });
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment reaction
  const handleReaction = async (commentId, reaction) => {
    if (!isAuthenticated) {
      alert('Please sign in to react to comments');
      return;
    }

    try {
      const result = await analyticsService.reactToComment({
        commentId,
        userId: user.id,
        reaction // 'like', 'dislike'
      });

      // Update local state
      setComments(prev => prev.map(comment => 
        updateCommentReaction(comment, commentId, reaction, result)
      ));

      trackUserEngagement('comments', 'reaction', reaction, {
        commentId,
        targetType,
        targetId
      });
    } catch (err) {
      console.error('Error reacting to comment:', err);
    }
  };

  // Update comment reaction in nested structure
  const updateCommentReaction = (comment, commentId, reaction, result) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        reactions: result.reactions,
        userReaction: result.userReaction
      };
    }
    
    if (comment.replies) {
      return {
        ...comment,
        replies: comment.replies.map(reply => 
          updateCommentReaction(reply, commentId, reaction, result)
        )
      };
    }
    
    return comment;
  };

  // Handle comment reporting
  const handleReport = async (commentId, reason) => {
    if (!isAuthenticated) {
      alert('Please sign in to report comments');
      return;
    }

    try {
      await analyticsService.reportComment({
        commentId,
        userId: user.id,
        reason
      });

      alert('Comment reported. Thank you for helping keep our community safe.');
      
      trackUserEngagement('comments', 'report', 'submit', {
        commentId,
        reason,
        targetType,
        targetId
      });
    } catch (err) {
      console.error('Error reporting comment:', err);
      alert('Failed to report comment. Please try again.');
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Render comment
  const renderComment = (comment, depth = 0) => {
    const isReply = depth > 0;
    const canReply = depth < maxDepth && showReplyForm;
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        <div className={`${isReply ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <Avatar
              src={comment.user?.avatar}
              alt={comment.user?.name}
              fallback={comment.user?.name?.charAt(0) || 'U'}
              size="sm"
            />

            <div className="flex-1 min-w-0">
              {/* Comment Header */}
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/${country}/users/${comment.user?.id}`}>
                  <span className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer text-sm">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                </Link>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-xs">
                {showReactions && (
                  <>
                    <button
                      onClick={() => handleReaction(comment.id, 'like')}
                      className={`
                        flex items-center gap-1 transition-colors
                        ${comment.userReaction === 'like' 
                          ? 'text-green-600' 
                          : 'text-gray-600 hover:text-green-600'
                        }
                      `}
                    >
                      <span>👍</span>
                      <span>{comment.reactions?.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, 'dislike')}
                      className={`
                        flex items-center gap-1 transition-colors
                        ${comment.userReaction === 'dislike' 
                          ? 'text-red-600' 
                          : 'text-gray-600 hover:text-red-600'
                        }
                      `}
                    >
                      <span>👎</span>
                      <span>{comment.reactions?.dislikes || 0}</span>
                    </button>
                  </>
                )}

                {canReply && (
                  <button
                    onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                    className="text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    Reply
                  </button>
                )}

                <button
                  onClick={() => handleReport(comment.id, 'inappropriate')}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Report
                </button>
              </div>

              {/* Reply Form */}
              {isReplying && (
                <div className="mt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {replyText.length}/500
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => submitComment(replyText, comment.id)}
                        disabled={!replyText.trim() || submitting}
                        size="sm"
                      >
                        {submitting ? 'Posting...' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Load comments on mount
  useEffect(() => {
    if (targetId) {
      fetchComments(1);
    }
  }, [targetId]);

  // Real-time updates (mock implementation)
  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(() => {
      // In a real app, this would use WebSocket or Server-Sent Events
      // For now, we'll just refetch periodically
      if (comments.length > 0) {
        fetchComments(1);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [enableRealTime, comments.length]);

  return (
    <div className={className}>
      {/* New Comment Form */}
      {showReplyForm && isAuthenticated && (
        <Card className="p-4 mb-6">
          <div className="flex items-start gap-3">
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              fallback={user?.name?.charAt(0) || 'U'}
              size="sm"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000
                </span>
                <Button
                  onClick={() => submitComment(newComment)}
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600">
            <p className="font-semibold mb-2">Error Loading Comments</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => fetchComments(1)} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : comments.length > 0 ? (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Comments ({pagination.total})
            </h3>
          </div>
          
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center mt-6">
              <Button
                onClick={() => fetchComments(pagination.page + 1, true)}
                variant="outline"
              >
                Load More Comments
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Comments Yet</p>
            <p className="text-sm">
              {isAuthenticated 
                ? "Be the first to share your thoughts!"
                : "Sign in to join the conversation!"
              }
            </p>
          </div>
        </Card>
      )}

      {/* Sign In Prompt */}
      {!isAuthenticated && (
        <Card className="p-6 mt-6 text-center bg-blue-50">
          <p className="text-blue-700 mb-3">
            Join the conversation! Sign in to comment and interact with others.
          </p>
          <Button variant="outline">
            Sign In
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CommentThread;
