/**
 * AI Chat Component
 * 
 * Interactive AI chatbot for food recommendations and restaurant queries.
 * Provides conversational interface for discovering restaurants and dishes.
 * 
 * Features:
 * - Real-time chat interface
 * - Context-aware responses
 * - Restaurant and dish suggestions
 * - Location-based recommendations
 * - Chat history persistence
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';
import { analyticsService } from '../../services/analyticsService.js';

const AIChat = ({
  userId = null,
  location = null,
  initialMessage = "Hi! I'm your AI food assistant. Ask me about restaurants, dishes, or get personalized recommendations!",
  showSuggestions = true,
  maxMessages = 50,
  className = ''
}) => {
  // State
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: initialMessage,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Suggested prompts
  const suggestedPrompts = [
    "What's the best pizza place near me?",
    "Recommend a romantic restaurant for dinner",
    "I'm craving sushi, any suggestions?",
    "Show me trending restaurants this week",
    "Find vegetarian-friendly places",
    "What's good for brunch today?"
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message to AI
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Track message sent
    trackUserEngagement('ai', 'chat', 'message_sent', {
      sessionId,
      messageLength: content.length,
      userId,
      location: location?.name || 'unknown'
    });

    try {
      // Get AI response
      const response = await analyticsService.sendChatMessage({
        message: content,
        sessionId,
        userId,
        location,
        country,
        context: {
          previousMessages: messages.slice(-5), // Last 5 messages for context
          userPreferences: {} // Could be passed from props
        }
      });

      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || [],
        recommendations: response.recommendations || []
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      // Track AI response
      trackUserEngagement('ai', 'chat', 'response_received', {
        sessionId,
        responseLength: response.message.length,
        hasSuggestions: !!response.suggestions?.length,
        hasRecommendations: !!response.recommendations?.length
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
    trackUserEngagement('ai', 'chat', 'suggestion_click', {
      suggestion,
      sessionId
    });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Track session end
      trackUserEngagement('ai', 'chat', 'session_end', {
        sessionId,
        messageCount: messages.length,
        duration: Date.now() - parseInt(sessionId.split('_')[1])
      });
    };
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 text-lg">🤖</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Food Assistant</h3>
          <p className="text-xs text-gray-500">
            {isTyping ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${message.type === 'user'
                  ? 'bg-orange-500 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.recommendations.map((rec, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-gray-900">
                      <p className="font-medium text-xs">{rec.name}</p>
                      <p className="text-xs text-gray-600">{rec.description}</p>
                      {rec.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          <span className="text-xs">{rec.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Default suggestions for new chats */}
      {showSuggestions && messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.slice(0, 4).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(prompt)}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about restaurants, dishes, or get recommendations..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            size="sm"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
