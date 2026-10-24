import { api } from '../../../config/api';
import type { PageResponse } from '../../../shared/types';
import type { ProductSummary } from '../types';

/** GET /api/v1/products: produtos ativos da categoria e das subcategorias. */
export async function getActiveProductsByCategory(categoryId: string): Promise<ProductSummary[]> {
  const page = await api
    .get('api/v1/products', { searchParams: { categoryId, status: 'ACTIVE', size: 100 } })
    .json<PageResponse<ProductSummary>>();
  return page.data;
}
