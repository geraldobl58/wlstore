import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiscountBadge } from '.';

describe('DiscountBadge', () => {
  it('mostra o percentual de desconto', () => {
    const { container } = render(<DiscountBadge priceCents={219990} originalPriceCents={249900} />);

    expect(container.textContent).toBe('-12 %');
  });

  it('não renderiza nada sem desconto', () => {
    const { container } = render(<DiscountBadge priceCents={5990} />);

    expect(container.innerHTML).toBe('');
  });
});
