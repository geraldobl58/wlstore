import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceTag } from '.';

const text = (el: HTMLElement) => (el.textContent ?? '').replace(/\u00a0/g, ' ');

describe('PriceTag', () => {
  it('mostra o preço e o parcelamento', () => {
    const { container } = render(<PriceTag priceCents={79900} />);

    expect(text(container)).toContain('R$ 799,00');
    expect(text(container)).toContain('10x de R$ 79,90 sem juros');
    expect(container.querySelector('s')).toBeNull();
  });

  it('em promoção, risca o preço "de" e anuncia "De/Por" para leitores de tela', () => {
    const { container } = render(<PriceTag priceCents={5990} originalPriceCents={7990} />);

    expect(text(container.querySelector('s') as HTMLElement)).toBe('De R$ 79,90');
    expect(text(container)).toContain('Por R$ 59,90');
  });

  it('omite o parcelamento quando não dá para parcelar', () => {
    const { container } = render(<PriceTag priceCents={5990} />);

    expect(text(container)).not.toContain('sem juros');
  });

  it('ignora preço "de" que não é maior que o atual', () => {
    const { container } = render(<PriceTag priceCents={5990} originalPriceCents={5990} />);

    expect(container.querySelector('s')).toBeNull();
  });
});
