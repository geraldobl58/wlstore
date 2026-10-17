import type { CSSProperties } from 'react';
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

const bar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '0.75rem 1.5rem',
  borderBottom: '1px solid #e5e7eb',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '0.9rem',
};

const brand: CSSProperties = { fontWeight: 700, marginRight: 'auto' };

function linkStyle(isActive: boolean): CSSProperties {
  return {
    color: isActive ? '#0f172a' : '#64748b',
    fontWeight: isActive ? 600 : 400,
    textDecoration: 'none',
  };
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
    <nav style={bar}>
      <span style={brand}>my-workspace</span>
      {MICROFRONTENDS.map((mfe) => (
        <a key={mfe.key} href={mfe.basePath} style={linkStyle(mfe.key === active)}>
          {mfe.label}
        </a>
      ))}
    </nav>
  );
}
