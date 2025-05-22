import React, { memo } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Github } from 'lucide-react';
import { useCountry } from '../../contexts/index.js';
import { LucideClientIcon } from '../ui/lucide-icon.js';

/**
 * Footer component for the site
 * 
 * @param {Object} props - Component props
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const Footer = memo(function Footer({ getCountryLink }) {
  const { currentCountry } = useCountry();
  const currentYear = new Date().getFullYear();

  // Footer links organized by category
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'For Foodies',
      links: [
        { href: '/restaurants', label: 'Restaurants' },
        { href: '/dish-restaurants', label: 'Top Dishes' },
        { href: '/social', label: 'Social Feed' },
        { href: '/competitions', label: 'Competitions' },
        { href: '/explore', label: 'Explore' },
      ],
    },
    {
      title: 'For Businesses',
      links: [
        { href: '/restaurant-management', label: 'Restaurant Management' },
        { href: '/advertise', label: 'Advertise' },
        { href: '/business-support', label: 'Business Support' },
        { href: '/analytics', label: 'Analytics' },
        { href: '/partner', label: 'Partner With Us' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/accessibility', label: 'Accessibility' },
        { href: '/sitemap', label: 'Sitemap' },
      ],
    },
  ];

  // Social media links
  const socialLinks = [
    { href: 'https://facebook.com/bellyfed', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com/bellyfed', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com/bellyfed', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com/bellyfed', icon: Youtube, label: 'YouTube' },
    { href: 'https://linkedin.com/company/bellyfed', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://github.com/bellyfed', icon: Github, label: 'GitHub' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link href={getCountryLink('/')} className="flex items-center mb-4">
              <span className="text-xl font-bold text-orange-500">Bellyfed</span>
              {currentCountry?.flagUrl && (
                <img
                  src={currentCountry.flagUrl}
                  alt={currentCountry.name || 'Country flag'}
                  className="w-6 h-4 ml-2"
                  loading="lazy"
                />
              )}
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Discover the best food experiences around you. Connect with fellow food lovers and share your culinary adventures.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                  aria-label={social.label}
                >
                  <LucideClientIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((category) => (
            <div key={category.title} className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={getCountryLink(link.href)}
                      className="text-gray-600 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Footer Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Bellyfed. All rights reserved.
              {currentCountry?.name && (
                <span className="ml-2">
                  {currentCountry.name} Edition
                </span>
              )}
            </p>
            <div className="flex space-x-6">
              <Link
                href={getCountryLink('/terms')}
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                href={getCountryLink('/privacy')}
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 text-sm transition-colors"
              >
                Privacy
              </Link>
              <Link
                href={getCountryLink('/cookies')}
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 text-sm transition-colors"
              >
                Cookies
              </Link>
              <Link
                href={getCountryLink('/sitemap')}
                className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 text-sm transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
