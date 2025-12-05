import { client } from '@/lib/amplify/client';
import { uploadData } from 'aws-amplify/storage';

export interface CreateReviewInput {
  customerId: string;
  productId?: string;
  vendorId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: File[];
}

export interface Review {
  id: string;
  customerId: string;
  customer?: {
    name: string;
  };
  productId?: string;
  vendorId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
  vendorResponse?: string;
  vendorResponseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVendorResponseInput {
  reviewId: string;
  vendorResponse: string;
}

export const reviewService = {
  create: async (input: CreateReviewInput): Promise<Review> => {
    try {
      // Upload images to S3 if provided
      const imageUrls: string[] = [];
      if (input.images && input.images.length > 0) {
        for (const image of input.images.slice(0, 3)) {
          const key = `reviews/${input.customerId}/${Date.now()}-${image.name}`;
          await uploadData({
            key,
            data: image,
            options: {
              contentType: image.type,
            },
          }).result;
          imageUrls.push(key);
        }
      }

      const { data, errors } = await client.models.Review.create({
        customerId: input.customerId,
        productId: input.productId,
        vendorId: input.vendorId,
        orderId: input.orderId,
        rating: input.rating,
        comment: input.comment,
        images: imageUrls,
      });

      if (errors) {
        console.error('Create review errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to create review');
      }

      return data as unknown as Review;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  },

  getByProduct: async (productId: string, limit = 10, nextToken?: string): Promise<{ reviews: Review[]; nextToken?: string }> => {
    try {
      const { data, errors, nextToken: newNextToken } = await client.models.Review.listReviewByProductId(
        { productId },
        { limit, nextToken }
      );

      if (errors) {
        console.error('Get product reviews errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get product reviews');
      }

      return {
        reviews: (data as unknown as Review[]) || [],
        nextToken: newNextToken || undefined,
      };
    } catch (error) {
      console.error('Get product reviews error:', error);
      throw error;
    }
  },

  getByVendor: async (vendorId: string, limit = 10, nextToken?: string): Promise<{ reviews: Review[]; nextToken?: string }> => {
    try {
      const { data, errors, nextToken: newNextToken } = await client.models.Review.listReviewByVendorId(
        { vendorId },
        { limit, nextToken }
      );

      if (errors) {
        console.error('Get vendor reviews errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get vendor reviews');
      }

      return {
        reviews: (data as unknown as Review[]) || [],
        nextToken: newNextToken || undefined,
      };
    } catch (error) {
      console.error('Get vendor reviews error:', error);
      throw error;
    }
  },

  updateVendorResponse: async (input: UpdateVendorResponseInput): Promise<Review> => {
    try {
      const { data, errors } = await client.models.Review.update({
        id: input.reviewId,
        vendorResponse: input.vendorResponse,
        vendorResponseDate: new Date().toISOString(),
      });

      if (errors) {
        console.error('Update vendor response errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to update vendor response');
      }

      return data as unknown as Review;
    } catch (error) {
      console.error('Update vendor response error:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Review | null> => {
    try {
      const { data, errors } = await client.models.Review.get({ id });

      if (errors) {
        console.error('Get review errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to get review');
      }

      return (data as unknown as Review) || null;
    } catch (error) {
      console.error('Get review error:', error);
      throw error;
    }
  },
};
