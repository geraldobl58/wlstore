import { catalogHttp } from '../../lib/http';

/** Espelha o PageResponseDTO do wlstore-common. */
export interface Page<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Campos do ProductResponseDTO usados pela UI. */
export interface Product {
  id: string;
  title: string;
  brand: string;
  status: string;
  priceFromCents: number | null;
  originalPriceFromCents: number | null;
}

/** Filtros do ProductFilterDTO (todos opcionais, combinados com AND). */
export interface ProductFilter {
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  page?: number;
  size?: number;
}

/** GET /api/v1/products */
export const listProducts = ({ page = 0, size = 20, ...filter }: ProductFilter = {}) => {
  const searchParams = new URLSearchParams({ page: String(page), size: String(size) });
  for (const [key, value] of Object.entries(filter)) {
    if (value) searchParams.set(key, value);
  }
  return catalogHttp.get('api/v1/products', { searchParams }).json<Page<Product>>();
};
