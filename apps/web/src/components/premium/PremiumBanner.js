/**
 * Premium Banner Component
 * 
 * Displays a promotional banner for premium subscription features.
 * Shows benefits, pricing, and call-to-action buttons.
 * 
 * Features:
 * - Premium benefits showcase
 * - Pricing display
 * - Call-to-action buttons
 * - Dismissible banner
 * - Responsive design
 */

import React, { useState } from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';

const PremiumBanner = ({
  variant = 'default', // 'default', 'compact', 'hero'
  showDismiss = true,
  showPricing = true,
  showFeatures = true,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Premium features
  const features = [
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Filter by cuisine, price, dietary restrictions, and more'
    },
    {
      icon: '⭐',
      title: 'Exclusive Reviews',
      description: 'Access to premium critic reviews and insider recommendations'
    },
    {
      icon: '📱',
      title: 'Mobile App',
      description: 'Full-featured mobile app with offline access'
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions based on your taste preferences'
    },
    {
      icon: '🏆',
      title: 'Priority Support',
      description: '24/7 customer support and priority assistance'
    },
    {
      icon: '💰',
      title: 'Exclusive Deals',
      description: 'Special discounts and offers at partner restaurants'
    }
  ];

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    trackUserEngagement('premium', 'banner', 'dismiss', { variant });
  };

  // Handle upgrade click
  const handleUpgradeClick = () => {
    trackUserEngagement('premium', 'banner', 'upgrade_click', { variant });
  };

  // Handle learn more click
  const handleLearnMoreClick = () => {
    trackUserEngagement('premium', 'banner', 'learn_more_click', { variant });
  };

  if (isDismissed) {
    return null;
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={`p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <h3 className="font-semibold text-gray-900">Upgrade to Premium</h3>
              <p className="text-sm text-gray-600">Unlock exclusive features and benefits</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showPricing && (
              <div className="text-right mr-3">
                <p className="text-lg font-bold text-orange-600">$9.99/mo</p>
                <p className="text-xs text-gray-500">Cancel anytime</p>
              </div>
            )}
            
            <Link href={`/${country}/premium`}>
              <Button size="sm" onClick={handleUpgradeClick}>
                Upgrade
              </Button>
            </Link>
            
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Hero variant
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 ${className}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              ⭐ Premium Experience
            </Badge>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Discover More with
              <span className="block text-orange-200">Bellyfed Premium</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Unlock exclusive features, get personalized recommendations, and enjoy 
              priority access to the best dining experiences in your city.
            </p>

            {/* Pricing */}
            {showPricing && (
              <div className="mb-8">
                <div className="inline-flex items-baseline gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <span className="text-3xl font-bold text-white">$9.99</span>
                  <span className="text-orange-200">/month</span>
                  <span className="text-sm text-orange-200 ml-2">• Cancel anytime</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/${country}/premium`}>
                <Button 
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8"
                  onClick={handleUpgradeClick}
                >
                  Start Free Trial
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
                onClick={handleLearnMoreClick}
              >
                Learn More
              </Button>
            </div>

            {/* Features Grid */}
            {showFeatures && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-orange-100 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {showDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Card className={`overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⭐</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upgrade to Premium</h2>
              <p className="text-gray-600">Unlock the full Bellyfed experience</p>
            </div>
          </div>
          
          {showDismiss && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Features */}
        {showFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                <div className="text-xl">{feature.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pricing and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {showPricing && (
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-600">$9.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500">Cancel anytime • 7-day free trial</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Link href={`/${country}/premium`}>
              <Button onClick={handleLearnMoreClick} variant="outline">
                Learn More
              </Button>
            </Link>
            
            <Link href={`/${country}/premium`}>
              <Button onClick={handleUpgradeClick}>
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PremiumBanner;
