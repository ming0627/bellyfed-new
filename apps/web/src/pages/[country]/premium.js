import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Crown, 
  Star, 
  Check, 
  X, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  Eye,
  MessageSquare,
  Camera,
  MapPin,
  Calendar,
  Gift,
  Sparkles,
  ChefHat
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function PremiumPage() {
  const router = useRouter()
  const { country } = router.query
  const { user, isAuthenticated } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for casual food lovers',
      features: [
        { name: 'Basic restaurant search', included: true },
        { name: 'Write reviews', included: true },
        { name: 'Upload photos', included: true },
        { name: 'Follow other users', included: true },
        { name: 'Basic recommendations', included: true },
        { name: 'Advanced filters', included: false },
        { name: 'Priority support', included: false },
        { name: 'Ad-free experience', included: false },
        { name: 'Exclusive events', included: false },
        { name: 'Advanced analytics', included: false }
      ]
    },
    monthly: {
      name: 'Premium Monthly',
      price: 9.99,
      period: 'month',
      description: 'Full access to all premium features',
      popular: true,
      features: [
        { name: 'Everything in Free', included: true },
        { name: 'Advanced filters & search', included: true },
        { name: 'AI-powered recommendations', included: true },
        { name: 'Ad-free experience', included: true },
        { name: 'Priority customer support', included: true },
        { name: 'Exclusive restaurant events', included: true },
        { name: 'Advanced analytics dashboard', included: true },
        { name: 'Early access to new features', included: true },
        { name: 'Premium badges & status', included: true },
        { name: 'Unlimited photo uploads', included: true }
      ]
    },
    yearly: {
      name: 'Premium Yearly',
      price: 99.99,
      period: 'year',
      originalPrice: 119.88,
      description: 'Best value - save 17%',
      savings: '17% off',
      features: [
        { name: 'Everything in Premium Monthly', included: true },
        { name: 'Exclusive yearly member perks', included: true },
        { name: 'Free premium gift for a friend', included: true },
        { name: 'VIP access to food festivals', included: true },
        { name: 'Personal food concierge', included: true },
        { name: 'Custom restaurant recommendations', included: true }
      ]
    }
  }

  const premiumFeatures = [
    {
      icon: Zap,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized restaurant and dish recommendations based on your taste preferences and dining history.'
    },
    {
      icon: Eye,
      title: 'Advanced Analytics',
      description: 'Track your dining patterns, favorite cuisines, and discover insights about your food preferences.'
    },
    {
      icon: Shield,
      title: 'Ad-Free Experience',
      description: 'Enjoy a clean, distraction-free interface without any advertisements.'
    },
    {
      icon: Users,
      title: 'Exclusive Events',
      description: 'Get invited to premium food events, chef meetups, and exclusive restaurant openings.'
    },
    {
      icon: MessageSquare,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support from our customer service team.'
    },
    {
      icon: Camera,
      title: 'Unlimited Uploads',
      description: 'Upload unlimited high-quality photos and create stunning food galleries.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Food Blogger',
      avatar: '👩‍🍳',
      content: 'Premium has completely transformed how I discover restaurants. The AI recommendations are spot-on!',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Restaurant Owner',
      avatar: '👨‍💼',
      content: 'The analytics help me understand my customers better. Premium is worth every penny.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Food Enthusiast',
      avatar: '🍽️',
      content: 'Love the exclusive events! I\'ve met amazing chefs and tried incredible dishes.',
      rating: 5
    }
  ]

  const handleUpgrade = async (planType) => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Redirect to payment success page
      router.push(`/${country}/premium/success?plan=${planType}`)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-orange-100 mb-8">
            <Link href={`/${country}`} className="hover:text-white">
              {country}
            </Link>
            <span>/</span>
            <span className="text-white">Premium</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-16 h-16 mr-4" />
              <Sparkles className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Unlock the full potential of your food journey with AI-powered recommendations, 
              exclusive events, and premium features designed for true food enthusiasts.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-orange-100">Premium Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-orange-100">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-orange-100">Exclusive Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-orange-100">Priority Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-orange-700 dark:text-orange-300 text-lg">
            Start free and upgrade anytime. No hidden fees, cancel whenever you want.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative bg-white dark:bg-orange-900 rounded-lg shadow-sm border-2 transition-all ${
                plan.popular 
                  ? 'border-orange-500 shadow-lg scale-105' 
                  : 'border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.savings && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <div className="text-orange-500 line-through text-lg">
                        ${plan.originalPrice}
                      </div>
                    )}
                    <div className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                      ${plan.price}
                      {plan.price > 0 && (
                        <span className="text-lg font-normal text-orange-600 dark:text-orange-400">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-orange-900 dark:text-orange-100' 
                          : 'text-orange-500 dark:text-orange-400'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={isLoading || (key === 'free' && !isAuthenticated)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : key === 'free'
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : key === 'free' ? (
                    'Current Plan'
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-white dark:bg-orange-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
              Premium Features
            </h2>
            <p className="text-orange-700 dark:text-orange-300 text-lg">
              Discover what makes Premium the ultimate food lover's companion
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {premiumFeatures.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-orange-50 dark:bg-orange-800 rounded-lg"
              >
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
            What Our Premium Members Say
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{testimonial.avatar}</span>
                <div>
                  <div className="font-semibold text-orange-900 dark:text-orange-100">
                    {testimonial.name}
                  </div>
                  <div className="text-orange-600 dark:text-orange-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-current" />
                ))}
              </div>
              
              <p className="text-orange-700 dark:text-orange-300 italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-orange-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'Can I cancel my subscription anytime?',
                answer: 'Yes, you can cancel your Premium subscription at any time. You\'ll continue to have access to Premium features until the end of your billing period.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our payment partners.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes! New users get a 7-day free trial of Premium features. No credit card required to start your trial.'
              },
              {
                question: 'Can I upgrade or downgrade my plan?',
                answer: 'Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-orange-50 dark:bg-orange-800 rounded-lg p-6"
              >
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Elevate Your Food Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of food lovers who have upgraded to Premium
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleUpgrade('monthly')}
              className="px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
            >
              Start Free Trial
            </button>
            <Link
              href={`/${country}/restaurants`}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-500 transition-colors"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
