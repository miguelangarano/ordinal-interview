import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-8 sm:px-6 md:grid-cols-[260px_1fr] md:pt-24 lg:grid-cols-[300px_1fr]">
      <Skeleton className="mx-auto aspect-[2/3] w-48 rounded-xl md:w-full" />
      <div className="flex flex-col justify-end gap-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-2/3 max-w-3xl" />
        </div>
        <Skeleton className="mt-4 h-10 w-40" />
      </div>
    </div>
  );
}
