import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export interface Story {
  id: string;
  vendorId: string;
  vendor?: any;
  platform: 'TIKTOK' | 'INSTAGRAM' | 'MAKERIES_OFFICIAL';
  externalPostId?: string;
  externalUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  postedAt: string;
  expiresAt: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  completionCount: number;
  isApproved: boolean;
  isFeatured: boolean;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetReelsParams {
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  vendorId?: string;
  limit?: number;
  nextToken?: string;
}

export interface GetReelsResponse {
  stories: Story[];
  nextToken?: string;
}

export interface TrackStoryViewParams {
  storyId: string;
  watchDuration?: number;
  completed?: boolean;
}

export interface InteractWithStoryParams {
  storyId: string;
  action: 'LIKE' | 'SHARE' | 'SHOP_NOW' | 'VISIT_VENDOR';
}

export interface InteractWithStoryResponse {
  success: boolean;
  redirectUrl?: string;
}

export const reelsService = {
  /**
   * Get reels feed with location-based filtering
   */
  getReels: async (params: GetReelsParams): Promise<GetReelsResponse> => {
    try {
      const { data, errors } = await client.queries.getReels(params);
      
      if (errors) {
        console.error('Error fetching reels:', errors);
        throw new Error('Failed to fetch reels');
      }

      return {
        stories: (data?.stories || []) as Story[],
        nextToken: data?.nextToken || undefined,
      };
    } catch (error) {
      console.error('Error in getReels:', error);
      throw error;
    }
  },

  /**
   * Track story view for analytics
   */
  trackStoryView: async (params: TrackStoryViewParams): Promise<boolean> => {
    try {
      const { data, errors } = await client.mutations.trackStoryView(params);
      
      if (errors) {
        console.error('Error tracking story view:', errors);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error in trackStoryView:', error);
      return false;
    }
  },

  /**
   * Interact with story (like, share, shop now, visit vendor)
   */
  interactWithStory: async (params: InteractWithStoryParams): Promise<InteractWithStoryResponse> => {
    try {
      const { data, errors } = await client.mutations.interactWithStory(params);
      
      if (errors) {
        console.error('Error interacting with story:', errors);
        throw new Error('Failed to interact with story');
      }

      return {
        success: data?.success || false,
        redirectUrl: data?.redirectUrl || undefined,
      };
    } catch (error) {
      console.error('Error in interactWithStory:', error);
      throw error;
    }
  },

  /**
   * Manually trigger social content sync (admin only)
   */
  syncSocialContent: async (vendorId?: string): Promise<{ success: boolean; storiesAdded: number; errors: string[] }> => {
    try {
      const { data, errors } = await client.mutations.syncSocialContent({ vendorId });
      
      if (errors) {
        console.error('Error syncing social content:', errors);
        throw new Error('Failed to sync social content');
      }

      return {
        success: data?.success || false,
        storiesAdded: data?.storiesAdded || 0,
        errors: data?.errors || [],
      };
    } catch (error) {
      console.error('Error in syncSocialContent:', error);
      throw error;
    }
  },
};
