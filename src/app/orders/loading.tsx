import { OrderCardSkeleton, PageHeaderSkeleton } from '@/components/shared/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeaderSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
