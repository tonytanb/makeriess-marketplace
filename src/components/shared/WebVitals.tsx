'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/utils/performance';

/**
 * Component to track and report Web Vitals metrics
 * Should be included in the root layout
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Convert Next.js metric to our format
    reportWebVitals({
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
    });
  });

  useEffect(() => {
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      import('@/lib/utils/performance').then(({ initPerformanceMonitoring }) => {
        initPerformanceMonitoring();
      });
    }
  }, []);

  return null;
}
