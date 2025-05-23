/**
 * Review types for Bellyfed application
 * These types align with the database schema and API responses
 */

/**
 * Visit status enum for reviews
 */
export enum VisitStatus {
  ACCEPTABLE = 'ACCEPTABLE',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  DISAPPOINTING = 'DISAPPOINTING',
}

/**
 * Review history for a dish ranking
 */
export interface RankHistory {
  rank: number;
  date: string;
  note?: string;
  previousRank?: number;
}

/**
 * Review interface for restaurant and dish reviews
 */
export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  restaurantId: string;
  restaurantName?: string;
  dishId?: string;
  dishName: string;
  comment: string;
  notes?: string;
  visitDate: string;
  visitStatus: VisitStatus;
  rank?: number;
  photos?: string[];
  rankHistory?: RankHistory[];
  createdAt: string;
  updatedAt: string;
  likes?: number;
  isLiked?: boolean;
}

/**
 * Review creation parameters
 */
export interface CreateReviewParams {
  restaurantId: string;
  dishId?: string;
  dishName: string;
  comment: string;
  notes?: string;
  visitDate: string;
  visitStatus: VisitStatus;
  rank?: number;
  photos?: string[];
}

/**
 * Review update parameters
 */
export interface UpdateReviewParams {
  comment?: string;
  notes?: string;
  visitDate?: string;
  visitStatus?: VisitStatus;
  rank?: number;
  photos?: string[];
}

/**
 * Review search parameters
 */
export interface ReviewSearchParams {
  authorId?: string;
  restaurantId?: string;
  dishId?: string;
  visitStatus?: VisitStatus;
  minRank?: number;
  maxRank?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Review search response
 */
export interface ReviewSearchResponse {
  reviews: Review[];
  totalCount: number;
  nextPageToken?: string;
}

/**
 * Helper functions for reviews
 */

/**
 * Format visit status to a user-friendly string
 */
export function formatVisitStatus(status: VisitStatus): string {
  switch (status) {
    case VisitStatus.ACCEPTABLE:
      return 'Acceptable';
    case VisitStatus.NEEDS_IMPROVEMENT:
      return 'Needs Improvement';
    case VisitStatus.DISAPPOINTING:
      return 'Disappointing';
    default:
      return 'Unknown';
  }
}

/**
 * Get color for visit status
 */
export function getVisitStatusColor(status: VisitStatus): string {
  switch (status) {
    case VisitStatus.ACCEPTABLE:
      return 'green';
    case VisitStatus.NEEDS_IMPROVEMENT:
      return 'yellow';
    case VisitStatus.DISAPPOINTING:
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Format rank to a user-friendly string
 */
export function formatRank(rank?: number): string {
  if (rank === undefined || rank === null) return 'Not Ranked';
  return `#${rank}`;
}
