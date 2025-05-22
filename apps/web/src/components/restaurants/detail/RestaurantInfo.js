import React, { useState, memo } from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, Twitter, Award, Check, Info } from 'lucide-react';
import { LucideClientIcon } from '../../ui/lucide-icon.js';

/**
 * RestaurantInfo component for displaying general information about the restaurant
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @returns {JSX.Element} - Rendered component
 */
const RestaurantInfo = memo(function RestaurantInfo({ restaurant }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Toggle description expansion
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  
  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove non-numeric characters for href
    const numericPhone = phone.replace(/\D/g, '');
    
    return {
      display: phone,
      href: `tel:+${numericPhone}`,
    };
  };
  
  // Format website URL for display
  const formatWebsite = (website) => {
    if (!website) return '';
    
    // Remove protocol for display
    const display = website.replace(/^https?:\/\//, '');
    
    return {
      display,
      href: website.startsWith('http') ? website : `https://${website}`,
    };
  };
  
  // Get social media links
  const getSocialLinks = () => {
    const links = [];
    
    if (restaurant.contact?.socialMedia?.facebook) {
      links.push({
        name: 'Facebook',
        icon: Facebook,
        url: restaurant.contact.socialMedia.facebook,
      });
    }
    
    if (restaurant.contact?.socialMedia?.instagram) {
      links.push({
        name: 'Instagram',
        icon: Instagram,
        url: restaurant.contact.socialMedia.instagram,
      });
    }
    
    if (restaurant.contact?.socialMedia?.twitter) {
      links.push({
        name: 'Twitter',
        icon: Twitter,
        url: restaurant.contact.socialMedia.twitter,
      });
    }
    
    return links;
  };
  
  // Get restaurant features
  const getFeatures = () => {
    const features = [];
    
    if (restaurant.amenities && restaurant.amenities.length > 0) {
      features.push(...restaurant.amenities);
    }
    
    if (restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0) {
      features.push(...restaurant.dietaryOptions);
    }
    
    return features;
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        About {restaurant.name}
      </h2>
      
      {/* Description */}
      {restaurant.description && (
        <div className="mb-6">
          <p className={`text-gray-700 dark:text-gray-300 ${!showFullDescription && 'line-clamp-3'}`}>
            {restaurant.description}
          </p>
          {restaurant.description.length > 150 && (
            <button
              onClick={toggleDescription}
              className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-sm font-medium mt-2"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Contact Information
          </h3>
          
          <ul className="space-y-3">
            {restaurant.contact?.phone && (
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <LucideClientIcon icon={Phone} className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                <a
                  href={formatPhoneNumber(restaurant.contact.phone).href}
                  className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  {formatPhoneNumber(restaurant.contact.phone).display}
                </a>
              </li>
            )}
            
            {restaurant.contact?.email && (
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <LucideClientIcon icon={Mail} className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                <a
                  href={`mailto:${restaurant.contact.email}`}
                  className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  {restaurant.contact.email}
                </a>
              </li>
            )}
            
            {restaurant.contact?.website && (
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <LucideClientIcon icon={Globe} className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                <a
                  href={formatWebsite(restaurant.contact.website).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  {formatWebsite(restaurant.contact.website).display}
                </a>
              </li>
            )}
          </ul>
          
          {/* Social Media */}
          {getSocialLinks().length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Follow on Social Media
              </h4>
              <div className="flex space-x-3">
                {getSocialLinks().map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    aria-label={`Follow on ${link.name}`}
                  >
                    <LucideClientIcon icon={link.icon} className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Features and Certifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Features
          </h3>
          
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {getFeatures().map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                <LucideClientIcon icon={Check} className="w-4 h-4 text-green-500 mr-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Payment Methods */}
          {restaurant.paymentMethods && restaurant.paymentMethods.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Methods
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {restaurant.paymentMethods.join(', ')}
              </p>
            </div>
          )}
          
          {/* Certifications */}
          {restaurant.certifications && restaurant.certifications.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certifications
              </h4>
              <ul className="space-y-1">
                {restaurant.certifications.map((cert, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <LucideClientIcon icon={Award} className="w-4 h-4 text-yellow-500 mr-2" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Restaurant Owner */}
      {restaurant.owner && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            About the Owner
          </h3>
          
          <div className="flex items-start">
            {restaurant.owner.imageUrl && (
              <img
                src={restaurant.owner.imageUrl}
                alt={restaurant.owner.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            )}
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {restaurant.owner.name}
              </h4>
              {restaurant.owner.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {restaurant.owner.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional Information */}
      {restaurant.establishedYear && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <LucideClientIcon icon={Info} className="w-4 h-4 mr-2" />
          <span>Established in {restaurant.establishedYear}</span>
        </div>
      )}
    </section>
  );
});

export default RestaurantInfo;
