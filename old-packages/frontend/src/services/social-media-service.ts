import { Post, S3Object, PostedBy } from '@/types';

export interface SocialMediaPostOptions {
  content: string;
  photos?: S3Object[];
  video?: S3Object;
  location?: string;
  taggedEstablishmentIds?: string[];
  taggedUserIds?: string[];
  hashtags?: string[];
}

export class SocialMediaService {
  createPost(postedBy: PostedBy, options: SocialMediaPostOptions): Post {
    const now = new Date().toISOString();

    return {
      id: `post_${now}_${Math.random().toString(36).substr(2, 9)}`,
      content: options.content,
      photos: options.photos || [],
      video: options.video,
      hashtags: options.hashtags || [],
      location: options.location,
      userId: '', // This should be set by the caller
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      postedBy,
    };
  }

  generateDefaultHashtags(
    type: 'event' | 'establishment' | 'market',
    name: string,
  ): string[] {
    const baseHashtags = ['#Malaysia', '#KualaLumpur', '#MalaysianFood'];
    const nameHashtag = `#${name.replace(/\s+/g, '')}`;

    switch (type) {
      case 'event':
        return [...baseHashtags, nameHashtag, '#Event', '#MalaysianEvent'];
      case 'establishment':
        return [
          ...baseHashtags,
          nameHashtag,
          '#MalaysianCuisine',
          '#StreetFood',
        ];
      case 'market':
        if (name.toLowerCase().includes('connaught')) {
          return [
            ...baseHashtags,
            '#ConnaughtNightMarket',
            '#ConnaughtPasarMalam',
            '#PasarMalam',
            '#NightMarket',
          ];
        }
        return [
          ...baseHashtags,
          nameHashtag,
          '#Market',
          '#FoodMarket',
          '#PasarMalam',
          '#NightMarket',
        ];
      default:
        return baseHashtags;
    }
  }

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
}
