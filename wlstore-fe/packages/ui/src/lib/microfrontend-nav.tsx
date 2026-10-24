import { cn } from './utils';
import { MICROFRONTENDS } from './registry';

export interface NavItem {
  key: string;
  label: string;
  basePath: string;
}

export interface MicrofrontendNavProps {
  /** Chave do microfrontend que está renderizando a barra (marca o item ativo). */
  active: string;
}

/**
 * Barra de navegação compartilhada entre todos os microfrontends.
 *
 * Usa <a> nativo em vez de next/link de propósito: cada microfrontend é uma
 * aplicação Next independente, então a navegação entre eles é uma navegação
 * de documento completa, não client-side routing.
 */
export function MicrofrontendNav({ active }: MicrofrontendNavProps) {
  return (
    <nav className="flex items-center gap-6 border-b bg-card px-6 py-3 text-sm">
      <span className="mr-auto font-heading text-base font-bold text-text">WLStore</span>
      {MICROFRONTENDS.map((mfe) => (
        <a
          key={mfe.key}
          href={mfe.basePath}
          aria-current={mfe.key === active ? 'page' : undefined}
          className={cn(
            'rounded-sm px-2 py-1 transition-colors duration-120 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            mfe.key === active ? 'font-semibold text-brand-ink' : 'text-text-2',
          )}
        >
          {mfe.label}
        </a>
      ))}
    </nav>
  );
}
