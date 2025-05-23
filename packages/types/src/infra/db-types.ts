/**
 * Database types for infrastructure components
 * These types define the structure of database records and operations
 */

/**
 * Base database record interface
 */
export interface DatabaseRecord {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Creation timestamp (ISO 8601 format)
   */
  createdAt: string;
  
  /**
   * Last update timestamp (ISO 8601 format)
   */
  updatedAt: string;
}

/**
 * Restaurant database record
 */
export interface RestaurantRecord extends DatabaseRecord {
  /**
   * Restaurant name
   */
  name: string;
  
  /**
   * Optional restaurant description
   */
  description?: string;
  
  /**
   * Array of cuisine types
   */
  cuisine: string[];
  
  /**
   * Restaurant address
   */
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  /**
   * Optional average rating (0-5)
   */
  rating?: number;
  
  /**
   * Optional price range (e.g., "$", "$$", "$$$")
   */
  priceRange?: string;
  
  /**
   * Restaurant status
   */
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

/**
 * Menu item database record
 */
export interface MenuItemRecord extends DatabaseRecord {
  /**
   * Menu item name
   */
  name: string;
  
  /**
   * Optional menu item description
   */
  description?: string;
  
  /**
   * Menu item price
   */
  price: number;
  
  /**
   * Menu item category
   */
  category: string;
  
  /**
   * Restaurant ID that this menu item belongs to
   */
  restaurantId: string;
  
  /**
   * Optional dietary information
   */
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    nutFree?: boolean;
  };
  
  /**
   * Menu item status
   */
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * RDS query parameters for Aurora PostgreSQL
 */
export interface RDSQueryParams {
  /**
   * RDS cluster ARN
   */
  resourceArn: string;
  
  /**
   * Secrets Manager ARN for database credentials
   */
  secretArn: string;
  
  /**
   * SQL query string
   */
  sql: string;
  
  /**
   * Optional query parameters
   */
  parameters?: any[];
  
  /**
   * Optional database name
   */
  database?: string;
  
  /**
   * Optional schema name
   */
  schema?: string;
  
  /**
   * Optional transaction ID for transactional queries
   */
  transactionId?: string;
}

/**
 * RDS transaction parameters for Aurora PostgreSQL
 */
export interface RDSTransactionParams {
  /**
   * RDS cluster ARN
   */
  resourceArn: string;
  
  /**
   * Secrets Manager ARN for database credentials
   */
  secretArn: string;
  
  /**
   * Optional database name
   */
  database?: string;
  
  /**
   * Optional schema name
   */
  schema?: string;
}

/**
 * Base database entity interface
 */
export interface DatabaseEntity {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Optional creation timestamp (ISO 8601 format)
   */
  createdAt?: string;
  
  /**
   * Optional last update timestamp (ISO 8601 format)
   */
  updatedAt?: string;
}

/**
 * User entity interface
 */
export interface UserEntity extends DatabaseEntity {
  /**
   * User email
   */
  email: string;
  
  /**
   * Optional user name
   */
  name?: string;
  
  /**
   * Optional user preferences
   */
  preferences?: Record<string, unknown>;
}

/**
 * Establishment entity interface
 */
export interface EstablishmentEntity extends DatabaseEntity {
  /**
   * Establishment name
   */
  name: string;
  
  /**
   * Optional Google Place ID
   */
  googlePlaceId?: string;
  
  /**
   * Optional establishment address
   */
  address?: string;
  
  /**
   * Optional establishment location coordinates
   */
  location?: {
    latitude: number;
    longitude: number;
  };
  
  /**
   * Optional array of menu item IDs
   */
  menuItems?: string[];
  
  /**
   * Optional average rating (0-5)
   */
  averageRating?: number;
  
  /**
   * Optional review count
   */
  reviewCount?: number;
}

/**
 * Menu item entity interface
 */
export interface MenuItemEntity extends DatabaseEntity {
  /**
   * Establishment ID that this menu item belongs to
   */
  establishmentId: string;
  
  /**
   * Menu item name
   */
  name: string;
  
  /**
   * Optional menu item description
   */
  description?: string;
  
  /**
   * Optional menu item price
   */
  price?: number;
  
  /**
   * Optional menu item category
   */
  category?: string;
  
  /**
   * Optional array of tags
   */
  tags?: string[];
  
  /**
   * Optional average rating (0-5)
   */
  averageRating?: number;
  
  /**
   * Optional review count
   */
  reviewCount?: number;
}

/**
 * Review entity interface
 */
export interface ReviewEntity extends DatabaseEntity {
  /**
   * Establishment ID that this review belongs to
   */
  establishmentId: string;
  
  /**
   * User ID that created this review
   */
  userId: string;
  
  /**
   * Review rating (0-5)
   */
  rating: number;
  
  /**
   * Optional review text
   */
  text?: string;
  
  /**
   * Optional array of photo URLs
   */
  photos?: string[];
  
  /**
   * Optional array of menu item IDs
   */
  menuItems?: string[];
  
  /**
   * Optional array of tags
   */
  tags?: string[];
  
  /**
   * Optional date of visit (ISO 8601 format)
   */
  dateOfVisit?: string;
}
