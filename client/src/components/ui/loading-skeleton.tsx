import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'text';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = 'text', count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {items.map((i) => (
          <div key={i} className="flex flex-col space-y-3 p-4 border rounded-xl bg-card">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="pt-4 flex justify-between items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center space-x-4 py-2 border-b">
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[40%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[20%]" />
        </div>
        {items.map((i) => (
          <div key={i} className="flex items-center space-x-4 py-3 border-b">
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-8 w-[20%] rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((i) => (
        <Skeleton key={i} className={`h-4 w-[${100 - (i % 3) * 10}%]`} />
      ))}
    </div>
  );
}
