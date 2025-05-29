import { SqlParameter } from '@aws-sdk/client-rds-data';

// Database records for Aurora PostgreSQL
export interface DatabaseRecord {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface RestaurantRecord extends DatabaseRecord {
    name: string;
    description?: string;
    cuisine: string[];
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    rating?: number;
    priceRange?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface MenuItemRecord extends DatabaseRecord {
    name: string;
    description?: string;
    price: number;
    category: string;
    restaurantId: string;
    dietary?: {
        vegetarian?: boolean;
        vegan?: boolean;
        glutenFree?: boolean;
        nutFree?: boolean;
    };
    status: 'ACTIVE' | 'INACTIVE';
}

// PostgreSQL operation types
export interface RDSQueryParams {
    resourceArn: string;
    secretArn: string;
    sql: string;
    parameters?: SqlParameter[];
    database?: string;
    schema?: string;
    transactionId?: string;
}

export interface RDSTransactionParams {
    resourceArn: string;
    secretArn: string;
    database?: string;
    schema?: string;
}

export interface DatabaseEntity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserEntity extends DatabaseEntity {
    email: string;
    name?: string;
    preferences?: Record<string, unknown>;
}

export interface EstablishmentEntity extends DatabaseEntity {
    name: string;
    googlePlaceId?: string;
    address?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    menuItems?: string[];
    averageRating?: number;
    reviewCount?: number;
}

export interface MenuItemEntity extends DatabaseEntity {
    establishmentId: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    tags?: string[];
    averageRating?: number;
    reviewCount?: number;
}

export interface ReviewEntity extends DatabaseEntity {
    establishmentId: string;
    userId: string;
    rating: number;
    text?: string;
    photos?: string[];
    menuItems?: string[];
    tags?: string[];
    dateOfVisit?: string;
}
