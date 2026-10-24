'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryNavigationQueryOptions } from './category-navigation-query';

export function useGetCategoryNavigation() {
  const { data, isLoading, error, refetch } = useQuery(categoryNavigationQueryOptions);

  return {
    categories: data?.categories ?? [],
    highlights: data?.highlights ?? [],
    isLoading,
    error,
    refetch,
  };
}
