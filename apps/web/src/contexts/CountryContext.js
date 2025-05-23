import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define the shape of a country
// Country: { code: string, name: string, currency: string, locale: string, flag: string }

// Define the shape of the country context
// CountryContextType: {
//   currentCountry: Country | null,
//   isInitialized: boolean,
//   setCountry: (countryCode: string) => void,
//   countries: Country[]
// }

// Mock countries data with comprehensive ranking information
const COUNTRIES = [
  {
    code: 'us',
    name: 'United States',
    currency: 'USD',
    locale: 'en-US',
    flag: '🇺🇸',
    reviewers: [
      {
        name: 'Sarah Johnson',
        reviews: 342,
        highlight: false,
        badges: [{ type: 'expertise', name: 'BBQ Expert', icon: '🍖', category: 'American' }]
      },
      {
        name: 'Mike Chen',
        reviews: 298,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Asian Fusion', icon: '🥢', category: 'Asian' }]
      },
      {
        name: 'Emily Rodriguez',
        reviews: 276,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Dessert Specialist', icon: '🍰', category: 'Desserts' }]
      },
      {
        name: 'David Kim',
        reviews: 251,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Pizza Connoisseur', icon: '🍕', category: 'Italian' }]
      },
      {
        name: 'Lisa Thompson',
        reviews: 234,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Vegan Expert', icon: '🥗', category: 'Healthy' }]
      }
    ],
    dishes: [
      {
        name: 'Classic Cheeseburger',
        votes: 1847,
        highlight: false,
        badge: 'Trending'
      },
      {
        name: 'New York Style Pizza',
        votes: 1623,
        highlight: false,
        badge: 'Popular'
      },
      {
        name: 'BBQ Ribs',
        votes: 1456,
        highlight: false,
        badge: 'Rising'
      },
      {
        name: 'Fish Tacos',
        votes: 1298,
        highlight: false,
        badge: 'Hot'
      },
      {
        name: 'Chocolate Brownie',
        votes: 1187,
        highlight: false,
        badge: 'Sweet'
      }
    ],
    locations: [
      {
        name: 'Manhattan',
        restaurants: 1247,
        new: '+23 this month',
        highlight: false
      },
      {
        name: 'Brooklyn',
        restaurants: 892,
        new: '+18 this month',
        highlight: false
      },
      {
        name: 'Queens',
        restaurants: 634,
        new: '+15 this month',
        highlight: false
      },
      {
        name: 'The Bronx',
        restaurants: 423,
        new: '+12 this month',
        highlight: false
      },
      {
        name: 'Staten Island',
        restaurants: 287,
        new: '+8 this month',
        highlight: false
      }
    ]
  },
  {
    code: 'my',
    name: 'Malaysia',
    currency: 'MYR',
    locale: 'ms-MY',
    flag: '🇲🇾',
    reviewers: [
      {
        name: 'Ahmad Rahman',
        reviews: 289,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Nasi Lemak Expert', icon: '🍚', category: 'Malaysian' }]
      },
      {
        name: 'Siti Nurhaliza',
        reviews: 267,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Rendang Specialist', icon: '🍛', category: 'Malaysian' }]
      },
      {
        name: 'Lim Wei Ming',
        reviews: 245,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Dim Sum Master', icon: '🥟', category: 'Chinese' }]
      },
      {
        name: 'Priya Sharma',
        reviews: 223,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Curry Expert', icon: '🍛', category: 'Indian' }]
      },
      {
        name: 'Hassan Ali',
        reviews: 201,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Satay King', icon: '🍢', category: 'Malaysian' }]
      }
    ],
    dishes: [
      {
        name: 'Nasi Lemak',
        votes: 2156,
        highlight: false,
        badge: 'National Favorite'
      },
      {
        name: 'Char Kway Teow',
        votes: 1834,
        highlight: false,
        badge: 'Street Food'
      },
      {
        name: 'Rendang',
        votes: 1672,
        highlight: false,
        badge: 'Traditional'
      },
      {
        name: 'Laksa',
        votes: 1523,
        highlight: false,
        badge: 'Spicy'
      },
      {
        name: 'Satay',
        votes: 1398,
        highlight: false,
        badge: 'Grilled'
      }
    ],
    locations: [
      {
        name: 'Kuala Lumpur',
        restaurants: 1456,
        new: '+34 this month',
        highlight: false
      },
      {
        name: 'Penang',
        restaurants: 823,
        new: '+21 this month',
        highlight: false
      },
      {
        name: 'Johor Bahru',
        restaurants: 567,
        new: '+16 this month',
        highlight: false
      },
      {
        name: 'Ipoh',
        restaurants: 398,
        new: '+11 this month',
        highlight: false
      },
      {
        name: 'Melaka',
        restaurants: 312,
        new: '+9 this month',
        highlight: false
      }
    ]
  },
  {
    code: 'sg',
    name: 'Singapore',
    currency: 'SGD',
    locale: 'en-SG',
    flag: '🇸🇬',
    reviewers: [
      {
        name: 'Tan Wei Liang',
        reviews: 312,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Hawker Expert', icon: '🍜', category: 'Local' }]
      },
      {
        name: 'Rachel Wong',
        reviews: 287,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Fine Dining', icon: '🍾', category: 'Luxury' }]
      },
      {
        name: 'Kumar Patel',
        reviews: 264,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Indian Cuisine', icon: '🍛', category: 'Indian' }]
      },
      {
        name: 'Chen Li Ming',
        reviews: 241,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Zi Char Master', icon: '🥘', category: 'Chinese' }]
      },
      {
        name: 'Maria Santos',
        reviews: 218,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Peranakan Food', icon: '🦐', category: 'Peranakan' }]
      }
    ],
    dishes: [
      {
        name: 'Hainanese Chicken Rice',
        votes: 1923,
        highlight: false,
        badge: 'National Dish'
      },
      {
        name: 'Laksa',
        votes: 1687,
        highlight: false,
        badge: 'Spicy'
      },
      {
        name: 'Chili Crab',
        votes: 1534,
        highlight: false,
        badge: 'Signature'
      },
      {
        name: 'Bak Kut Teh',
        votes: 1421,
        highlight: false,
        badge: 'Comfort Food'
      },
      {
        name: 'Kaya Toast',
        votes: 1298,
        highlight: false,
        badge: 'Breakfast'
      }
    ],
    locations: [
      {
        name: 'Central Business District',
        restaurants: 892,
        new: '+19 this month',
        highlight: false
      },
      {
        name: 'Orchard Road',
        restaurants: 634,
        new: '+14 this month',
        highlight: false
      },
      {
        name: 'Chinatown',
        restaurants: 523,
        new: '+12 this month',
        highlight: false
      },
      {
        name: 'Little India',
        restaurants: 398,
        new: '+10 this month',
        highlight: false
      },
      {
        name: 'Bugis',
        restaurants: 287,
        new: '+8 this month',
        highlight: false
      }
    ]
  },
  {
    code: 'jp',
    name: 'Japan',
    currency: 'JPY',
    locale: 'ja-JP',
    flag: '🇯🇵',
    reviewers: [
      {
        name: 'Takeshi Yamamoto',
        reviews: 356,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Ramen Master', icon: '🍜', category: 'Japanese' }]
      },
      {
        name: 'Yuki Tanaka',
        reviews: 334,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Sushi Expert', icon: '🍣', category: 'Japanese' }]
      },
      {
        name: 'Hiroshi Sato',
        reviews: 312,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Tempura Specialist', icon: '🍤', category: 'Japanese' }]
      },
      {
        name: 'Akiko Nakamura',
        reviews: 289,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Wagyu Connoisseur', icon: '🥩', category: 'Japanese' }]
      },
      {
        name: 'Kenji Watanabe',
        reviews: 267,
        highlight: false,
        badges: [{ type: 'expertise', name: 'Sake Sommelier', icon: '🍶', category: 'Japanese' }]
      }
    ],
    dishes: [
      {
        name: 'Tonkotsu Ramen',
        votes: 2234,
        highlight: false,
        badge: 'Soul Food'
      },
      {
        name: 'Omakase Sushi',
        votes: 1987,
        highlight: false,
        badge: 'Premium'
      },
      {
        name: 'Wagyu Beef',
        votes: 1756,
        highlight: false,
        badge: 'Luxury'
      },
      {
        name: 'Tempura Set',
        votes: 1623,
        highlight: false,
        badge: 'Traditional'
      },
      {
        name: 'Yakitori',
        votes: 1489,
        highlight: false,
        badge: 'Grilled'
      }
    ],
    locations: [
      {
        name: 'Shibuya',
        restaurants: 1634,
        new: '+28 this month',
        highlight: false
      },
      {
        name: 'Shinjuku',
        restaurants: 1423,
        new: '+25 this month',
        highlight: false
      },
      {
        name: 'Ginza',
        restaurants: 987,
        new: '+18 this month',
        highlight: false
      },
      {
        name: 'Harajuku',
        restaurants: 756,
        new: '+15 this month',
        highlight: false
      },
      {
        name: 'Roppongi',
        restaurants: 634,
        new: '+12 this month',
        highlight: false
      }
    ]
  },
];

// Create the context with a default value
const CountryContext = createContext({
  currentCountry: null,
  isInitialized: false,
  setCountry: () => {},
  countries: COUNTRIES,
  updateRankingData: () => {},
});

export const CountryProvider = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize country from URL or default to US
  useEffect(() => {
    if (!router.isReady) return;

    const { country } = router.query;
    const countryCode = Array.isArray(country) ? country[0] : country;

    if (countryCode) {
      const foundCountry = COUNTRIES.find(c => c.code === countryCode);
      if (foundCountry) {
        setCurrentCountry(foundCountry);
      } else {
        // If country code is invalid, default to US
        setCurrentCountry(COUNTRIES[0]);
        // Redirect to valid country
        router.replace(`/${COUNTRIES[0].code}${router.pathname.replace('[country]', COUNTRIES[0].code)}`);
      }
    } else if (router.pathname === '/') {
      // On root path, default to US
      setCurrentCountry(COUNTRIES[0]);
    }

    setIsInitialized(true);
  }, [router.isReady, router.query, router.pathname]);

  // Function to change country
  const setCountry = (countryCode) => {
    const foundCountry = COUNTRIES.find(c => c.code === countryCode);
    if (foundCountry) {
      setCurrentCountry(foundCountry);

      // In a real app, you might want to redirect to the same page but with the new country
      if (router.pathname.includes('[country]')) {
        const newPath = router.pathname.replace('[country]', countryCode);
        router.push(newPath);
      }
    }
  };

  // Function to update ranking data with animations
  const updateRankingData = () => {
    if (!currentCountry) return;

    setCurrentCountry(prev => {
      if (!prev) return prev;

      // Create updated data with random changes for animation
      const updatedReviewers = prev.reviewers.map(reviewer => {
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const newReviews = Math.max(0, reviewer.reviews + change);
        return {
          ...reviewer,
          reviews: newReviews,
          highlight: change !== 0,
        };
      }).sort((a, b) => b.reviews - a.reviews);

      const updatedDishes = prev.dishes.map(dish => {
        const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
        const newVotes = Math.max(0, dish.votes + change);
        return {
          ...dish,
          votes: newVotes,
          highlight: change !== 0,
        };
      }).sort((a, b) => b.votes - a.votes);

      const updatedLocations = prev.locations.map(location => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        const newRestaurants = Math.max(0, location.restaurants + change);
        const newAdded = `+${Math.floor(Math.random() * 15 + 5)} this month`;
        return {
          ...location,
          restaurants: newRestaurants,
          new: newAdded,
          highlight: change !== 0,
        };
      }).sort((a, b) => b.restaurants - a.restaurants);

      return {
        ...prev,
        reviewers: updatedReviewers,
        dishes: updatedDishes,
        locations: updatedLocations,
      };
    });

    // Clear highlights after animation
    setTimeout(() => {
      setCurrentCountry(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviewers: prev.reviewers.map(r => ({ ...r, highlight: false })),
          dishes: prev.dishes.map(d => ({ ...d, highlight: false })),
          locations: prev.locations.map(l => ({ ...l, highlight: false })),
        };
      });
    }, 2000);
  };

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        isInitialized,
        setCountry,
        countries: COUNTRIES,
        updateRankingData,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

// Custom hook to use the country context
export const useCountry = () => useContext(CountryContext);

export default CountryContext;