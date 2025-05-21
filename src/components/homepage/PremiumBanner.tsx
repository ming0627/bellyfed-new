import React from 'react';
import { X } from 'lucide-react';
import { LucideClientIcon } from '../ui/lucide-icon.js';

interface PremiumBannerProps {
  showPremiumBanner: boolean;
  setShowPremiumBanner: (show: boolean) => void;
}

export function PremiumBanner({
  showPremiumBanner,
  setShowPremiumBanner,
}: PremiumBannerProps): JSX.Element | null {
  if (!showPremiumBanner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center relative">
      <div className="container mx-auto">
        <p className="text-sm md:text-base">
          <span className="font-bold">Upgrade to Premium</span> for exclusive
          restaurant recommendations and priority bookings!{' '}
          <a
            href="#"
            className="underline font-semibold hover:text-white/90 transition-colors"
          >
            Learn more
          </a>
        </p>
        <button
          onClick={() => setShowPremiumBanner(false)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <LucideClientIcon icon={X} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
