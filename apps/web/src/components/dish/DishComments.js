/**
 * Dish Comments Component
 * 
 * Displays and manages comments for dishes with threaded replies.
 * Supports comment creation, editing, deletion, and moderation.
 * 
 * Features:
 * - Threaded comment system
 * - Real-time comment updates
 * - Comment moderation
 * - Reply functionality
 * - User authentication integration
 * - Pagination and infinite scroll
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishComments = ({
  dishId,
  dishName = 'Dish',
  restaurantId,
  showAddComment = true,
  showReplies = true,
  commentsPerPage = 10,
  enableModeration = false,
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Fetch comments
  const fetchComments = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishComments({
        dishId,
        page: pageNum,
        limit: commentsPerPage,
        includeReplies: showReplies
      });

      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
      
      // Track comments view
      trackUserEngagement('dish', dishId, 'comments_view', {
        page: pageNum,
        commentCount: data.comments.length
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Submit new comment
  const submitComment = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmitting(true);

    try {
      const comment = await analyticsService.createDishComment({
        dishId,
        userId: user.id,
        content: newComment.trim(),
        restaurantId
      });

      // Add new comment to the top of the list
      setComments(prev => [comment, ...prev]);
      setNewComment('');

      // Track comment creation
      trackUserEngagement('dish', dishId, 'comment_create', {
        commentLength: newComment.length
      });
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const submitReply = async (parentId) => {
    if (!isAuthenticated) {
      alert('Please sign in to reply');
      return;
    }

    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    setSubmitting(true);

    try {
      const reply = await analyticsService.createDishComment({
        dishId,
        userId: user.id,
        content: replyText.trim(),
        parentId,
        restaurantId
      });

      // Add reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyText('');
      setReplyingTo(null);

      // Track reply creation
      trackUserEngagement('dish', dishId, 'comment_reply', {
        parentCommentId: parentId,
        replyLength: replyText.length
      });
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await analyticsService.deleteDishComment({
        commentId,
        userId: user.id
      });

      // Remove comment from list
      setComments(prev => prev.filter(comment => comment.id !== commentId));

      // Track comment deletion
      trackUserEngagement('dish', dishId, 'comment_delete', {
        commentId
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render comment
  const renderComment = (comment, isReply = false) => {
    const canDelete = user && (user.id === comment.userId || user.isAdmin);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        <div className="flex gap-3">
          <Avatar
            src={comment.user?.avatar}
            alt={comment.user?.name}
            fallback={comment.user?.name?.charAt(0) || 'U'}
            size="sm"
          />
          
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                
                {canDelete && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <p className="text-gray-700">{comment.content}</p>
            </div>

            {/* Reply Button */}
            {!isReply && showReplies && isAuthenticated && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Reply
              </button>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => submitReply(comment.id)}
                    disabled={submitting || !replyText.trim()}
                    size="sm"
                  >
                    {submitting ? 'Replying...' : 'Reply'}
                  </Button>
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
                </div>
              </div>
            )}

            {/* Replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Load comments on mount
  useEffect(() => {
    fetchComments();
  }, [dishId]);

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          💬 Comments for {dishName}
        </h3>
        <p className="text-sm text-gray-600">
          Share your thoughts and experiences
        </p>
      </div>

      {/* Add Comment Form */}
      {showAddComment && isAuthenticated && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this dish..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}

      {/* Authentication Prompt */}
      {showAddComment && !isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 mb-2">
            Sign in to join the conversation
          </p>
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </div>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600">
            <p className="font-semibold mb-2">Error Loading Comments</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => fetchComments()} 
              className="mt-3"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div>
          {comments.map(comment => renderComment(comment))}
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <Button
                onClick={() => fetchComments(page + 1, true)}
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Comments'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium mb-2">No Comments Yet</p>
          <p className="text-sm">
            Be the first to share your thoughts about this dish!
          </p>
        </div>
      )}
    </Card>
  );
};

export default DishComments;
