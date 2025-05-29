import { X } from 'lucide-react';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import { DynamicContent } from '@/components/ui/dynamic-content';
import { useCountry } from '@/contexts/CountryContext';

interface PremiumBannerProps {
  showPremiumBanner: boolean;
  setShowPremiumBanner: (show: boolean) => void;
}

export function PremiumBanner({
  showPremiumBanner,
  setShowPremiumBanner,
}: PremiumBannerProps): JSX.Element | null {
  const router = useRouter();
  const { currentCountry } = useCountry();

  if (!showPremiumBanner) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 relative">
      <div className="content-container flex items-center justify-center">
        <span className="font-medium">
          ✨ Upgrade to Premium for exclusive rankings and features!
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 bg-white/20 hover:bg-white/30 text-white border-white"
          onClick={() => router.push(`/${currentCountry.code}/premium`)}
        >
          Learn More
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 text-white hover:text-white/80 hover:bg-white/20"
          onClick={() => setShowPremiumBanner(false)}
        >
          <DynamicContent fallback={<span className="h-4 w-4"></span>}>
            <X className="h-4 w-4" />
          </DynamicContent>
        </Button>
      </div>
    </div>
  );
}
