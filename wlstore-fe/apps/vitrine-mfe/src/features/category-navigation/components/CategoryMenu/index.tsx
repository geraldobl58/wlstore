import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { connection } from 'next/server';
import { categoryNavigationQueryOptions } from '../../hooks/category-navigation-query';
import { CategoryMenuController } from '../CategoryMenuController';

/**
 * Ponto de entrada usado nos layouts (Server Component).
 *
 * Busca o menu no servidor e entrega o resultado já no HTML: como a navegação
 * entre microfrontends recarrega o documento, sem isso o menu piscaria vazio a
 * cada troca de app. Se a busca falhar, a query não é hidratada e o
 * CategoryMenuController tenta de novo no navegador.
 */
export async function CategoryMenu() {
  // Renderiza por requisição: sem isso o Next pré-renderiza no build e o menu
  // ficaria congelado com as categorias daquele momento (ou com o erro).
  await connection();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(categoryNavigationQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryMenuController />
    </HydrationBoundary>
  );
}
