import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 ${className}`}
      {...props}
    />
  );
};

export const RecipeCardSkeleton = () => {
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white/50 flex flex-col h-full">
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-none" />
      {/* Body placeholder */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
