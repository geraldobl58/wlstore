'use server';

import { getActiveProductsByCategory } from '../http/get-active-products-by-category';
import { getRootCategories } from '../http/get-root-categories';
import type { ActionResult, Category, CategoryNavigation } from '../types';
import { buildCategoryNavigation } from '../utils/build-category-navigation';

/** Marcas são complemento do menu: se a busca falhar, a categoria fica sem marcas. */
async function getBrands(root: Category): Promise<string[]> {
  try {
    const products = await getActiveProductsByCategory(root.id);
    return products.map((product) => product.brand);
  } catch (error) {
    console.error(`[Get Category Navigation Action] Marcas de ${root.slug}`, error);
    return [];
  }
}

/**
 * Roda no servidor do app que renderiza o menu (shell, catalog ou pricing):
 * cada um chama o catalog-service direto, sem passar pelo catalog-mfe.
 */
export async function getCategoryNavigationAction(): Promise<ActionResult<CategoryNavigation>> {
  try {
    const roots = await getRootCategories();
    const brands = await Promise.all(roots.map(getBrands));
    const brandsBySlug = Object.fromEntries(roots.map((root, i) => [root.slug, brands[i]]));
    return {
      success: true,
      message: 'Sucesso',
      data: buildCategoryNavigation(roots, brandsBySlug),
    };
  } catch (error) {
    console.error('[Get Category Navigation Action Error]', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro inesperado',
    };
  }
}
