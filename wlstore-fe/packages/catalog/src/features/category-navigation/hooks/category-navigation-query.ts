import { queryOptions } from '@tanstack/react-query';
import { getCategoryNavigationAction } from '../actions/get-category-navigation-action';

export const CATEGORY_NAVIGATION_QUERY_KEY = ['category-navigation'] as const;

/**
 * Compartilhado entre o prefetch no servidor (CategoryMenu) e o useQuery no
 * navegador. Por isso este arquivo não tem 'use client'.
 */
export const categoryNavigationQueryOptions = queryOptions({
  queryKey: CATEGORY_NAVIGATION_QUERY_KEY,
  queryFn: async () => {
    const result = await getCategoryNavigationAction();
    if (!result.success || !result.data) throw new Error(result.message);
    return result.data;
  },
  // O menu muda pouco: evita refazer a busca logo após a hidratação.
  staleTime: 5 * 60 * 1000,
});
