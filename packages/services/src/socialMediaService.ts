/**
 * Social Media Service
 * Handles operations related to social media posts and interactions
 */

/**
 * S3 Object interface
 * Represents an object stored in S3
 */
export interface S3Object {
  bucket: string;
  region: string;
  key: string;
}

/**
 * Posted By enum
 * Defines who posted the content
 */
export enum PostedBy {
  USER = 'USER',
  ESTABLISHMENT = 'ESTABLISHMENT',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

/**
 * Post Type enum
 * Defines the type of post
 */
export enum PostType {
  NEARBY = 'NEARBY',
  RECOMMENDATION = 'RECOMMENDATION',
  FOLLOWING = 'FOLLOWING',
  TRENDING = 'TRENDING',
  PROMOTIONAL = 'PROMOTIONAL',
}

/**
 * Post interface
 * Represents a social media post
 */
export interface Post {
  id: string;
  content: string;
  photos?: S3Object[];
  video?: S3Object;
  hashtags: string[];
  location?: string;
  userId: string;
  taggedUserIds?: string[];
  taggedEstablishmentIds?: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount?: number;
  postedBy: PostedBy;
  postType?: PostType;
  isLiked?: boolean;
}

/**
 * Social Media Post Options interface
 * Represents options for creating a social media post
 */
export interface SocialMediaPostOptions {
  content: string;
  photos?: S3Object[];
  video?: S3Object;
  location?: string;
  taggedEstablishmentIds?: string[];
  taggedUserIds?: string[];
  hashtags?: string[];
  postType?: PostType;
}

/**
 * Social Media Service class
 * Provides methods for managing social media posts
 */
export class SocialMediaService {
  /**
   * Create a post
   * @param postedBy Who posted the content
   * @param options Post options
   * @returns The created post
   */
  createPost(postedBy: PostedBy, options: SocialMediaPostOptions): Post {
    const now = new Date().toISOString();

    return {
      id: `post_${now}_${Math.random().toString(36).substring(2, 9)}`,
      content: options.content,
      photos: options.photos || [],
      video: options.video,
      hashtags: options.hashtags || [],
      location: options.location,
      userId: '', // This should be set by the caller
      taggedEstablishmentIds: options.taggedEstablishmentIds || [],
      taggedUserIds: options.taggedUserIds || [],
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      commentCount: 0,
      postedBy,
      postType: options.postType || PostType.FOLLOWING,
      isLiked: false,
    };
  }

  /**
   * Generate default hashtags based on type and name
   * @param type The type of entity
   * @param name The name of the entity
   * @returns The generated hashtags
   */
  generateDefaultHashtags(
    type: 'event' | 'establishment' | 'market',
    name: string,
  ): string[] {
    const baseHashtags = ['Malaysia', 'KualaLumpur', 'MalaysianFood'];
    const nameHashtag = name.replace(/\s+/g, '');

    switch (type) {
      case 'event':
        return [...baseHashtags, nameHashtag, 'Event', 'MalaysianEvent'];
      case 'establishment':
        return [
          ...baseHashtags,
          nameHashtag,
          'MalaysianCuisine',
          'StreetFood',
        ];
      case 'market':
        if (name.toLowerCase().includes('connaught')) {
          return [
            ...baseHashtags,
            'ConnaughtNightMarket',
            'ConnaughtPasarMalam',
            'PasarMalam',
            'NightMarket',
          ];
        }
        return [
          ...baseHashtags,
          nameHashtag,
          'Market',
          'FoodMarket',
          'PasarMalam',
          'NightMarket',
        ];
      default:
        return baseHashtags;
    }
  }

  /**
   * Generate promotional content
   * @param type The type of entity
   * @param details The entity details
   * @returns The generated promotional content
   */
  generatePromotionalContent(
    _type: 'event' | 'establishment' | 'market',
    details: {
      name: string;
      description?: string;
      location?: string;
      operatingHours?: string;
      specialOffer?: string;
    },
  ): string {
    const { name, description, location, operatingHours, specialOffer } =
      details;
    let content = `📢 ${name}\n\n`;

    if (description) {
      content += `${description}\n\n`;
    }

    if (location) {
      content += `📍 Location: ${location}\n`;
    }

    if (operatingHours) {
      content += `⏰ Hours: ${operatingHours}\n`;
    }

    if (specialOffer) {
      content += `\n🎉 Special Offer: ${specialOffer}\n`;
    }

    content += '\nCome visit us! 🌟';
    return content;
  }

  /**
   * Create a promotional post
   * @param type The type of entity
   * @param details The entity details
   * @param photos Optional photos
   * @returns The created promotional post
   */
  createPromotionalPost(
    type: 'event' | 'establishment' | 'market',
    details: {
      name: string;
      description?: string;
      location?: string;
      operatingHours?: string;
      specialOffer?: string;
      userId: string;
    },
    photos?: S3Object[],
  ): Post {
    const content = this.generatePromotionalContent(type, details);
    const hashtags = this.generateDefaultHashtags(type, details.name);

    return this.createPost(PostedBy.ESTABLISHMENT, {
      content,
      photos,
      hashtags,
      location: details.location,
      postType: PostType.PROMOTIONAL,
    });
  }

  /**
   * Like a post
   * @param postId The post ID
   * @returns Whether the operation was successful
   */
  async likePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return response.ok;
    } catch (error: unknown) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  /**
   * Unlike a post
   * @param postId The post ID
   * @returns Whether the operation was successful
   */
  async unlikePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/social/posts/${postId}/unlike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return response.ok;
    } catch (error: unknown) {
      console.error('Error unliking post:', error);
      return false;
    }
  }

  /**
   * Get posts by user ID
   * @param userId The user ID
   * @param limit The maximum number of posts to return
   * @param offset The offset for pagination
   * @returns The user's posts
   */
  async getUserPosts(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      const response = await fetch(
        `/api/social/users/${userId}/posts?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error fetching user posts:', error);
      return { posts: [], total: 0 };
    }
  }

  /**
   * Get feed posts
   * @param limit The maximum number of posts to return
   * @param offset The offset for pagination
   * @param type The type of feed
   * @returns The feed posts
   */
  async getFeedPosts(
    limit: number = 10,
    offset: number = 0,
    type: PostType = PostType.FOLLOWING,
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      const response = await fetch(
        `/api/social/feed?limit=${limit}&offset=${offset}&type=${type}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch feed posts');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Error fetching feed posts:', error);
      return { posts: [], total: 0 };
    }
  }
}

// Export a singleton instance
export const socialMediaService = new SocialMediaService();
