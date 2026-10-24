import { Button } from '@wlstore/ui/components/ui/button';
import { MenuIcon } from 'lucide-react';
import type { RefObject } from 'react';
import type { NavigationLink } from '../../types';

interface CategoryBarProps {
  highlights: NavigationLink[];
  open: boolean;
  panelId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}

/**
 * As categorias ficam só no painel de "Todas as categorias"; a barra mostra o
 * botão e os destaques. Os links são <a>: levam para outro microfrontend
 * (navegação de documento, não client-side routing).
 */
export function CategoryBar({ highlights, open, panelId, triggerRef, onToggle }: CategoryBarProps) {
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

      {highlights.length > 0 && (
        <nav aria-label="Destaques" className="flex items-center gap-8">
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
      )}
    </div>
  );
}
