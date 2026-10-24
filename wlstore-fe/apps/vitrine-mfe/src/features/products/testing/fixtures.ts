import type { Product } from '../types';

export const NOW = Date.parse('2026-10-24T12:00:00Z');

export const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  title: 'Redmi Watch 5 Active com GPS',
  brand: 'Xiaomi',
  images: [],
  priceFromCents: 29900,
  originalPriceFromCents: null,
  createdAt: '2026-10-20T12:00:00Z',
  ...overrides,
});
