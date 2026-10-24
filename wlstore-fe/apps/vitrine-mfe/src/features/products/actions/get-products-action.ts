'use server';

import type { ActionResult } from '../../../shared/types';
import { getProducts } from '../http/get-products';
import type { Product, ProductsQuery } from '../types';

export async function getProductsAction(query: ProductsQuery): Promise<ActionResult<Product[]>> {
  try {
    const data = await getProducts(query);
    return { success: true, message: 'Sucesso', data };
  } catch (error) {
    console.error('[Get Products Action Error]', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro inesperado',
    };
  }
}
