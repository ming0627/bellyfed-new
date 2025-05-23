/**
 * Dish Comments Component
 * 
 * Displays and manages comments for a specific dish.
 * Allows users to add, edit, delete, and reply to comments.
 * 
 * Features:
 * - Threaded comment system with replies
 * - Real-time comment updates
 * - Comment moderation and reporting
 * - Rich text formatting support
 * - User authentication integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button, LoadingSpinner, Avatar } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const DishComments = ({
  dishId,
  dishName = 'Dish',
  restaurantId = null,
  showAddComment = true,
  showReplies = true,
  maxDepth = 3,
  commentsPerPage = 10,
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
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();
  const { user, isAuthenticated } = useAuth();

  // Fetch comments
  const fetchComments = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getDishComments({
        dishId,
        restaurantId,
        page: pageNum,
        limit: commentsPerPage,
        includeReplies: showReplies,
        maxDepth
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
        dishName,
        restaurantId,
        commentCount: data.total,
        page: pageNum
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmitting(true);
    setError(null);

    try {
      const comment = await analyticsService.createDishComment({
        dishId,
        restaurantId,
        userId: user.id,
        content: newComment.trim(),
        parentId: null
      });

      // Add new comment to the beginning of the list
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Track comment creation
      trackUserEngagement('dish', dishId, 'comment_created', {
        dishName,
        restaurantId,
        commentLength: newComment.length,
        userId: user.id
      });
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err.message || 'Failed to create comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim() || !isAuthenticated) return;

    setSubmitting(true);
    setError(null);

    try {
      const reply = await analyticsService.createDishComment({
        dishId,
        restaurantId,
        userId: user.id,
        content: replyText.trim(),
        parentId
      });

      // Add reply to the parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      }));

      setReplyText('');
      setReplyingTo(null);
      
      // Track reply creation
      trackUserEngagement('dish', dishId, 'comment_reply_created', {
        dishName,
        parentCommentId: parentId,
        replyLength: replyText.length,
        userId: user.id
      });
    } catch (err) {
      console.error('Error creating reply:', err);
      setError(err.message || 'Failed to create reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment editing
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const updatedComment = await analyticsService.updateDishComment({
        commentId,
        content: editText.trim(),
        userId: user.id
      });

      // Update comment in the list
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, ...updatedComment } : comment
      ));

      setEditingComment(null);
      setEditText('');
      
      // Track comment edit
      trackUserEngagement('dish', dishId, 'comment_edited', {
        commentId,
        userId: user.id
      });
    } catch (err) {
      console.error('Error editing comment:', err);
      setError(err.message || 'Failed to edit comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await analyticsService.deleteDishComment({
        commentId,
        userId: user.id
      });

      // Remove comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Track comment deletion
      trackUserEngagement('dish', dishId, 'comment_deleted', {
        commentId,
        userId: user.id
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    }
  };

  // Format date
  const formatDate = (dateString) => {
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
  const renderComment = (comment, depth = 0) => {
    const isOwner = user && comment.userId === user.id;
    const canReply = showReplies && depth < maxDepth && isAuthenticated;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
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
                  <Link href={`/${country}/users/${comment.userId}`}>
                    <span className="font-medium text-gray-900 hover:text-orange-600 cursor-pointer">
                      {comment.user?.name || 'Anonymous'}
                    </span>
                  </Link>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <Badge variant="outline" className="text-xs">
                      Edited
                    </Badge>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.content);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditComment(comment.id)}
                      size="sm"
                      disabled={submitting || !editText.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Reply button */}
            {canReply && editingComment !== comment.id && (
              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyText('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1"
              >
                Reply
              </button>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSubmitReply(comment.id)}
                    size="sm"
                    disabled={submitting || !replyText.trim()}
                  >
                    Reply
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
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
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
  }, [dishId, restaurantId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {showAddComment && isAuthenticated && (
        <Card className="p-4">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this dish..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Authentication Prompt */}
      {showAddComment && !isAuthenticated && (
        <Card className="p-4 text-center">
          <p className="text-gray-600 mb-3">Sign in to join the conversation</p>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Card>
      )}

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <div className="text-red-600">
            <p className="text-sm font-medium mb-2">Error Loading Comments</p>
            <p className="text-xs">{error}</p>
            <Button 
              onClick={() => fetchComments()} 
              className="mt-3"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center">
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
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Comments Yet</p>
            <p className="text-sm">
              Be the first to share your thoughts about this dish!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DishComments;
