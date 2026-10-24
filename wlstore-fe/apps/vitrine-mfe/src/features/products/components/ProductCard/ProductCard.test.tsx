import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NOW, product } from '../../testing/fixtures';
import { ProductCard } from '.';

const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\u00a0/g, ' ');

describe('ProductCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('mostra marca, nome com link para o produto e preço com parcelas', () => {
    const { container } = render(<ProductCard product={product()} />);

    expect(screen.getByText('Xiaomi')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Redmi Watch 5 Active com GPS' }).getAttribute('href')).toBe('/p/p-1');
    expect(text(container)).toContain('R$ 299,00');
    expect(text(container)).toContain('9x de R$ 33,22 sem juros');
  });

  it('usa a imagem principal', () => {
    render(
      <ProductCard
        product={product({
          images: [
            { url: 'https://cdn/lado.png', altText: 'Lado', primaryImage: false },
            { url: 'https://cdn/frente.png', altText: 'Frente', primaryImage: true },
          ],
        })}
      />,
    );

    expect(screen.getByRole('img', { name: 'Frente' }).getAttribute('src')).toBe('https://cdn/frente.png');
  });

  it('mostra os selos de novidade e de desconto', () => {
    const { container } = render(
      <ProductCard product={product({ priceFromCents: 5990, originalPriceFromCents: 7990 })} />,
    );

    expect(screen.getByText('Novo')).toBeTruthy();
    expect(text(container)).toContain('-25 %');
  });

  it('produto antigo e sem desconto não tem selos', () => {
    render(<ProductCard product={product({ createdAt: '2025-01-01T00:00:00Z' })} />);

    expect(screen.queryByText('Novo')).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('sem preço sincronizado, avisa em vez de mostrar R$ 0,00', () => {
    render(<ProductCard product={product({ priceFromCents: null })} />);

    expect(screen.getByText('Preço indisponível')).toBeTruthy();
  });

  it('renderiza os espaços de ação de outros times', () => {
    render(
      <ProductCard
        product={product()}
        imageAction={<button type="button">Favoritar</button>}
        footer={<button type="button">Adicionar</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeTruthy();
  });
});
