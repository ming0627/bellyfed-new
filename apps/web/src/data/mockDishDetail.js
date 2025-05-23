/**
 * Mock data for dish detail page
 */
// Export the mock dish detail
export const mockDishDetail = {
  id: '1',
  name: 'Nasi Lemak',
  description: 'Nasi Lemak is a fragrant rice dish cooked in coconut milk and pandan leaf. It is commonly found in Malaysia, where it is considered the national dish.',
  imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=1200&h=600&fit=crop',
  rating: 4.8,
  reviewCount: 324,
  cuisine: 'Malaysian',
  ingredients: [
    'Coconut milk',
    'Rice',
    'Pandan leaf',
    'Cucumber',
    'Fried anchovies',
    'Roasted peanuts',
    'Sambal (spicy sauce)',
    'Fried egg',
    'Fried chicken (optional)'
  ],
  nutritionalInfo: {
    calories: 600,
    protein: '15g',
    carbs: '80g',
    fat: '25g',
    fiber: '5g'
  },
  allergens: ['Peanuts', 'Fish', 'Eggs'],
  spicyLevel: 'Medium',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: true,
  restaurants: [
    {
      id: '1',
      name: 'Village Park Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d95d051d?q=80&w=600&h=400&fit=crop',
      rating: 4.8,
      reviewCount: 324,
      cuisine: 'Malaysian',
      priceRange: '$$',
      location: 'Damansara, Kuala Lumpur',
      distance: '3.2 km',
      isOpen: true,
      isVerified: true,
      description: 'Famous for their signature Nasi Lemak with crispy fried chicken. Often crowded during peak hours.'
    },
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
    }
  ],
  reviews: [
    {
      id: '1',
      user: {
        id: '101',
        name: 'Sarah Chen',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
        reviewCount: 42
      },
      rating: 5,
      comment: 'The best Nasi Lemak I\'ve ever had! The sambal is perfectly spicy and the rice is so fragrant.',
      date: '2023-05-15T00:00:00Z',
      likes: 24,
      restaurantId: '1',
      restaurantName: 'Village Park Restaurant'
    },
    {
      id: '2',
      user: {
        id: '102',
        name: 'Mike Wong',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop',
        reviewCount: 18
      },
      rating: 4,
      comment: 'Really good Nasi Lemak, but I\'ve had better sambal elsewhere. The rice and sides are excellent though!',
      date: '2023-04-20T00:00:00Z',
      likes: 8,
      restaurantId: '2',
      restaurantName: 'Nasi Lemak Antarabangsa'
    },
    {
      id: '3',
      user: {
        id: '103',
        name: 'Aisha Rahman',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&fit=crop',
        reviewCount: 67
      },
      rating: 5,
      comment: 'Authentic Malaysian Nasi Lemak! The coconut rice is perfectly cooked and the sambal has just the right balance of spiciness and sweetness.',
      date: '2023-06-02T00:00:00Z',
      likes: 31,
      restaurantId: '1',
      restaurantName: 'Village Park Restaurant'
    }
  ],
  similarDishes: [
    {
      id: '2',
      name: 'Nasi Goreng',
      imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=600&h=400&fit=crop',
      rating: 4.7,
      reviewCount: 210,
      cuisine: 'Indonesian',
      description: 'Indonesian fried rice typically spiced with shrimp paste, tamarind, and chili.'
    },
    {
      id: '3',
      name: 'Nasi Kerabu',
      imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=400&fit=crop',
      rating: 4.6,
      reviewCount: 178,
      cuisine: 'Malaysian',
      description: 'Blue-colored rice served with various herbs, vegetables, and fish or chicken.'
    },
    {
      id: '4',
      name: 'Nasi Kandar',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=400&fit=crop',
      rating: 4.5,
      reviewCount: 156,
      cuisine: 'Malaysian',
      description: 'Steamed rice served with a variety of curries and side dishes.'
    }
  ]
};

// Export similar dishes separately
export const mockSimilarDishes = mockDishDetail.similarDishes;

// Default export
export default mockDishDetail;
