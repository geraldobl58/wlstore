import { api } from '../../../config/api';
import type { PageResponse } from '../../../shared/types';
import type { Product, ProductsQuery } from '../types';

/** GET /api/v1/products: só produtos ativos (é vitrine). */
export async function getProducts({ sort, size = 12, categorySlug, brand, title }: ProductsQuery): Promise<Product[]> {
  const page = await api
    .get('api/v1/products', {
      searchParams: {
        status: 'ACTIVE',
        size,
        ...(sort ? { sort } : {}),
        ...(categorySlug ? { categorySlug } : {}),
        ...(brand ? { brand } : {}),
        ...(title ? { title } : {}),
      },
    })
    .json<PageResponse<Product>>();
  return page.data;
}
