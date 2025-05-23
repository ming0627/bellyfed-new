/**
 * Homepage Navigation Component
 * 
 * Main navigation component for the homepage with dynamic menu items.
 * Provides quick access to key sections and user-specific features.
 * 
 * Features:
 * - Responsive navigation menu
 * - User authentication state
 * - Dynamic menu items based on user role
 * - Search integration
 * - Country/location selector
 * - Mobile-friendly design
 */

import React, { useState, useEffect } from 'react'
import { Button, Badge } from '../ui/index.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js'

const HomepageNavigation = ({
  currentCountry = 'malaysia',
  showSearch = true,
  showCountrySelector = true,
  showUserMenu = true,
  className = ''
}) => {
  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(0)

  // Context
  const { user, isAuthenticated, logout } = useAuth()
  const { trackUserEngagement } = useAnalyticsContext()

  // Mock notifications
  useEffect(() => {
    if (isAuthenticated) {
      setNotifications(Math.floor(Math.random() * 5))
    }
  }, [isAuthenticated])

  // Navigation items
  const navigationItems = [
    {
      label: 'Explore',
      href: `/${currentCountry}/explore`,
      icon: '🗺️',
      description: 'Discover restaurants near you'
    },
    {
      label: 'Rankings',
      href: `/${currentCountry}/rankings`,
      icon: '🏆',
      description: 'Top dishes and restaurants'
    },
    {
      label: 'Social',
      href: `/${currentCountry}/social`,
      icon: '👥',
      description: 'Connect with food lovers'
    },
    {
      label: 'Competitions',
      href: `/${currentCountry}/competitions`,
      icon: '🎯',
      description: 'Food challenges and contests'
    }
  ]

  // User menu items
  const userMenuItems = isAuthenticated ? [
    {
      label: 'My Profile',
      href: `/${currentCountry}/profile`,
      icon: '👤'
    },
    {
      label: 'My Rankings',
      href: `/${currentCountry}/rankings/my`,
      icon: '📊'
    },
    {
      label: 'Favorites',
      href: `/${currentCountry}/favorites`,
      icon: '❤️'
    },
    {
      label: 'Settings',
      href: `/${currentCountry}/settings`,
      icon: '⚙️'
    }
  ] : [
    {
      label: 'Sign In',
      href: '/signin',
      icon: '🔑'
    },
    {
      label: 'Sign Up',
      href: '/signup',
      icon: '📝'
    }
  ]

  // Countries list
  const countries = [
    { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'singapore', name: 'Singapore', flag: '🇸🇬' },
    { code: 'thailand', name: 'Thailand', flag: '🇹🇭' },
    { code: 'indonesia', name: 'Indonesia', flag: '🇮🇩' }
  ]

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      trackUserEngagement('search', 'submit', 'homepage_nav', {
        query: searchQuery,
        country: currentCountry
      })
      window.location.href = `/${currentCountry}/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  // Handle navigation click
  const handleNavClick = (item) => {
    trackUserEngagement('navigation', 'click', item.label.toLowerCase(), {
      source: 'homepage_nav',
      country: currentCountry
    })
    window.location.href = item.href
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      trackUserEngagement('auth', 'logout', 'homepage_nav')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href={`/${currentCountry}`}
              className="flex items-center gap-2 text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              🍽️ Bellyfed
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors group"
                title={item.description}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search restaurants, dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Country Selector */}
            {showCountrySelector && (
              <div className="hidden sm:block">
                <select
                  value={currentCountry}
                  onChange={(e) => {
                    const newCountry = e.target.value
                    trackUserEngagement('country', 'change', newCountry, {
                      previousCountry: currentCountry
                    })
                    window.location.href = `/${newCountry}`
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
                <span className="text-xl">🔔</span>
                {notifications > 0 && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </button>
            )}

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {isAuthenticated ? (
                    <>
                      <img
                        src={user?.avatar || '/images/placeholder-avatar.jpg'}
                        alt={user?.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="hidden sm:block font-medium">
                        {user?.name || 'User'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">👤</span>
                      <span className="hidden sm:block font-medium">Account</span>
                    </>
                  )}
                  <span className="text-sm">▼</span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setIsMenuOpen(false)
                          if (item.label === 'Sign Out') {
                            handleLogout()
                          } else {
                            handleNavClick(item)
                          }
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                    
                    {isAuthenticated && (
                      <>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            {showSearch && (
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search restaurants, dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </form>
              </div>
            )}

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleNavClick(item)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-lg"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile Country Selector */}
            {showCountrySelector && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country/Region
                </label>
                <select
                  value={currentCountry}
                  onChange={(e) => {
                    const newCountry = e.target.value
                    setIsMenuOpen(false)
                    trackUserEngagement('country', 'change', newCountry, {
                      previousCountry: currentCountry
                    })
                    window.location.href = `/${newCountry}`
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}

export default HomepageNavigation
