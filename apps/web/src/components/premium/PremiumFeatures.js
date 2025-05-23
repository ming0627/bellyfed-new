/**
 * Premium Features Component
 * 
 * Displays detailed information about premium subscription features
 * with comparisons, benefits, and interactive elements.
 * 
 * Features:
 * - Feature comparison table
 * - Interactive feature cards
 * - Benefit highlights
 * - Pricing information
 * - Call-to-action elements
 */

import React, { useState } from 'react';
import { Card, Badge, Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const PremiumFeatures = ({
  showComparison = true,
  showPricing = true,
  showTestimonials = false,
  className = ''
}) => {
  const [activeFeature, setActiveFeature] = useState(null);
  const { trackUserEngagement } = useAnalyticsContext();

  // Premium features with detailed information
  const features = [
    {
      id: 'search',
      icon: '🔍',
      title: 'Advanced Search & Filters',
      description: 'Find exactly what you\'re looking for with powerful search tools',
      details: [
        'Filter by cuisine type, price range, and dietary restrictions',
        'Search by specific dishes, ingredients, or cooking methods',
        'Location-based search with distance and area filters',
        'Save and share custom search queries',
        'Real-time availability and reservation status'
      ],
      free: 'Basic search only',
      premium: 'Full advanced search with all filters'
    },
    {
      id: 'reviews',
      icon: '⭐',
      title: 'Exclusive Reviews & Ratings',
      description: 'Access premium content from top food critics and experts',
      details: [
        'Professional critic reviews and ratings',
        'Detailed dish-by-dish breakdowns',
        'Behind-the-scenes restaurant insights',
        'Early access to new restaurant reviews',
        'Exclusive interviews with chefs and owners'
      ],
      free: 'User reviews only',
      premium: 'Professional + user reviews'
    },
    {
      id: 'recommendations',
      icon: '🎯',
      title: 'AI-Powered Recommendations',
      description: 'Get personalized suggestions based on your unique taste profile',
      details: [
        'Machine learning-based taste profiling',
        'Personalized restaurant and dish recommendations',
        'Seasonal and trending suggestions',
        'Group dining recommendations for multiple preferences',
        'Smart notifications for new matches'
      ],
      free: 'Basic recommendations',
      premium: 'AI-powered personalization'
    },
    {
      id: 'mobile',
      icon: '📱',
      title: 'Premium Mobile App',
      description: 'Full-featured mobile experience with offline capabilities',
      details: [
        'Offline access to saved restaurants and reviews',
        'GPS-based restaurant discovery',
        'Mobile-exclusive features and shortcuts',
        'Push notifications for deals and updates',
        'Seamless sync across all devices'
      ],
      free: 'Basic mobile web',
      premium: 'Full native app experience'
    },
    {
      id: 'deals',
      icon: '💰',
      title: 'Exclusive Deals & Offers',
      description: 'Save money with member-only discounts and special offers',
      details: [
        'Member-only restaurant discounts up to 30%',
        'Early access to special events and tastings',
        'Complimentary appetizers and desserts',
        'Priority reservations during peak times',
        'Exclusive access to chef\'s table experiences'
      ],
      free: 'Public deals only',
      premium: 'Exclusive member deals'
    },
    {
      id: 'support',
      icon: '🏆',
      title: 'Priority Customer Support',
      description: '24/7 premium support with dedicated assistance',
      details: [
        '24/7 customer support via chat, email, and phone',
        'Dedicated premium support team',
        'Priority response times (under 1 hour)',
        'Personalized dining assistance and recommendations',
        'Concierge services for special occasions'
      ],
      free: 'Standard support',
      premium: '24/7 priority support'
    }
  ];

  // Pricing plans
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic restaurant search',
        'User reviews and ratings',
        'Basic recommendations',
        'Mobile web access',
        'Standard support'
      ],
      limitations: [
        'Limited search filters',
        'No professional reviews',
        'Basic recommendations only',
        'No offline access',
        'No exclusive deals'
      ]
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      popular: true,
      features: [
        'Advanced search & filters',
        'Professional critic reviews',
        'AI-powered recommendations',
        'Premium mobile app',
        'Exclusive deals & offers',
        '24/7 priority support',
        'Offline access',
        'Early access to new features'
      ]
    }
  ];

  // Handle feature interaction
  const handleFeatureClick = (featureId) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
    trackUserEngagement('premium', 'features', 'feature_click', { featureId });
  };

  // Handle upgrade click
  const handleUpgradeClick = (plan) => {
    trackUserEngagement('premium', 'features', 'upgrade_click', { plan: plan.name });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Premium Features
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of Bellyfed with our premium subscription. 
          Get access to exclusive features, professional reviews, and personalized recommendations.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.id}
            className={`
              p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
              ${activeFeature === feature.id ? 'ring-2 ring-orange-500 shadow-lg' : ''}
            `}
            onClick={() => handleFeatureClick(feature.id)}
          >
            {/* Feature Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-3xl">{feature.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>

            {/* Feature Details (Expandable) */}
            {activeFeature === feature.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Free vs Premium */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Free:</span>
                  <span className="text-gray-600">{feature.free}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600 font-medium">Premium:</span>
                  <span className="text-orange-600 font-medium">{feature.premium}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Feature Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Free</th>
                  <th className="text-center py-3 px-4 font-medium text-orange-600">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{feature.icon}</span>
                        <span>{feature.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {feature.free}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-orange-600 font-medium">
                      {feature.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pricing Plans */}
      {showPricing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`
                p-6 relative
                ${plan.popular ? 'ring-2 ring-orange-500 shadow-lg' : ''}
              `}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500">
                  Most Popular
                </Badge>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              {/* Plan Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Plan Limitations (for free plan) */}
              {plan.limitations && (
                <ul className="space-y-2 mb-6 pb-6 border-b border-gray-100">
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 mt-0.5">✗</span>
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Action Button */}
              <Button
                className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                onClick={() => handleUpgradeClick(plan)}
                disabled={plan.name === 'Free'}
              >
                {plan.name === 'Free' ? 'Current Plan' : 'Start Free Trial'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumFeatures;
