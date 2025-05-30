import React from 'react';

/**
 * Collections component - STEP 1: Add props and basic structure
 */
function Collections({ countryName, getCountryLink }) {
  // Validate required props
  if (!countryName || typeof getCountryLink !== 'function') {
    return (
      <div>
        <h2>Collections</h2>
        <p>Missing required props</p>
      </div>
    );
  }

  // Mock data for testing
  const collections = [
    {
      id: '1',
      title: 'Best Street Food in KL',
      description: 'Discover the most authentic street food experiences',
      count: 12,
    },
    {
      id: '2',
      title: 'Hidden Gems',
      description: 'Off-the-beaten-path restaurants that locals love',
      count: 8,
    },
  ];

  return (
    <section className="py-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map(collection => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {collection.description}
              </p>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {collection.count} Places
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;
