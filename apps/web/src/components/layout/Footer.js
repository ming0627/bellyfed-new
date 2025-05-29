import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, ArrowRight, Heart } from 'lucide-react';
/**
 * Footer component
 * Consolidated from .js and .tsx versions - preserving best features from both.
 *
 * @returns {JSX.Element} Footer component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Newsletter Section - enhanced from .tsx version */}
      <div className="border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Join our culinary community
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Subscribe to our newsletter for the latest food trends,
                restaurant openings, and exclusive offers.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                By subscribing, you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-orange-500">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column - enhanced from .tsx version */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-orange-500">Bellyfed</span>
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Discover the best food experiences around you. Explore
              restaurants, read reviews, and find your next favorite meal.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://twitter.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            <div className="pt-4">
              <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                <Heart className="w-3 h-3 mr-1 text-red-500" />
                Made with love for food enthusiasts
              </span>
            </div>
          </div>

          {/* Navigation Links - enhanced from .tsx version */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {/* Quick Links */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                  Discover
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/restaurants"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Restaurants
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/explore"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/social"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Social
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/competitions"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Competitions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/trending"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors flex items-center"
                    >
                      Trending
                      <span className="ml-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact - enhanced from .tsx version */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                  Contact Us
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <MapPin className="text-orange-500 mr-2 mt-0.5 flex-shrink-0 h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      123 Food Street, Cuisine City, FC 12345
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Phone className="text-orange-500 mr-2 flex-shrink-0 h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      +1 (555) 123-4567
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Mail className="text-orange-500 mr-2 flex-shrink-0 h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      info@bellyfed.com
                    </span>
                  </li>
                  <li className="pt-2">
                    <Link href="/contact">
                      <button className="px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg text-sm transition-colors flex items-center group">
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Copyright Section */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {currentYear} Bellyfed. All rights reserved.
          </p>

          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href="/accessibility"
              className="text-gray-500 hover:text-orange-500 text-sm"
            >
              Accessibility
            </Link>
            <Link
              href="/sitemap"
              className="text-gray-500 hover:text-orange-500 text-sm"
            >
              Sitemap
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-orange-500 text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
