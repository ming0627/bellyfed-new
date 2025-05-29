import { Region, Territory } from './constants/regions';

// Utility Types
export type DateString = string; // ISO 8601 formatted date string
export type TimeString = `${number}:${number}`; // Format 'HH:mm', e.g., '09:00'

// Enums
export enum Interest {
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten Free',
  HALAL = 'Halal',
  KOSHER = 'Kosher',
  ORGANIC = 'Organic',
  SUSTAINABLE = 'Sustainable',
  // Add more as needed
}

export enum EstablishmentType {
  RESTAURANT = 'RESTAURANT',
  FOOD_COURT_STALL = 'FOOD_COURT_STALL',
  FOOD_TRUCK = 'FOOD_TRUCK',
  POP_UP_STALL = 'POP_UP_STALL',
  GHOST_KITCHEN = 'GHOST_KITCHEN',
}

export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export enum SpicyLevel {
  NONE = 0,
  MILD = 1,
  MEDIUM = 2,
  HOT = 3,
  VERY_HOT = 4,
  EXTREME = 5,
}

export enum Allergen {
  PEANUTS = 'Peanuts',
  DAIRY = 'Dairy',
  GLUTEN = 'Gluten',
  SHELLFISH = 'Shellfish',
  SOY = 'Soy',
  EGGS = 'Eggs',
  TREE_NUTS = 'Tree Nuts',
  WHEAT = 'Wheat',
  FISH = 'Fish',
  SESAME = 'Sesame',
  // Add more as needed
}

export enum AchievementType {
  FIRST_REVIEW = 'First Review',
  TOP_CONTRIBUTOR = 'Top Contributor',
  // Add more as needed
}

export enum RankingCategory {
  TOP = 'Top',
  TRENDING = 'Trending',
  RECOMMENDED = 'Recommended',
  POPULAR = 'Popular',
  GENERAL = 'General',
  VISITED = 'Visited',
  SECOND_CHANCE = 'Second Chance',
  DISSATISFIED = 'Dissatisfied',
  PLAN_TO_VISIT = 'Plan to Visit',
}

export enum RankingTrend {
  UP = 'Up',
  DOWN = 'Down',
  STABLE = 'Stable',
}

export enum PostedBy {
  USER = 'USER',
  ESTABLISHMENT = 'ESTABLISHMENT',
  ADMIN = 'ADMIN',
}

export enum PostType {
  NEARBY = 'NEARBY',
  RECOMMENDATION = 'RECOMMENDATION',
  FOLLOWING = 'FOLLOWING',
}

export enum EstablishmentAdminRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export enum CuisineType {
  MALAYSIAN = 'Malaysian',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  THAI = 'Thai',
  VIETNAMESE = 'Vietnamese',
  WESTERN = 'Western',
  FUSION = 'Fusion',
  INDIAN = 'Indian',
  MIDDLE_EASTERN = 'Middle Eastern',
  SOUTH_INDIAN = 'South Indian',
  DESSERT = 'Dessert',
  BEVERAGES = 'Beverages',
  OTHER = 'Other',
}

export enum PaymentType {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  TOUCH_N_GO = 'Touch n Go',
  GRABPAY = 'GrabPay',
  BOOST = 'Boost',
  APPLE_PAY = 'Apple Pay',
  GOOGLE_PAY = 'Google Pay',
  SAMSUNG_PAY = 'Samsung Pay',
  ALIPAY = 'Alipay',
  WECHAT_PAY = 'WeChat Pay',
  E_WALLET = 'E_WALLET',
  CARD = 'CARD',
}

export enum DishCategory {
  MAIN = 'MAIN',
  APPETIZER = 'APPETIZER',
  DESSERT = 'DESSERT',
  BEVERAGE = 'BEVERAGE',
  SIDE = 'SIDE',
  MAIN_COURSE = 'MAIN_COURSE',
}

export enum DishTag {
  SPICY = 'SPICY',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
  HALAL = 'HALAL',
  KOSHER = 'KOSHER',
  BESTSELLER = 'BESTSELLER',
  SIGNATURE = 'SIGNATURE',
}

export enum ServiceType {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY',
  DRIVE_THRU = 'DRIVE_THRU',
  CATERING = 'CATERING',
  RESERVATION = 'RESERVATION',
  ONLINE_ORDERING = 'ONLINE_ORDERING',
  PRIVATE_DINING = 'PRIVATE_DINING',
  OUTDOOR_SEATING = 'OUTDOOR_SEATING',
  BUFFET = 'BUFFET',
}

// Certificate Types
export enum CertificateType {
  HALAL = 'HALAL',
  HYGIENE = 'HYGIENE',
  SAFETY = 'SAFETY',
  QUALITY = 'QUALITY',
  KOSHER = 'KOSHER',
  HACCP = 'HACCP',
  ISO_22000 = 'ISO_22000',
  OTHER = 'OTHER',
}

export enum CertificateStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  REVOKED = 'REVOKED',
}

export enum CertificateGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

// Event Types and Interfaces
export enum EventType {
  PASAR_MALAM = 'PASAR_MALAM',
  PASAR_PAGI = 'PASAR_PAGI',
  FOOD_FESTIVAL = 'FOOD_FESTIVAL',
  CULTURAL_FESTIVAL = 'CULTURAL_FESTIVAL',
  CORPORATE_EVENT = 'CORPORATE_EVENT',
  PRIVATE_EVENT = 'PRIVATE_EVENT',
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  description?: string;
  startDate: DateString;
  endDate: DateString;
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  location?: Location;
  establishments?: FoodEstablishment[];
  organizer?: Organization;
  capacity?: number;
  ticketPrice?: number;
  isRecurring?: boolean;
  recurringSchedule?: Schedule[];
  images?: S3Object[];
  createdAt: DateString;
  updatedAt: DateString;
}

// Base Interfaces
export interface BaseEntity {
  id: string;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface S3Object {
  bucket: string;
  region: string;
  key: string;
}

export interface Location {
  name: string;
  info: LocationInfo;
  foodEstablishments?: FoodEstablishment[];
  sharedKitchens?: SharedKitchen[];
  foodMarkets?: FoodMarket[];
  foodCourts?: FoodCourt[];
}

// User Interfaces
export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: S3Object;
  bio?: string;
  location?: string;
  interests?: Interest[];
  favorites?: Favorite[];
  posts?: Post[];
  taggedInPosts?: Post[];
  comments?: Comment[];
  likes?: Like[];
  reviews?: Review[];
  followingUsers?: UserFollow[];
  followingEstablishments?: EstablishmentFollow[];
  followers?: UserFollow[];
  points?: number;
  achievements?: Achievement[];
  adminRoles?: EstablishmentAdmin[];
}

export interface ReviewerProfile extends User {
  followerCount: number;
  isOfficialReviewer: boolean;
}

// Establishment Interfaces
export interface Organization extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  brandInfo?: BrandInfo;
  headquarters?: LocationInfo;
  parentOrganization?: Organization;
  subsidiaries?: Organization[];
  operatingRegions?: Region[];
  territories?: Territory[];
  establishments?: FoodEstablishment[];
  contact?: ContactInfo;
  website?: string;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface Franchise extends BaseEntity {
  name: string;
  description?: string;
  establishments?: FoodEstablishment[];
}

export interface DietaryOptions {
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isHalal?: boolean;
  isKosher?: boolean;
}

export interface FoodEstablishment extends BaseEntity {
  id: string;
  name: string;
  type: EstablishmentType;
  description?: string;
  cuisineTypes: string[];
  priceRange: string;
  images?: S3Object[];
  dietaryOptions?: DietaryOptions;
  franchiseId?: string;
  franchise?: Franchise;
  organizationId?: string;
  organization?: Organization;
  locations?: Location[];
  menus?: Menu[];
  posts?: Post[];
  taggedInPosts?: Post[];
  promotions?: Promotion[];
  followers?: EstablishmentFollow[];
  admins?: EstablishmentAdmin[];
  isCurrentlyOperating?: boolean;
  isSeasonal?: boolean;
  startDate?: DateString;
  endDate?: DateString;
  owners?: User[];
  sharedKitchenId?: string;
  sharedKitchen?: SharedKitchen;
  foodMarketId?: string;
  foodMarket?: FoodMarket;
  foodCourtId?: string;
  foodCourt?: FoodCourt;
  schedules?: Schedule[];
  image?: S3Object;
  topRankings?: number;
  category?: string;
  reviews?: Review[];
  contact: ContactInfo;
  facilities: {
    parking?: ParkingInfo;
    wifi?: WifiInfo;
    seating?: SeatingInfo;
    payment?: PaymentInfo;
  };
  ranking?: GeneralRanking | TopRanking | BaseRanking;
  certificates?: Certificate[];
  services?: ServiceInfo[];
  mobileInfo?: MobileVendorInfo; // For food trucks and market stalls
  stationaryInfo?: StationaryVendorInfo; // For food court stalls
}

export interface Certificate extends BaseEntity {
  establishmentId: string;
  establishment?: FoodEstablishment;
  name: string;
  type: CertificateType;
  issuingAuthority: string;
  issueDate: DateString;
  expiryDate?: DateString;
  status: CertificateStatus;
  grade?: CertificateGrade;
  score?: number;
  description?: string;
  image?: S3Object;
  verificationUrl?: string;
  lastInspectionDate?: DateString;
  nextInspectionDate?: DateString;
  certificationNumber: string;
  remarks?: string;
}

export interface ServiceInfo {
  type: ServiceType;
  available: boolean;
  details?: string;
}

// Menu Interfaces
export interface Menu extends BaseEntity {
  establishmentId: string;
  establishment?: FoodEstablishment;
  title: string;
  description?: string;
  image?: S3Object;
  sections?: MenuSection[];
  seasonalAvailability?: string[];
  isSpecialMenu?: boolean;
  startDate?: DateString;
  endDate?: DateString;
}

export interface MenuSection extends BaseEntity {
  menuId: string;
  menu?: Menu;
  title: string;
  description?: string;
  items?: MenuItem[];
  order: number;
}

export interface MenuItem extends BaseEntity {
  sectionId: string;
  section?: MenuSection;
  name: string;
  description?: string;
  image?: S3Object;
  price: number;
  cuisineType?: CuisineType;
  spicyLevel?: SpicyLevel;
  dietaryOptions?: DietaryOptions;
  order: number;
  variations?: MenuItemVariation[];
  ratings?: MenuItemRating[];
  establishmentId: string;
  establishment?: FoodEstablishment;
  city?: string;
  country?: string;
  rankings?: MenuItemRanking[];
  seasonalAvailability?: string[];
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfo;
  allergens?: Allergen[];
  availability?: Availability[];
  reviews?: Review[];
  recommendedPairs?: MenuItem[];
  customizationOptions?: CustomizationOption[];
  menuId: string;
  menu?: Menu;
  dishCategory: DishCategory;
  dishTags: DishTag[];
  standardizedName?: string;
}

// Ranking Interfaces
export interface MenuItemRanking extends BaseRanking {
  normalizedPoints?: number;
  interactionPoints?: number;
}

export interface BaseRanking extends BaseEntity {
  menuItemId: string;
  menuItem?: MenuItem;
  userId: string;
  user?: User;
  category: RankingCategory;
  sequence: number; // For categories other than 'Top', represents the order
  city?: string;
  country?: string;
  name: string; // Add this field to match the previous LeaderboardRestaurant structure
  dish: string; // Add this field to match the previous LeaderboardRestaurant structure
  totalScore?: number; // Add this line
}

export interface TopRanking extends MenuItemRanking {
  category: RankingCategory.TOP;
  rankPosition: 1 | 2 | 3 | 4 | 5;
}

export interface GeneralRanking extends MenuItemRanking {
  category: Exclude<RankingCategory, RankingCategory.TOP>;
}

export interface RestaurantRanking {
  category: RankingCategory;
  rankPosition?: 1 | 2 | 3 | 4 | 5;
  cuisineType?: string;
}

// Review and Rating Interfaces
export interface MenuItemRating {
  userId: string;
  rating: number;
  createdAt: DateString;
}

export enum VisitStatus {
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  DISAPPOINTING = 'DISAPPOINTING',
  STANDARD = 'STANDARD',
}

export interface Review {
  id: string;
  establishmentId: string;
  userId: string;
  rating: number;
  rank?: number;
  dishName: string;
  comment: string;
  notes?: string;
  visitStatus?: VisitStatus;
  visitDate: DateString;
  photos?: string[];
  createdAt: DateString;
  updatedAt: DateString;
}

export interface EstablishmentResponse extends BaseEntity {
  reviewId: string;
  responderId: string;
  responderName: string;
  responderRole: EstablishmentAdminRole;
  content: string;
}

// Schedule and Availability Interfaces
export interface Schedule extends BaseEntity {
  locationId: string;
  dayOfWeek: DayOfWeek;
  startTime: TimeString;
  endTime: TimeString;
  isRecurring: boolean;
  establishmentId: string;
}

export interface Availability extends BaseEntity {
  menuItemId: string;
  days: DayOfWeek[];
  startTime?: TimeString;
  endTime?: TimeString;
}

// Nutritional and Dietary Interfaces
export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface CustomizationOption extends BaseEntity {
  menuItemId: string;
  name: string;
  options: string[];
}

export interface MenuItemVariation extends BaseEntity {
  menuItemId: string;
  name: string;
  price?: string; // Price represented as a string
}

// Post and Interaction Interfaces
export interface Post extends BaseEntity {
  content: string;
  photos?: S3Object[];
  hashtags?: string[];
  location?: string;
  userId: string;
  taggedUserIds?: string[];
  taggedEstablishmentIds?: string[];
  video?: S3Object;
  rating?: number;
  commentIds?: string[];
  likeIds?: string[];
  likeCount?: number;
  postedBy: PostedBy;
}

export interface Comment extends BaseEntity {
  content: string;
  postId: string;
  post?: Post;
  userId: string;
  user?: User;
}

export interface Like extends BaseEntity {
  postId: string;
  post?: Post;
  userId: string;
  user?: User;
  isLike: boolean;
}

export interface Favorite extends BaseEntity {
  userId: string;
  user?: User;
  establishmentId: string;
  establishment?: FoodEstablishment;
}

// Follow Interfaces
export interface UserFollow extends BaseEntity {
  followerId: string;
  follower?: User;
  followedId: string;
  followed?: User;
}

export interface EstablishmentFollow extends BaseEntity {
  followerId: string;
  follower?: User;
  establishmentId: string;
  establishment?: FoodEstablishment;
}

// Promotion and Admin Interfaces
export interface Promotion extends BaseEntity {
  establishmentId: string;
  establishment?: FoodEstablishment;
  title: string;
  description?: string;
  startDate: DateString;
  endDate: DateString;
  discountPercentage?: number; // 0 to 100
}

export interface EstablishmentAdmin extends BaseEntity {
  userId: string;
  user?: User;
  establishmentId: string;
  establishment?: FoodEstablishment;
  role: EstablishmentAdminRole;
}

// Shared Locations Interfaces
export interface SharedKitchen extends BaseEntity {
  name: string;
  description?: string;
  locationId: string;
  location?: Location;
  establishments?: FoodEstablishment[];
}

export interface FoodMarket extends BaseEntity {
  name: string;
  description?: string;
  locationId: string;
  location?: Location;
  establishments?: FoodEstablishment[];
}

export interface FoodCourt extends BaseEntity {
  name: string;
  description?: string;
  location: Location;
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  stalls: FoodEstablishment[];
  facilities: {
    parking?: ParkingInfo;
    wifi?: WifiInfo;
    seating?: SeatingInfo;
    payment?: PaymentInfo;
  };
  images?: S3Object[];
  contact?: ContactInfo;
}

// Stationary Vendor Info (for food courts)
export interface StationaryVendorInfo {
  stallNumber: string;
  floor?: string;
  section?: string;
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  category?: string;
}

// Mobile Vendor Interfaces
export interface VendorSchedule {
  locationId: string;
  dayOfWeek: DayOfWeek;
  startTime: TimeString;
  endTime: TimeString;
  isRecurring: boolean;
  eventId?: string; // For events or markets
}

export interface VendorTracking {
  realTimeTracking: boolean;
  trackingUrl?: string;
  socialMediaHandles?: {
    platform: string;
    handle: string;
  }[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: DateString;
  };
}

export interface MobileVendorInfo {
  vehicleInfo?: {
    // Optional, only for food trucks
    registrationNumber: string;
    make: string;
    model: string;
    year: string;
  };
  operatingHours: {
    startTime: TimeString;
    endTime: TimeString;
  };
  tracking?: VendorTracking;
  schedules?: VendorSchedule[];
  marketId?: string; // For vendors operating in markets
  marketInfo?: {
    stallNumber?: string; // For stall vendors
    category?: string;
  };
}

export interface RestaurantWithRanking extends FoodEstablishment {
  ranking?: TopRanking | GeneralRanking;
}

// Added FoodCategory interface
export interface FoodCategory {
  id: string;
  name: string;
  isExisting?: boolean;
}

// Export these interfaces
export interface FeaturedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  discount?: string;
}

export interface Achievement extends BaseEntity {
  name: string;
  description?: string;
  points: number;
  dateEarned: DateString;
  category?: string;
}

// Brand Information Interface
export interface BrandInfo {
  logo?: S3Object;
  primaryColor?: string;
  secondaryColor?: string;
  slogan?: string;
  foundedYear?: number;
  foundedLocation?: string;
  story?: string;
  values?: string[];
  awards?: {
    year: number;
    title: string;
    description?: string;
  }[];
  socialMedia?: {
    platform: string;
    handle: string;
    url: string;
  }[];
}

// Contact Information Interface
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

// Location Information Interface
export interface LocationInfo {
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Facility Information Interfaces
export interface ParkingInfo {
  available: boolean;
  details?: string;
}

export interface WifiInfo {
  available: boolean;
  details?: string;
}

export interface SeatingInfo {
  capacity: number;
  details?: string;
}

export interface PaymentInfo {
  methods: PaymentType[];
  details?: string;
}

export interface AdditionalInfo {
  parking?: ParkingInfo;
  wifi?: WifiInfo;
  seating?: SeatingInfo;
  payment?: PaymentInfo;
}

// User Preferences Interface
export interface UserPreferences {
  theme?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showLocation?: boolean;
  };
  [key: string]: unknown;
}

// Utility Types
export type { Region, Territory } from './constants/regions';
