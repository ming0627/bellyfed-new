import {
  getCountryStaticPaths,
  getCountryStaticProps,
} from '../../../utils/countryHelpers.js';

/**
 * Restaurants listing page for a specific country
 */
export default function RestaurantsPage({ country }) {
  // Get country name from code
  const getCountryName = code => {
    const countries = {
      us: 'United States',
      my: 'Malaysia',
      sg: 'Singapore',
      jp: 'Japan',
    };
    return countries[code] || 'Your Country';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Restaurants in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {getCountryName(country)}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover the best restaurants and dining experiences in your area.
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-600">
              We're working hard to bring you the best restaurant listings.
              Check back soon for an amazing dining discovery experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'us' } },
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
      { params: { country: 'jp' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
  };
}
