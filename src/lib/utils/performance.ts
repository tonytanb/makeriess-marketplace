/**
 * Performance monitoring utilities for tracking web vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

/**
 * Report web vitals to analytics service
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // In production, send to CloudWatch or analytics service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to CloudWatch Metrics
    // Example: sendToCloudWatch(metric);
  }
}

/**
 * Measure and report custom performance metrics
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const startTime = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - startTime;
      reportCustomMetric(name, duration);
    });
  } else {
    const duration = performance.now() - startTime;
    reportCustomMetric(name, duration);
  }
}

/**
 * Report custom metric
 */
function reportCustomMetric(name: string, value: number) {
  const rating = getRating(name, value);
  
  reportWebVitals({
    name,
    value,
    rating,
  });
}

/**
 * Get performance rating based on metric name and value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds based on Web Vitals recommendations
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) {
    // Default thresholds for custom metrics (in ms)
    return value < 1000 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
  }

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  // Wait for page to fully load
  window.addEventListener('load', () => {
    // Get navigation timing
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      // DNS lookup time
      const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
      reportCustomMetric('DNS', dnsTime);

      // TCP connection time
      const tcpTime = perfData.connectEnd - perfData.connectStart;
      reportCustomMetric('TCP', tcpTime);

      // Request time
      const requestTime = perfData.responseStart - perfData.requestStart;
      reportCustomMetric('Request', requestTime);

      // Response time
      const responseTime = perfData.responseEnd - perfData.responseStart;
      reportCustomMetric('Response', responseTime);

      // DOM processing time
      const domTime = perfData.domComplete - perfData.domInteractive;
      reportCustomMetric('DOM', domTime);

      // Total page load time
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      reportCustomMetric('PageLoad', loadTime);
    }
  });
}

/**
 * Track resource loading performance
 */
export function trackResourceTiming() {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  // Group by resource type
  const byType: Record<string, number[]> = {};
  
  resources.forEach((resource) => {
    const type = resource.initiatorType;
    const duration = resource.duration;
    
    if (!byType[type]) {
      byType[type] = [];
    }
    byType[type].push(duration);
  });

  // Report average duration by type
  Object.entries(byType).forEach(([type, durations]) => {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    reportCustomMetric(`Resource_${type}`, avg);
  });
}

/**
 * Monitor long tasks (tasks that block the main thread for >50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined') return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Report long tasks
        reportCustomMetric('LongTask', entry.duration);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // PerformanceObserver not supported
    console.warn('Long task monitoring not supported', error);
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track page load
  trackPageLoad();

  // Track resources after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      trackResourceTiming();
    }, 0);
  });

  // Monitor long tasks
  monitorLongTasks();
}
