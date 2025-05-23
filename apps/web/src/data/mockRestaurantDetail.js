/**
 * Mock data for restaurant detail page
 */
export const mockRestaurantDetail = {
  id: '1',
  name: 'Village Park Restaurant',
  description: 'Famous for their signature Nasi Lemak with crispy fried chicken. Often crowded during peak hours.',
  imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=1200&h=600&fit=crop',
  rating: 4.8,
  reviewCount: 324,
  cuisine: 'Malaysian',
  priceRange: '$$',
  address: '5, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor, Malaysia',
  phone: '+60 3-7710 7860',
  website: 'https://www.facebook.com/VillageParkRestaurant/',
  coordinates: {
    latitude: 3.1347,
    longitude: 101.6215
  },
  isVerified: true,
  hours: {
    isOpen: true,
    status: 'Open Now',
    today: '8:00 AM - 8:00 PM',
    periods: [
      { day: 'Monday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Tuesday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Wednesday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Thursday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Friday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Saturday', open: '8:00 AM', close: '8:00 PM' },
      { day: 'Sunday', open: '8:00 AM', close: '8:00 PM' }
    ],
    notes: 'Kitchen closes 30 minutes before closing time.'
  },
  specialties: ['Nasi Lemak', 'Ayam Goreng', 'Curry Laksa'],
  tags: ['Local Favorite', 'Casual Dining', 'Family Friendly', 'Breakfast', 'Lunch', 'Dinner'],
  menu: {
    items: [
      {
        id: '101',
        name: 'Nasi Lemak with Fried Chicken',
        description: 'Fragrant coconut rice served with crispy fried chicken, sambal, fried anchovies, peanuts, cucumber, and boiled egg.',
        price: 'RM 15.90',
        category: 'Main Dishes',
        imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
        isPopular: true,
        isVegetarian: false,
        ingredients: ['Rice', 'Coconut milk', 'Pandan leaf', 'Fried chicken', 'Sambal', 'Anchovies', 'Peanuts', 'Cucumber', 'Egg'],
        allergens: ['Peanuts', 'Fish', 'Eggs']
      },
      {
        id: '102',
        name: 'Curry Laksa',
        description: 'Spicy coconut curry soup with yellow noodles, tofu puffs, bean sprouts, and your choice of chicken or seafood.',
        price: 'RM 14.90',
        category: 'Noodles',
        imageUrl: 'https://images.unsplash.com/photo-1626509653291-0d0162a9f664?q=80&w=600&h=400&fit=crop',
        isPopular: true,
        isVegetarian: false,
        ingredients: ['Yellow noodles', 'Coconut milk', 'Curry paste', 'Tofu puffs', 'Bean sprouts', 'Chicken/Seafood'],
        allergens: ['Shellfish', 'Soy', 'Fish']
      },
      {
        id: '103',
        name: 'Roti Canai with Dhal Curry',
        description: 'Flaky flatbread served with lentil curry.',
        price: 'RM 5.90',
        category: 'Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&h=400&fit=crop',
        isPopular: false,
        isVegetarian: true,
        ingredients: ['Flour', 'Ghee', 'Lentils', 'Spices'],
        allergens: ['Gluten', 'Dairy']
      },
      {
        id: '104',
        name: 'Teh Tarik',
        description: 'Malaysian pulled tea with condensed milk.',
        price: 'RM 3.50',
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=600&h=400&fit=crop',
        isPopular: false,
        isVegetarian: true,
        ingredients: ['Black tea', 'Condensed milk'],
        allergens: ['Dairy']
      }
    ],
    notes: 'Prices are subject to 6% service tax. Menu items may contain allergens. Please inform our staff of any allergies or dietary restrictions.'
  },
  reviews: [
    {
      id: '201',
      user: {
        id: '101',
        name: 'Sarah Chen',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
        reviewCount: 42
      },
      rating: 5,
      comment: 'The Nasi Lemak here is absolutely amazing! The coconut rice is perfectly cooked and fragrant, and the fried chicken is crispy on the outside and juicy on the inside. The sambal has just the right amount of spiciness. Definitely worth the wait!',
      date: '2023-05-15T00:00:00Z',
      likes: 24,
      photos: [
        'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop'
      ]
    },
    {
      id: '202',
      user: {
        id: '102',
        name: 'Mike Wong',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop',
        reviewCount: 18
      },
      rating: 4,
      comment: 'Great food but can get very crowded during peak hours. The Nasi Lemak is definitely their specialty, but I also recommend trying their Curry Laksa. Service is quick despite the crowd.',
      date: '2023-04-20T00:00:00Z',
      likes: 8,
      photos: []
    },
    {
      id: '203',
      user: {
        id: '103',
        name: 'Aisha Rahman',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop',
        reviewCount: 67
      },
      rating: 5,
      comment: 'One of the best Nasi Lemak places in KL! The rice is so fragrant and the sambal is perfect - spicy but not overwhelming. I also love their Teh Tarik. The place gets packed quickly so come early!',
      date: '2023-06-02T00:00:00Z',
      likes: 31,
      photos: [
        'https://images.unsplash.com/photo-1626509653291-0d0162a9f664?q=80&w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=600&h=400&fit=crop'
      ]
    }
  ],
  similarRestaurants: [
    {
      id: '2',
      name: 'Nasi Lemak Antarabangsa',
      imageUrl: 'https://images.unsplash.com/photo-1626509653291-0d0162a9f664?q=80&w=600&h=400&fit=crop',
      rating: 4.6,
      reviewCount: 256,
      cuisine: 'Malaysian',
      priceRange: '$',
      location: 'Kampung Baru, Kuala Lumpur',
      distance: '1.8 km',
      isOpen: true,
      isVerified: false,
      description: 'A local favorite serving authentic Nasi Lemak 24 hours a day. Known for their spicy sambal.'
    },
    {
      id: '3',
      name: 'Ali, Muthu & Ah Hock',
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&h=400&fit=crop',
      rating: 4.5,
      reviewCount: 189,
      cuisine: 'Malaysian',
      priceRange: '$$',
      location: 'Bangsar, Kuala Lumpur',
      distance: '4.5 km',
      isOpen: false,
      isVerified: true,
      description: 'Modern kopitiam serving a variety of Malaysian dishes including their popular Nasi Lemak with Rendang.'
    },
    {
      id: '4',
      name: 'Madam Kwan\'s',
      imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=400&fit=crop',
      rating: 4.3,
      reviewCount: 412,
      cuisine: 'Malaysian',
      priceRange: '$$$',
      location: 'KLCC, Kuala Lumpur',
      distance: '6.2 km',
      isOpen: true,
      isVerified: true,
      description: 'Upscale restaurant serving Malaysian classics in a modern setting. Famous for their Nasi Bojari.'
    }
  ]
};

// Export similar restaurants separately
export const mockSimilarRestaurants = mockRestaurantDetail.similarRestaurants;

// Default export
export default mockRestaurantDetail;
