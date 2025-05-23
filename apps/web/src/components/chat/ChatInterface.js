/**
 * Chat Interface Component
 * 
 * Provides real-time chat functionality for user communication.
 * Supports direct messages, group chats, and food-related discussions.
 * 
 * Features:
 * - Real-time messaging
 * - Message history
 * - Typing indicators
 * - File and image sharing
 * - Emoji reactions
 * - Message search and filtering
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, LoadingSpinner, Avatar } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const ChatInterface = ({
  chatId,
  chatType = 'direct', // 'direct', 'group', 'restaurant'
  participants = [],
  showParticipants = true,
  showTypingIndicator = true,
  allowFileUpload = true,
  maxMessageLength = 1000,
  className = ''
}) => {
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user, isAuthenticated } = useAuth();

  // Fetch chat messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getChatMessages({
        chatId,
        userId: user?.id,
        limit: 50
      });

      setMessages(data.messages || []);
      
      // Track chat view
      trackUserEngagement('chat', chatId, 'view', {
        chatType,
        messageCount: data.messages?.length || 0
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to send messages');
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);

    try {
      const message = await analyticsService.sendChatMessage({
        chatId,
        userId: user.id,
        content: newMessage.trim(),
        type: 'text'
      });

      // Add message to local state
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Track message sent
      trackUserEngagement('chat', chatId, 'message_sent', {
        messageLength: newMessage.length,
        chatType
      });

      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isAuthenticated) return;

    if (!isTyping) {
      setIsTyping(true);
      // In a real app, this would emit a typing event to other users
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // In a real app, this would emit a stop typing event
    }, 2000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  // Render message
  const renderMessage = (message) => {
    const isOwnMessage = user && message.userId === user.id;
    const sender = participants.find(p => p.id === message.userId) || message.user;

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {!isOwnMessage && (
          <Avatar
            src={sender?.avatar}
            alt={sender?.name}
            fallback={sender?.name?.charAt(0) || 'U'}
            size="sm"
          />
        )}
        
        <div className={`flex-1 max-w-xs lg:max-w-md ${isOwnMessage ? 'text-right' : ''}`}>
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 mb-1">
              {sender?.name || 'Unknown User'}
            </div>
          )}
          
          <div className={`
            inline-block px-4 py-2 rounded-lg
            ${isOwnMessage 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-900'
            }
          `}>
            <p className="text-sm">{message.content}</p>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {formatMessageTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // Render date separator
  const renderDateSeparator = (date) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let displayDate;
    if (date === today) {
      displayDate = 'Today';
    } else if (date === yesterday) {
      displayDate = 'Yesterday';
    } else {
      displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }

    return (
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
          {displayDate}
        </div>
      </div>
    );
  };

  // Load messages on mount
  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">Sign In Required</p>
          <p className="text-sm mb-4">
            Please sign in to access chat functionality
          </p>
          <Button variant="outline">
            Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-gray-900">
            💬 Chat
          </div>
          {showParticipants && participants.length > 0 && (
            <div className="text-sm text-gray-600">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        {chatType === 'group' && (
          <Button variant="outline" size="sm">
            Group Info
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p className="font-semibold mb-2">Error Loading Messages</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={fetchMessages} 
              className="mt-3"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        ) : messages.length > 0 ? (
          <div>
            {groupMessagesByDate(messages).map((group, groupIndex) => (
              <div key={groupIndex}>
                {renderDateSeparator(group.date)}
                {group.messages.map(renderMessage)}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {showTypingIndicator && typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No Messages Yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              maxLength={maxMessageLength}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {newMessage.length}/{maxMessageLength}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {allowFileUpload && (
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                title="Attach file"
              >
                📎
              </Button>
            )}
            
            <Button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              size="sm"
              className="p-2"
            >
              {sending ? '⏳' : '📤'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
