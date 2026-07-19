import { Skeleton } from '@/components/ui/Skeleton';

export default function RecipeDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-full aspect-square md:aspect-[4/3] rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="w-full aspect-square rounded-xl" />
          </div>
        </div>

        {/* Right Col: Details Skeleton */}
        <div className="flex flex-col">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-3 mb-8">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/5" />
          </div>

          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
