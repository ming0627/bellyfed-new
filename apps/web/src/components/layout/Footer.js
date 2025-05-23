import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Footer component
 *
 * @returns {JSX.Element} Footer component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-orange-500">Bellyfed</span>
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Discover and share great food experiences with Bellyfed.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                aria-label="GitHub"
              >
                <LucideClientIcon icon={Twitter} className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/restaurants"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  href="/social"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Social
                </Link>
              </li>
              <li>
                <Link
                  href="/competitions"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Competitions
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Explore Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            &copy; {currentYear} Bellyfed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
