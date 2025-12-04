import { Skeleton, ProductGridSkeleton } from '@/components/shared/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover image skeleton */}
      <div className="relative">
        <Skeleton className="w-full h-64" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-8 w-64 bg-white/80" />
              <Skeleton className="h-4 w-48 bg-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Vendor info skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Products section */}
          <div className="pt-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <ProductGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
