import { pricingHttp } from '../../lib/http';

/** Espelha o PriceResponseDTO do pricing-service. */
export interface Price {
  sku: string;
  amountCents: number;
  originalAmountCents: number | null;
  validFrom: string;
  validTo: string | null;
}

export interface DefinePriceInput {
  amountCents: number;
  originalAmountCents?: number;
}

/** PUT /api/v1/prices/{sku} */
export const definePrice = (sku: string, input: DefinePriceInput) =>
  pricingHttp.put(`api/v1/prices/${encodeURIComponent(sku)}`, { json: input }).json<Price>();

/** GET /api/v1/prices?skus=A,B */
export const listCurrentPrices = (skus: string[]) =>
  pricingHttp.get('api/v1/prices', { searchParams: { skus: skus.join(',') } }).json<Price[]>();

/** GET /api/v1/prices/{sku}/history */
export const getPriceHistory = (sku: string) =>
  pricingHttp.get(`api/v1/prices/${encodeURIComponent(sku)}/history`).json<Price[]>();
