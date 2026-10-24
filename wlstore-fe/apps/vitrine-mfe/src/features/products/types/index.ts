export interface ProductImage {
  url: string;
  altText: string | null;
  primaryImage: boolean;
}

/**
 * Campos do ProductResponseDTO usados no card. `priceFromCents` é a cópia do
 * preço que o catálogo recebe do pricing-service por evento.
 */
export interface Product {
  id: string;
  title: string;
  brand: string;
  images: ProductImage[];
  priceFromCents: number | null;
  originalPriceFromCents: number | null;
  createdAt: string;
}

export interface ProductsQuery {
  /** Ordenação do Pageable do Spring, ex.: "createdAt,desc". */
  sort?: string;
  size?: number;
  categorySlug?: string;
  /** Busca parcial, sem diferenciar maiúsculas (filtro do catalog-service). */
  brand?: string;
  /** Busca parcial no título, sem diferenciar maiúsculas. */
  title?: string;
}
