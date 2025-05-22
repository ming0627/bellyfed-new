import React from 'react';
import Link from 'next/link';
import {
  Twitter,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-100 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-heading font-semibold text-neutral-800 dark:text-neutral-100">
                Join our culinary community
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
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
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <Button variant="primary" className="px-6 py-3" withRipple>
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                By subscribing, you agree to our{' '}
                <Link
                  href="/privacy"
                  className="underline hover:text-primary-500"
                >
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
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-heading font-bold text-gradient-primary">
                Bellyfed
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Discover the best food experiences around you. Explore
              restaurants, read reviews, and find your next favorite meal.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://twitter.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://facebook.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com/bellyfed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>

            <div className="pt-4">
              <Badge variant="soft" size="sm" className="inline-flex">
                <Heart className="w-3 h-3 mr-1" /> Made with love for food
                enthusiasts
              </Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {/* Quick Links */}
              <div>
                <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-100 mb-5">
                  Discover
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/restaurants"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Restaurants
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/explore"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Explore
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/social"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Social
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/competitions"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Competitions
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/trending"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Trending
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                      <Badge variant="new" size="xs" className="ml-2">
                        New
                      </Badge>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-100 mb-5">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        About Us
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Careers
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Contact
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Terms of Service
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors inline-flex items-center"
                    >
                      <span className="relative">
                        Privacy Policy
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-100 mb-5">
                  Contact Us
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <MapPin
                      size={16}
                      className="text-primary-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-neutral-600 dark:text-neutral-300 text-sm">
                      123 Food Street, Cuisine City, FC 12345
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Phone
                      size={16}
                      className="text-primary-500 mr-2 flex-shrink-0"
                    />
                    <span className="text-neutral-600 dark:text-neutral-300 text-sm">
                      +1 (555) 123-4567
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Mail
                      size={16}
                      className="text-primary-500 mr-2 flex-shrink-0"
                    />
                    <span className="text-neutral-600 dark:text-neutral-300 text-sm">
                      info@bellyfed.com
                    </span>
                  </li>
                  <li className="pt-2">
                    <Link href="/contact">
                      <Button variant="outline" size="sm" className="group">
                        Send Message
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} Bellyfed. All rights reserved.
          </p>

          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link
              href="/accessibility"
              className="text-neutral-500 hover:text-primary-500 text-sm"
            >
              Accessibility
            </Link>
            <Link
              href="/sitemap"
              className="text-neutral-500 hover:text-primary-500 text-sm"
            >
              Sitemap
            </Link>
            <Link
              href="/cookies"
              className="text-neutral-500 hover:text-primary-500 text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
