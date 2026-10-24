const NEW_PRODUCT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Novo" = cadastrado nos últimos 30 dias. */
export function isNewProduct(createdAt: string, now: number = Date.now()): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return now - created <= NEW_PRODUCT_DAYS * DAY_MS;
}

export const productHref = (id: string) => `/p/${encodeURIComponent(id)}`;
