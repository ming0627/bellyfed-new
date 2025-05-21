export type CuisineType =
  | 'Malaysian'
  | 'Chinese'
  | 'Indian'
  | 'Thai'
  | 'Japanese'
  | 'Korean'
  | 'Western'
  | 'Italian'
  | 'French'
  | 'Mediterranean'
  | 'Middle Eastern'
  | 'Mexican'
  | 'Vietnamese'
  | 'Fusion'
  | 'Seafood'
  | 'Vegetarian'
  | 'Vegan'
  | 'Halal'
  | 'Fast Food'
  | 'Cafe'
  | 'Dessert'
  | 'Bakery'
  | 'Street Food'
  | 'Fine Dining'
  | 'Buffet'
  | 'Singaporean';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type MealType =
  | 'Breakfast'
  | 'Brunch'
  | 'Lunch'
  | 'Dinner'
  | 'Supper'
  | 'Snack'
  | 'Dessert'
  | 'Drinks';

export type DiningOption =
  | 'Dine-in'
  | 'Takeaway'
  | 'Delivery'
  | 'Drive-thru'
  | 'Catering';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'E-wallet'
  | 'Online Banking'
  | 'QR Payment';

export type Amenity =
  | 'Parking'
  | 'Wifi'
  | 'Outdoor Seating'
  | 'Air Conditioning'
  | 'Wheelchair Accessible'
  | 'Restroom'
  | 'Smoking Area'
  | 'Private Dining'
  | 'Live Music'
  | 'TV'
  | 'Child Friendly'
  | 'Pet Friendly';

export type DietaryOption =
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Halal'
  | 'Kosher'
  | 'Dairy-Free'
  | 'Nut-Free'
  | 'Organic'
  | 'Low Carb'
  | 'Keto'
  | 'Paleo';

export type Certification =
  | 'Halal Certified'
  | 'Michelin Star'
  | 'Michelin Bib Gourmand'
  | 'Michelin Plate'
  | 'HACCP Certified'
  | 'ISO 22000'
  | 'Organic Certified'
  | 'Sustainable Dining'
  | 'Fair Trade'
  | 'Vegan Certified';

export const CUISINE_TYPES: CuisineType[] = [
  'Malaysian',
  'Chinese',
  'Indian',
  'Thai',
  'Japanese',
  'Korean',
  'Western',
  'Italian',
  'French',
  'Mediterranean',
  'Middle Eastern',
  'Mexican',
  'Vietnamese',
  'Fusion',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Fast Food',
  'Cafe',
  'Dessert',
  'Bakery',
  'Street Food',
  'Fine Dining',
  'Buffet',
  'Singaporean',
];

export const PRICE_RANGES: PriceRange[] = ['$', '$$', '$$$', '$$$$'];

export const MEAL_TYPES: MealType[] = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Dinner',
  'Supper',
  'Snack',
  'Dessert',
  'Drinks',
];

export const DINING_OPTIONS: DiningOption[] = [
  'Dine-in',
  'Takeaway',
  'Delivery',
  'Drive-thru',
  'Catering',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'E-wallet',
  'Online Banking',
  'QR Payment',
];

export const AMENITIES: Amenity[] = [
  'Parking',
  'Wifi',
  'Outdoor Seating',
  'Air Conditioning',
  'Wheelchair Accessible',
  'Restroom',
  'Smoking Area',
  'Private Dining',
  'Live Music',
  'TV',
  'Child Friendly',
  'Pet Friendly',
];

export const DIETARY_OPTIONS: DietaryOption[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Dairy-Free',
  'Nut-Free',
  'Organic',
  'Low Carb',
  'Keto',
  'Paleo',
];

export const CERTIFICATIONS: Certification[] = [
  'Halal Certified',
  'Michelin Star',
  'Michelin Bib Gourmand',
  'Michelin Plate',
  'HACCP Certified',
  'ISO 22000',
  'Organic Certified',
  'Sustainable Dining',
  'Fair Trade',
  'Vegan Certified',
];
