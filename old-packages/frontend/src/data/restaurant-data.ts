export interface RestaurantRanking {
  id: string;
  name: string;
  totalReviews: number;
  rankingBreakdown: Array<{ rank: number; count: number }>;
  image: string;
  cuisine: string;
  location: string;
  priceRange: string; // $, $$, $$$, $$$$
  description: string;
}

export const getRestaurantRankings = (): RestaurantRanking[] => {
  // In a real app, this would be an API call using the dishId
  return [
    {
      id: '1',
      name: 'Sakura Japanese Dining',
      totalReviews: 1250,
      rankingBreakdown: [
        { rank: 1, count: 458 },
        { rank: 2, count: 325 },
        { rank: 3, count: 234 },
      ],
      image: '/images/restaurants/japanese-restaurant.jpg',
      cuisine: 'Japanese',
      location: 'Central District',
      priceRange: '$$$',
      description: 'Authentic Japanese cuisine with a modern twist.',
    },
    {
      id: '2',
      name: 'Golden Dragon Palace',
      totalReviews: 980,
      rankingBreakdown: [
        { rank: 1, count: 380 },
        { rank: 2, count: 350 },
        { rank: 3, count: 250 },
      ],
      image: '/images/restaurants/chinese-restaurant.jpg',
      cuisine: 'Chinese',
      location: 'Chinatown',
      priceRange: '$$',
      description:
        'Traditional Chinese dishes with a focus on Cantonese specialties.',
    },
    {
      id: '3',
      name: 'La Piazza',
      totalReviews: 856,
      rankingBreakdown: [
        { rank: 1, count: 350 },
        { rank: 2, count: 280 },
        { rank: 3, count: 226 },
      ],
      image: '/images/restaurants/italian-restaurant.jpg',
      cuisine: 'Italian',
      location: 'West End',
      priceRange: '$$$',
      description:
        'Authentic Italian cuisine with homemade pasta and wood-fired pizzas.',
    },
    {
      id: '4',
      name: 'Seoul Kitchen',
      totalReviews: 789,
      rankingBreakdown: [
        { rank: 1, count: 300 },
        { rank: 2, count: 280 },
        { rank: 3, count: 209 },
      ],
      image: '/images/restaurants/korean-restaurant.jpg',
      cuisine: 'Korean',
      location: 'K-Town',
      priceRange: '$$',
      description:
        'Modern Korean BBQ with traditional flavors and banchan sides.',
    },
    {
      id: '5',
      name: 'Spice Route',
      totalReviews: 934,
      rankingBreakdown: [
        { rank: 1, count: 280 },
        { rank: 2, count: 350 },
        { rank: 3, count: 304 },
      ],
      image: '/images/restaurants/indian-restaurant.jpg',
      cuisine: 'Indian',
      location: 'Little India',
      priceRange: '$$',
      description:
        'Flavorful Indian cuisine with a wide range of regional specialties.',
    },
    {
      id: '6',
      name: 'Le Bistro',
      totalReviews: 712,
      rankingBreakdown: [
        { rank: 1, count: 250 },
        { rank: 2, count: 300 },
        { rank: 3, count: 162 },
      ],
      image: '/images/restaurants/french-restaurant.jpg',
      cuisine: 'French',
      location: 'Downtown',
      priceRange: '$$$$',
      description:
        'Elegant French dining with classic techniques and seasonal ingredients.',
    },
    {
      id: '7',
      name: 'Taco Loco',
      totalReviews: 892,
      rankingBreakdown: [
        { rank: 1, count: 220 },
        { rank: 2, count: 280 },
        { rank: 3, count: 392 },
      ],
      image: '/images/restaurants/mexican-restaurant.jpg',
      cuisine: 'Mexican',
      location: 'South Side',
      priceRange: '$',
      description:
        'Casual Mexican street food with authentic flavors and fresh ingredients.',
    },
    {
      id: '8',
      name: 'Pho Delights',
      totalReviews: 678,
      rankingBreakdown: [
        { rank: 1, count: 200 },
        { rank: 2, count: 250 },
        { rank: 3, count: 228 },
      ],
      image: '/images/restaurants/vietnamese-restaurant.jpg',
      cuisine: 'Vietnamese',
      location: 'East Side',
      priceRange: '$',
      description:
        'Authentic Vietnamese pho and noodle dishes with fresh herbs and spices.',
    },
    {
      id: '9',
      name: 'Thai Orchid',
      totalReviews: 845,
      rankingBreakdown: [
        { rank: 1, count: 180 },
        { rank: 2, count: 320 },
        { rank: 3, count: 345 },
      ],
      image: '/images/restaurants/thai-restaurant.jpg',
      cuisine: 'Thai',
      location: 'North End',
      priceRange: '$$',
      description:
        'Vibrant Thai cuisine with a balance of sweet, sour, salty, and spicy flavors.',
    },
    {
      id: '10',
      name: 'Mediterranean Oasis',
      totalReviews: 688,
      rankingBreakdown: [
        { rank: 1, count: 150 },
        { rank: 2, count: 200 },
        { rank: 3, count: 338 },
      ],
      image: '/images/restaurants/mediterranean-restaurant.jpg',
      cuisine: 'Mediterranean',
      location: 'Harbor District',
      priceRange: '$$',
      description:
        'Fresh Mediterranean cuisine featuring mezze platters, kebabs, and seafood specialties.',
    },
  ];
};
