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
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 relative">
      <div className="content-container flex items-center justify-center">
        <span className="font-medium">
          ✨ Upgrade to Premium for exclusive rankings and features!
        </span>
        <button
          className="ml-4 bg-white/20 hover:bg-white/30 text-white border-white border px-3 py-1 rounded text-sm transition-colors"
          onClick={() => {
            // In real app, this would use router to navigate
            console.log('Navigate to premium page');
          }}
        >
          Learn More
        </button>
        <button
          onClick={handleClose}
          className="absolute right-4 text-white hover:text-white/80 hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Close premium banner"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default PremiumBanner;
