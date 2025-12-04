import { useQuery } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/../../amplify/data/resource';

const client = generateClient<Schema>();

interface Promotion {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  productIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function useActivePromotions(vendorId?: string, productId?: string) {
  return useQuery({
    queryKey: ['promotions', 'active', vendorId, productId],
    queryFn: async () => {
      const result = await client.queries.getActivePromotions({
        vendorId,
        productId,
      });

      return (result.data?.promotions || []) as Promotion[];
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!vendorId || !!productId,
  });
}

export function calculatePromotionalPrice(
  originalPrice: number,
  promotion?: Promotion
): { price: number; discount: number; hasPromotion: boolean } {
  if (!promotion) {
    return {
      price: originalPrice,
      discount: 0,
      hasPromotion: false,
    };
  }

  let discount = 0;
  if (promotion.discountType === 'PERCENTAGE') {
    discount = originalPrice * (promotion.discountValue / 100);
  } else {
    discount = promotion.discountValue;
  }

  const finalPrice = Math.max(0, originalPrice - discount);

  return {
    price: finalPrice,
    discount,
    hasPromotion: true,
  };
}

export function getPromotionForProduct(
  productId: string,
  vendorId: string,
  promotions: Promotion[]
): Promotion | undefined {
  // Find the best promotion for this product
  const applicablePromotions = promotions.filter(
    (promo) =>
      promo.vendorId === vendorId &&
      (!promo.productIds || promo.productIds.length === 0 || promo.productIds.includes(productId))
  );

  if (applicablePromotions.length === 0) {
    return undefined;
  }

  // Return the promotion with the highest discount
  return applicablePromotions.reduce((best, current) => {
    const bestDiscount = best.discountType === 'PERCENTAGE' ? best.discountValue : best.discountValue * 100;
    const currentDiscount = current.discountType === 'PERCENTAGE' ? current.discountValue : current.discountValue * 100;
    return currentDiscount > bestDiscount ? current : best;
  });
}

export function getTimeRemaining(endDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const total = end - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}
