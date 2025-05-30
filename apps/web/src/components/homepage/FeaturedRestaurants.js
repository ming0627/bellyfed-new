import React from 'react';

/**
 * FeaturedRestaurants component - STEP 1: Add props and basic structure
 */
function FeaturedRestaurants({ countryName, getCountryLink }) {
  // Validate required props
  if (!countryName || typeof getCountryLink !== 'function') {
    return (
      <div>
        <h2>Featured Restaurants</h2>
        <p>Missing required props</p>
      </div>
    );
  }

  // Mock data for testing
  const restaurants = [
    {
      id: '1',
      name: 'Nasi Lemak House',
      location: 'Bukit Bintang, KL',
      rating: 4.7,
      reviewCount: 256,
    },
    {
      id: '2',
      name: 'Sushi Sensation',
      location: 'KLCC, Kuala Lumpur',
      rating: 4.8,
      reviewCount: 189,
    },
  ];

  return (
    <section className="py-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Featured Restaurants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurants.map(restaurant => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
              <p className="text-sm text-gray-500">{restaurant.location}</p>
              <p className="text-sm">
                Rating: {restaurant.rating} ({restaurant.reviewCount} reviews)
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedRestaurants;
