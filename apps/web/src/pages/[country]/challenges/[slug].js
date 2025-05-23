import { useRouter } from 'next/router';
import { useCountry } from '../../../contexts/CountryContext.js';

/**
 * Individual challenge page
 */
export default function ChallengePage() {
  const router = useRouter();
  const { currentCountry } = useCountry();
  const { country, slug } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Challenge'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Community challenge details coming soon.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge Details</h2>
            <p className="text-gray-600">
              We're working on bringing you exciting food challenges and community competitions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { country, slug } = params;

  // Validate country
  const supportedCountries = ['us', 'my', 'sg', 'jp'];
  if (!supportedCountries.includes(country)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      country,
      slug,
    },
  };
}
