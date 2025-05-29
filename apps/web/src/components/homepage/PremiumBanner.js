import React, { memo, useCallback } from 'react';
import { X } from 'lucide-react';
/**
 * PremiumBanner component displays a promotional banner for premium features
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showPremiumBanner - Whether to show the banner
 * @param {Function} props.setShowPremiumBanner - Function to toggle banner visibility
 * @returns {JSX.Element|null} - Rendered component or null if hidden
 */
const PremiumBanner = memo(function PremiumBanner({
  showPremiumBanner,
  setShowPremiumBanner,
}) {
  // Memoize the close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    setShowPremiumBanner(false);
  }, [setShowPremiumBanner]);

  // Early return if banner should be hidden
  if (!showPremiumBanner) return null;

  // Validate required props
  if (typeof setShowPremiumBanner !== 'function') {
    console.error(
      'PremiumBanner component missing required setShowPremiumBanner function',
    );
    return null;
  }

  return (
    <div
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center relative"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto">
        <p className="text-sm md:text-base">
          <span className="font-bold">Upgrade to Premium</span> for exclusive
          restaurant recommendations and priority bookings!{' '}
          <a
            href="/premium"
            className="underline font-semibold hover:text-white/90 transition-colors"
            aria-label="Learn more about premium features"
          >
            Learn more
          </a>
        </p>
        <button
          onClick={handleClose}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Close premium banner"
          type="button"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default PremiumBanner;
