import { describe, expect, it } from 'vitest';
import { discountPercent, formatBRL, installments } from './price';

// Intl usa espaço não separável entre "R$" e o valor.
const brl = (text: string) => text.replace(/\u00a0/g, ' ');

describe('formatBRL', () => {
  it('formata centavos em reais com ponto no milhar e vírgula nos centavos', () => {
    expect(brl(formatBRL(79900))).toBe('R$ 799,00');
    expect(brl(formatBRL(249990))).toBe('R$ 2.499,90');
    expect(brl(formatBRL(5))).toBe('R$ 0,05');
  });
});

describe('installments', () => {
  it('usa o máximo de parcelas quando a parcela mínima permite', () => {
    expect(installments(79900)).toEqual({ count: 10, valueCents: 7990 });
  });

  it('reduz as parcelas para respeitar a parcela mínima de R$ 30', () => {
    expect(installments(6990)).toEqual({ count: 2, valueCents: 3495 });
    expect(installments(12900)).toEqual({ count: 4, valueCents: 3225 });
  });

  it('não parcela quando não cabem duas parcelas mínimas', () => {
    expect(installments(5990)).toBeNull();
  });

  it('aceita regra da loja', () => {
    expect(installments(29900, { maxInstallments: 6, minInstallmentCents: 1000 })).toEqual({
      count: 6,
      valueCents: 4983,
    });
  });
});

describe('discountPercent', () => {
  it('calcula o desconto arredondado', () => {
    expect(discountPercent(219990, 249900)).toBe(12);
    expect(discountPercent(5990, 7990)).toBe(25);
  });

  it('sem preço "de", ou com "de" menor ou igual, não há desconto', () => {
    expect(discountPercent(5990)).toBeNull();
    expect(discountPercent(5990, null)).toBeNull();
    expect(discountPercent(5990, 5990)).toBeNull();
    expect(discountPercent(5990, 4000)).toBeNull();
  });
});
