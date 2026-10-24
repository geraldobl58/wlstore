import { api } from '../../../config/api';
import type { PageResponse } from '../../../shared/types';
import type { Category } from '../types';

/** GET /api/v1/categories: categorias raiz, cada uma com a subárvore completa. */
export async function getRootCategories(): Promise<Category[]> {
  const page = await api
    .get('api/v1/categories', { searchParams: { size: 100, sort: 'title,asc' } })
    .json<PageResponse<Category>>();
  return page.data;
}
