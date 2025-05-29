interface DishRanking {
  id: string;
  name: string;
  restaurantName: string;
  description: string;
  rating: number;
  numberOfRatings: number;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  spicyLevel: number;
  country: string;
}

export const dishRankings: DishRanking[] = [
  // Malaysian dishes
  {
    id: '1',
    name: 'Nasi Lemak Special',
    restaurantName: 'Village Park Restaurant',
    description:
      'Fragrant coconut rice served with spicy sambal, crispy anchovies, roasted peanuts, cucumber slices, and a perfectly cooked egg',
    rating: 4.8,
    numberOfRatings: 1250,
    price: 15.9,
    image:
      'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000',
    category: 'Malaysian',
    isVegetarian: false,
    spicyLevel: 2,
    country: 'my',
  },
  {
    id: '2',
    name: 'Vegetarian Curry Laksa',
    restaurantName: 'Pure Veg Kitchen',
    description:
      'Rich coconut curry broth with tofu, vegetables, and rice noodles, garnished with fresh herbs',
    rating: 4.6,
    numberOfRatings: 850,
    price: 18.9,
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    category: 'Malaysian',
    isVegetarian: true,
    spicyLevel: 3,
    country: 'my',
  },
  {
    id: '3',
    name: 'Char Kway Teow',
    restaurantName: 'Penang Famous',
    description:
      'Wok-fried flat rice noodles with shrimp, Chinese sausage, bean sprouts, and chives in a rich soy sauce',
    rating: 4.7,
    numberOfRatings: 980,
    price: 14.9,
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    category: 'Chinese',
    isVegetarian: false,
    spicyLevel: 1,
    country: 'my',
  },
  {
    id: '4',
    name: 'Roti Canai Set',
    restaurantName: 'Mamak Corner',
    description: 'Flaky flatbread served with curry sauce, dhal, and sambal',
    rating: 4.5,
    numberOfRatings: 1100,
    price: 8.9,
    image:
      'https://images.unsplash.com/photo-1633237308525-cd587cf71926?q=80&w=1000',
    category: 'Indian',
    isVegetarian: true,
    spicyLevel: 2,
    country: 'my',
  },
  {
    id: '5',
    name: 'Satay Platter',
    restaurantName: 'Satay Station',
    description:
      'Grilled chicken and beef skewers served with peanut sauce, cucumber, and ketupat',
    rating: 4.9,
    numberOfRatings: 1500,
    price: 25.9,
    image:
      'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?q=80&w=1000',
    category: 'Malaysian',
    isVegetarian: false,
    spicyLevel: 1,
    country: 'my',
  },
  {
    id: '6',
    name: 'Hokkien Mee',
    restaurantName: 'Wok Master',
    description:
      'Thick yellow noodles braised in rich dark soy sauce with pork, prawns, and vegetables',
    rating: 4.6,
    numberOfRatings: 750,
    price: 16.9,
    image:
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
    category: 'Chinese',
    isVegetarian: false,
    spicyLevel: 0,
    country: 'my',
  },
  // Singapore dishes
  {
    id: '7',
    name: 'Chili Crab',
    restaurantName: 'Jumbo Seafood',
    description:
      'Fresh mud crab stir-fried in a sweet, savory and spicy tomato and chili-based sauce, served with mantou',
    rating: 4.9,
    numberOfRatings: 2100,
    price: 85.0,
    image:
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1000',
    category: 'Seafood',
    isVegetarian: false,
    spicyLevel: 2,
    country: 'sg',
  },
  {
    id: '8',
    name: 'Hainanese Chicken Rice',
    restaurantName: 'Tian Tian Chicken Rice',
    description:
      'Tender poached chicken served with fragrant rice cooked in chicken broth, accompanied by chili sauce and ginger paste',
    rating: 4.8,
    numberOfRatings: 3200,
    price: 5.5,
    image:
      'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000',
    category: 'Chinese',
    isVegetarian: false,
    spicyLevel: 0,
    country: 'sg',
  },
  {
    id: '9',
    name: 'Laksa',
    restaurantName: '328 Katong Laksa',
    description:
      'Rich and spicy coconut curry soup with rice noodles, prawns, fishcake, and cockles',
    rating: 4.7,
    numberOfRatings: 1800,
    price: 7.5,
    image:
      'https://images.unsplash.com/photo-1583835746434-cf1534674b41?q=80&w=1000',
    category: 'Chinese',
    isVegetarian: false,
    spicyLevel: 3,
    country: 'sg',
  },
  {
    id: '10',
    name: 'Kaya Toast Set',
    restaurantName: 'Ya Kun Kaya Toast',
    description:
      'Traditional breakfast set with charcoal-grilled toast, kaya jam, butter, soft-boiled eggs, and local coffee',
    rating: 4.6,
    numberOfRatings: 2500,
    price: 4.8,
    image:
      'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?q=80&w=1000',
    category: 'Breakfast',
    isVegetarian: true,
    spicyLevel: 0,
    country: 'sg',
  },
  {
    id: '11',
    name: 'Hokkien Prawn Mee',
    restaurantName: 'Nam Sing Hokkien Fried Mee',
    description:
      'Wok-fried noodles in rich prawn stock with prawns, squid, pork belly, and crispy lard',
    rating: 4.7,
    numberOfRatings: 1600,
    price: 6.5,
    image:
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=1000',
    category: 'Chinese',
    isVegetarian: false,
    spicyLevel: 1,
    country: 'sg',
  },
  {
    id: '12',
    name: 'Satay',
    restaurantName: 'Lau Pa Sat Satay Street',
    description:
      'Grilled skewers of marinated chicken, beef, or lamb served with peanut sauce, cucumber, and rice cakes',
    rating: 4.5,
    numberOfRatings: 1900,
    price: 0.8,
    image:
      'https://images.unsplash.com/photo-1534797258760-1bd2cc95a5bd?q=80&w=1000',
    category: 'BBQ',
    isVegetarian: false,
    spicyLevel: 1,
    country: 'sg',
  },
];
