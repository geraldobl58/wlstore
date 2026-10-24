/** Tipos usados por mais de uma feature do catálogo. */

/** Retorno padrão das Server Actions: nunca lançam. */
export interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

/** Espelha o PageResponseDTO do wlstore-common. */
export interface PageResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
