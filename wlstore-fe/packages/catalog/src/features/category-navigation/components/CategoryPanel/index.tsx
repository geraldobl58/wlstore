import { cn } from '@wlstore/ui/lib/utils';
import type { ReactNode } from 'react';
import type { NavigationCategory, NavigationLink, NavigationPromo } from '../../types';

interface CategoryPanelProps {
  id: string;
  open: boolean;
  categories: NavigationCategory[];
  active?: NavigationCategory;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onActivate: (slug: string) => void;
}

export function CategoryPanel({
  id,
  open,
  categories,
  active,
  isLoading,
  errorMessage,
  onRetry,
  onActivate,
}: CategoryPanelProps) {
  return (
    <div id={id} hidden={!open} className="absolute inset-x-0 top-full border-b bg-card shadow-lg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {errorMessage && (
          <p className="text-text-2">
            {errorMessage}{' '}
            <button type="button" onClick={onRetry} className="font-medium text-link hover:underline">
              Tentar novamente
            </button>{' '}
            ou{' '}
            <a href="/catalog" className="font-medium text-link hover:underline">
              ver o catálogo completo
            </a>
          </p>
        )}
        {isLoading && <p className="text-text-2">Carregando categorias…</p>}
        {active && (
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            <Column title="Categorias">
              {categories.map((category) => (
                <li key={category.slug}>
                  <a
                    href={category.href}
                    onMouseEnter={() => onActivate(category.slug)}
                    onFocus={() => onActivate(category.slug)}
                    aria-current={category.slug === active.slug ? 'true' : undefined}
                    className={cn(
                      'transition-colors duration-120 hover:text-link',
                      category.slug === active.slug ? 'font-semibold text-link' : 'text-text',
                    )}
                  >
                    {category.title}
                  </a>
                </li>
              ))}
            </Column>
            {active.groups.map((group) => (
              <LinkColumn key={group.title} title={group.title} links={group.links} />
            ))}
            {active.brands.length > 0 && <LinkColumn title="Marcas" links={active.brands} />}
            {active.promo && <PromoCard promo={active.promo} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-40">
      <p className="mb-4 text-xs font-semibold tracking-wider text-text-2 uppercase">{title}</p>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function LinkColumn({ title, links }: { title: string; links: NavigationLink[] }) {
  return (
    <Column title={title}>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="text-text transition-colors duration-120 hover:text-link">
            {link.label}
          </a>
        </li>
      ))}
    </Column>
  );
}

function PromoCard({ promo }: { promo: NavigationPromo }) {
  return (
    <a
      href={promo.href}
      className="group flex flex-col items-start gap-3 rounded-xl bg-subtle p-6 md:ml-auto md:w-80"
    >
      <span className="rounded-full bg-coral-500 px-2.5 py-0.5 text-xs font-semibold text-ink-on-accent">
        {promo.tag}
      </span>
      <span className="font-heading text-2xl font-bold text-text">{promo.title}</span>
      <span className="mt-2 font-semibold text-link group-hover:underline">{promo.cta}</span>
    </a>
  );
}
