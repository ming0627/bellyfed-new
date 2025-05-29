// Type declarations for all types
declare module '@/types' {
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | S3Object;
    bio?: string;
    location?: string;
    interests?: Interest[];
    followers?: number;
    following?: number;
    points?: number;
    rank?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface FoodCategory {
    id: string;
    name: string;
    icon?: string;
    [key: string]: any;
  }

  export interface FoodEstablishment {
    id: string;
    name: string;
    address?: string;
    cuisine?: string;
    rating?: number;
    image?: string;
    [key: string]: any;
  }

  export interface DishCategory {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    [key: string]: any;
  }

  export interface MenuItemRanking {
    id: string;
    menuItemId?: string;
    menuItem?: MenuItem;
    userId?: string;
    rank?: number;
    [key: string]: any;
  }

  export interface RankingCategory {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface Review {
    id: string;
    userId: string;
    restaurantId?: string;
    establishmentId?: string;
    dishName?: string;
    rating: number;
    comment?: string;
    notes?: string;
    visitStatus?: string;
    photos?: any[];
    rank?: any;
    date?: string;
    visitDate?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface Post {
    id: string;
    userId: string;
    content: string;
    date?: string;
    photos?: any[];
    video?: any;
    hashtags?: string[];
    location?: string;
    likeCount?: number;
    postedBy?: any;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface S3Object {
    key: string;
    url: string;
    [key: string]: any;
  }

  export interface PostedBy {
    id: string;
    name: string;
    avatar?: string;
    [key: string]: any;
  }

  export interface Achievement {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    points?: number;
    dateEarned?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface Interest {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    date: string;
    [key: string]: any;
  }

  export enum RankingCategory {
    GLOBAL = 'global',
    LOCAL = 'local',
    PERSONAL = 'personal',
    PLAN_TO_VISIT = 'plan_to_visit',
  }

  export enum VisitStatus {
    VISITED = 'visited',
    WANT_TO_VISIT = 'want_to_visit',
    NOT_INTERESTED = 'not_interested',
  }
}
