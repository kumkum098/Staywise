import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-surface-border overflow-hidden shadow-subtle animate-pulse space-y-3 p-4">
      <div className="w-full aspect-[16/10] bg-gray-200 rounded-md" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex space-x-2 pt-2">
          <div className="h-5 bg-gray-200 rounded w-12" />
          <div className="h-5 bg-gray-200 rounded w-12" />
          <div className="h-5 bg-gray-200 rounded w-12" />
        </div>
      </div>
      <div className="pt-3 border-t border-surface-border flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-7 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="w-full h-80 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-40 bg-gray-200 rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
