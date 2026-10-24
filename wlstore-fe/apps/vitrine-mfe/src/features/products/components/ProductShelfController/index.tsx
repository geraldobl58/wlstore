'use client';

import { cn } from '@wlstore/ui/lib/utils';
import { useGetProducts } from '../../hooks/use-get-products';
import type { ProductsQuery } from '../../types';
import { ProductCard } from '../ProductCard';

export interface ProductShelfProps {
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
  query: ProductsQuery;
  /** carousel: uma linha com rolagem horizontal (vitrines). grid: listagem. */
  layout?: 'carousel' | 'grid';
}

export function ProductShelfController({
  eyebrow,
  title,
  viewAllHref,
  query,
  layout = 'carousel',
}: ProductShelfProps) {
  const isGrid = layout === 'grid';
  const { products, isLoading, error, refetch } = useGetProducts(query);
  const headingId = `shelf-${title.toLowerCase().replace(/\W+/g, '-')}`;

  return (
    <section aria-labelledby={headingId} className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          {eyebrow && <p className="text-xs font-semibold tracking-wider text-link uppercase">{eyebrow}</p>}
          <h2 id={headingId} className="text-3xl font-bold text-text">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <a href={viewAllHref} className="shrink-0 font-semibold text-text hover:text-link">
            Ver tudo
          </a>
        )}
      </div>

      {error && (
        <p className="text-text-2">
          Não foi possível carregar os produtos.{' '}
          <button type="button" onClick={() => refetch()} className="font-medium text-link hover:underline">
            Tentar novamente
          </button>
        </p>
      )}

      {!error && !isLoading && products.length === 0 && (
        <p className="text-text-2">Nenhum produto por aqui ainda.</p>
      )}

      {(isLoading || products.length > 0) && (
        <ul
          className={cn(
            isGrid
              ? 'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'
              : '-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3',
          )}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} data-testid="product-skeleton" className={cn(!isGrid && 'w-64 shrink-0')}>
                  <div className="aspect-[3/4] animate-pulse rounded-xl bg-subtle" />
                </li>
              ))
            : products.map((product) => (
                <li key={product.id} className={cn(!isGrid && 'w-64 shrink-0 snap-start')}>
                  <ProductCard product={product} />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}
