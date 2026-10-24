import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoreFooter } from './store-footer';

describe('StoreFooter', () => {
  it('mostra o copyright com o ano e o nome da loja', () => {
    render(<StoreFooter storeName="Nova Loja" year={2026} />);

    expect(screen.getByText('© 2026 Nova Loja. Todos os direitos reservados.')).toBeTruthy();
  });

  it('renderiza as colunas de links', () => {
    render(
      <StoreFooter
        storeName="Nova Loja"
        year={2026}
        columns={[{ title: 'Para lojistas', links: [{ label: 'Painel do lojista', href: '/painel' }] }]}
      />,
    );

    expect(screen.getByText('Para lojistas')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Painel do lojista' }).getAttribute('href')).toBe('/painel');
  });

  it('sem colunas, não renderiza a navegação do rodapé', () => {
    render(<StoreFooter storeName="Nova Loja" year={2026} />);

    expect(screen.queryByRole('navigation', { name: 'Rodapé' })).toBeNull();
  });
});
