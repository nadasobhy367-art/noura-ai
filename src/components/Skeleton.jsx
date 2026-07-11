import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center mb-4">
      <Skeleton className="w-12 h-12 rounded-lg mr-4" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex mb-4">
      <Skeleton className="h-4 flex-1 mr-4" />
      <Skeleton className="h-4 flex-1 mr-4" />
      <Skeleton className="h-4 flex-1" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex mb-3">
        <Skeleton className="h-4 flex-1 mr-4" />
        <Skeleton className="h-4 flex-1 mr-4" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonTable };
