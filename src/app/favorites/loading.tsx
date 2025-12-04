import { ProductGridSkeleton, PageHeaderSkeleton } from '@/components/shared/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeaderSkeleton />
        
        {/* Toggle skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
          <div className="animate-pulse h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>

        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
