import { SearchIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StoreHeaderSearch {
  /** Para onde o formulário envia a busca (GET, parâmetro `name`). */
  action: string;
  name?: string;
  placeholder?: string;
}

export interface StoreHeaderProps {
  storeName: string;
  homeHref?: string;
  /** Logo do lojista. Sem logo, mostra o monograma com as iniciais. */
  logoUrl?: string;
  /** Faixa de aviso no topo (frete, parcelamento). */
  announcement?: ReactNode;
  search?: StoreHeaderSearch;
  /** Lado direito: conta, carrinho. Cada app passa os seus. */
  actions?: ReactNode;
  /** Linha abaixo do cabeçalho, ex.: o menu de categorias da vitrine. */
  children?: ReactNode;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

/**
 * Cabeçalho da loja, igual em todos os apps. Só estrutura: o conteúdo de
 * negócio (menu, conta, carrinho) entra pelos espaços `actions` e `children`.
 * Os links são <a> porque podem levar a outro microfrontend.
 */
export function StoreHeader({
  storeName,
  homeHref = '/',
  logoUrl,
  announcement,
  search,
  actions,
  children,
}: StoreHeaderProps) {
  return (
    <header>
      {announcement && (
        <p className="bg-brand-50 px-6 py-2 text-center text-sm font-medium text-brand-ink">{announcement}</p>
      )}
      <div className="bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <a href={homeHref} className="flex items-center gap-2.5 rounded-md text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            {logoUrl ? (
              // <img> e não next/image: o logo vem de qualquer domínio do lojista.
              <img src={logoUrl} alt={storeName} className="h-8 max-w-[180px] object-contain md:h-10" />
            ) : (
              <>
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-md bg-action font-heading text-lg font-bold text-on-action"
                >
                  {initials(storeName)}
                </span>
                <span className="font-heading text-xl font-bold">{storeName}</span>
              </>
            )}
          </a>

          {search && (
            <form
              role="search"
              action={search.action}
              method="get"
              className="order-last w-full md:order-none md:max-w-2xl md:flex-1"
            >
              <label htmlFor="store-search" className="sr-only">
                Buscar na loja
              </label>
              <div className="relative">
                <SearchIcon aria-hidden className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-text-2" />
                <input
                  id="store-search"
                  type="search"
                  name={search.name ?? 'q'}
                  placeholder={search.placeholder ?? 'Buscar produtos'}
                  className="h-11 w-full rounded-md border border-control bg-card pr-4 pl-11 text-base text-text placeholder:text-text-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                />
              </div>
            </form>
          )}

          {actions && <div className="ml-auto flex items-center gap-4">{actions}</div>}
        </div>
      </div>
      {children}
    </header>
  );
}
