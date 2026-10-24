/** Espelha o CategoryResponseDTO do catalog-service (árvore aninhada). */
export interface Category {
  id: string;
  title: string;
  slug: string;
  children: Category[];
}

/** Campos do ProductResponseDTO usados pelo menu. */
export interface ProductSummary {
  id: string;
  title: string;
  brand: string;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationGroup {
  title: string;
  links: NavigationLink[];
}

export interface NavigationPromo {
  tag: string;
  title: string;
  cta: string;
  href: string;
}

export interface NavigationCategory {
  slug: string;
  title: string;
  href: string;
  /** Colunas de subcategorias exibidas quando a categoria está ativa. */
  groups: NavigationGroup[];
  brands: NavigationLink[];
  promo?: NavigationPromo;
}

export interface CategoryNavigation {
  categories: NavigationCategory[];
  /** Links de destaque no fim da barra (ex.: Ofertas). */
  highlights: NavigationLink[];
}
