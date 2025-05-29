export enum VisitStatus {
  ACCEPTABLE = 'ACCEPTABLE',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  DISAPPOINTING = 'DISAPPOINTING',
}

export interface Review {
  id: string;
  authorName: string;
  dishName: string;
  comment: string;
  notes?: string;
  visitDate: string;
  visitStatus: VisitStatus;
  rank?: number;
  photos?: string[];
  rankHistory?: RankHistory[];
}

export interface RankHistory {
  rank: number;
  date: string;
  note?: string;
  previousRank?: number;
}

export interface DishCategory {
  id: string;
  name: string;
  parentId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating?: number;
}

export interface Avatar {
  bucket?: string;
  region?: string;
  key?: string;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  name: string;
  avatar?: Avatar;
  bio?: string;
  location?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  interests?: string[];
  achievements?: Achievement[];
  reviews?: Review[];
  stats?: {
    reviews?: number;
    followers?: number;
    following?: number;
    cities?: number;
  };
}

export interface Achievement {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  date?: string;
}
