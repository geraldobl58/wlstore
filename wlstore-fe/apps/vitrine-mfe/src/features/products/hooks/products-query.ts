import { queryOptions } from '@tanstack/react-query';
import { getProductsAction } from '../actions/get-products-action';
import type { ProductsQuery } from '../types';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

/** Compartilhado entre o prefetch no servidor e o useQuery (sem 'use client'). */
export const productsQueryOptions = (query: ProductsQuery) =>
  queryOptions({
    queryKey: [...PRODUCTS_QUERY_KEY, query],
    queryFn: async () => {
      const result = await getProductsAction(query);
      if (!result.success || !result.data) throw new Error(result.message);
      return result.data;
    },
    // Sem isso, o que veio hidratado do servidor nasce "velho" e o navegador
    // busca tudo de novo logo ao montar.
    staleTime: 60 * 1000,
  });
