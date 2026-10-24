'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProductsQuery } from '../types';
import { productsQueryOptions } from './products-query';

export function useGetProducts(query: ProductsQuery) {
  const { data, isLoading, error, refetch } = useQuery(productsQueryOptions(query));

  return {
    products: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
