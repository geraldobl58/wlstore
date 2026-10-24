import { Button } from '@wlstore/ui/components/ui/button';
import { MenuIcon } from 'lucide-react';
import type { RefObject } from 'react';
import type { NavigationCategory, NavigationLink } from '../../types';

interface CategoryBarProps {
  categories: NavigationCategory[];
  highlights: NavigationLink[];
  isLoading: boolean;
  open: boolean;
  panelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  /** Passar o mouse numa categoria abre o painel com ela em destaque. */
  onPreview: (slug: string) => void;
}

/**
 * Os links são <a>: a maioria leva para outro microfrontend (navegação de
 * documento, não client-side routing).
 */
export function CategoryBar({
  categories,
  highlights,
  isLoading,
  open,
  panelId,
  triggerRef,
  onToggle,
  onPreview,
}: CategoryBarProps) {
  return (
    <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-6">
      <Button
        ref={triggerRef}
        variant="outline"
        className="border-control"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <MenuIcon aria-hidden />
        Todas as categorias
      </Button>

      <nav aria-label="Categorias" className="hidden items-center gap-8 md:flex">
        {isLoading &&
          Array.from({ length: 5 }, (_, i) => (
            <span key={i} data-testid="category-skeleton" className="h-4 w-20 animate-pulse rounded-sm bg-subtle" />
          ))}
        {categories.map((category) => (
          <a
            key={category.slug}
            href={category.href}
            onMouseEnter={() => onPreview(category.slug)}
            className="font-medium text-text transition-colors duration-120 hover:text-link"
          >
            {category.title}
          </a>
        ))}
        {highlights.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-medium text-coral-text transition-colors duration-120 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
