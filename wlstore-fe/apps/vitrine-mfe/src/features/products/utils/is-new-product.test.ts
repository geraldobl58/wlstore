import { describe, expect, it } from 'vitest';
import { NOW } from '../testing/fixtures';
import { isNewProduct, productHref } from './is-new-product';

describe('isNewProduct', () => {
  it('é novo até 30 dias após o cadastro', () => {
    expect(isNewProduct('2026-10-20T12:00:00Z', NOW)).toBe(true);
    expect(isNewProduct('2026-09-24T12:00:00Z', NOW)).toBe(true);
  });

  it('deixa de ser novo depois de 30 dias', () => {
    expect(isNewProduct('2026-09-24T11:59:59Z', NOW)).toBe(false);
  });

  it('data inválida não é novidade', () => {
    expect(isNewProduct('ontem', NOW)).toBe(false);
  });
});

describe('productHref', () => {
  it('aponta para a página de produto da vitrine', () => {
    expect(productHref('abc 1')).toBe('/p/abc%201');
  });
});
