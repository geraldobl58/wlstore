import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { connection } from 'next/server';
import { productsQueryOptions } from '../../hooks/products-query';
import { ProductShelfController, type ProductShelfProps } from '../ProductShelfController';

/**
 * Vitrine horizontal de produtos (Server Component), ex.: "Novidades" na home.
 * Mesmo padrão do CategoryMenu: busca no servidor e hidrata o useQuery.
 */
export async function ProductShelf(props: ProductShelfProps) {
  await connection();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(productsQueryOptions(props.query));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductShelfController {...props} />
    </HydrationBoundary>
  );
}
