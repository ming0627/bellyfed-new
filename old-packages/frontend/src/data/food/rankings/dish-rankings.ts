import { S3Object } from '@/types';

const DEFAULT_IMAGE_OBJECT: S3Object = {
  key: 'restaurants/bellyfed.png',
  region: 'ap-southeast-1',
  bucket: 'bellyfed-assets',
};

export interface DishRanking {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category: string;
  rating: number;
  price: number;
  description: string;
  image: S3Object;
  spicyLevel?: number; // 1-5
  isVegetarian: boolean;
  isSignatureDish: boolean;
  numberOfRatings: number;
  createdAt: string;
  updatedAt: string;
}

export const dishRankings: DishRanking[] = [
  {
    id: 'dish1',
    name: 'Nasi Lemak Special',
    restaurantId: 'restaurant_jalan_alor',
    restaurantName: 'Jalan Alor Food Street',
    category: 'Malaysian',
    rating: 4.8,
    price: 8.5,
    description:
      'Fragrant coconut rice served with special sambal, crispy anchovies, peanuts, cucumber slices, and a boiled egg',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 3,
    isVegetarian: false,
    isSignatureDish: true,
    numberOfRatings: 256,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish2',
    name: 'Premium Sushi Platter',
    restaurantId: 'restaurant_sushi_zen',
    restaurantName: 'Sushi Zen',
    category: 'Japanese',
    rating: 4.9,
    price: 88.0,
    description:
      'Selection of premium nigiri and maki sushi featuring the freshest seasonal fish',
    image: DEFAULT_IMAGE_OBJECT,
    isVegetarian: false,
    isSignatureDish: true,
    numberOfRatings: 189,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm1',
    name: 'Nasi Lemak',
    restaurantId: 'restaurant_jalan_alor',
    restaurantName: 'Jalan Alor Food Street',
    category: 'Rice Dishes',
    rating: 4.5,
    price: 8.5,
    description:
      'Traditional Malaysian coconut rice dish with sambal, served with crispy anchovies, peanuts, cucumber slices, and a boiled egg',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 3,
    isVegetarian: false,
    isSignatureDish: false,
    numberOfRatings: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    name: 'Char Kway Teow',
    restaurantId: 'restaurant_jalan_alor',
    restaurantName: 'Jalan Alor Food Street',
    category: 'Noodles',
    rating: 4.6,
    price: 7.5,
    description:
      'Stir-fried rice noodles with shrimp, chinese sausage, bean sprouts, and chives in a rich soy sauce',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 2,
    isVegetarian: false,
    isSignatureDish: false,
    numberOfRatings: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish3',
    name: 'Satay Mix Platter',
    restaurantId: 'restaurant_satay_delight',
    restaurantName: 'Satay Street Delight',
    category: 'Malaysian',
    rating: 4.7,
    price: 15.0,
    description:
      'Mixed platter of chicken, beef, and lamb satay served with peanut sauce and ketupat',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 1,
    isVegetarian: false,
    isSignatureDish: true,
    numberOfRatings: 167,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish4',
    name: 'Special Roti Canai',
    restaurantId: 'restaurant_roti_canai',
    restaurantName: 'Roti Canai Corner',
    category: 'Malaysian',
    rating: 4.6,
    price: 3.5,
    description:
      'Flaky, crispy roti served with signature curry sauce and dhal',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 2,
    isVegetarian: true,
    isSignatureDish: true,
    numberOfRatings: 423,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dish5',
    name: 'Banana Leaf Rice Set',
    restaurantId: 'restaurant_banana_leaf',
    restaurantName: 'Banana Leaf Rice Palace',
    category: 'Indian',
    rating: 4.7,
    price: 12.5,
    description:
      'Traditional banana leaf rice served with various curries, vegetables, and papadam',
    image: DEFAULT_IMAGE_OBJECT,
    spicyLevel: 4,
    isVegetarian: true,
    isSignatureDish: true,
    numberOfRatings: 312,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
