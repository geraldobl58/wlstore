import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveProductsByCategory } from '../http/get-active-products-by-category';
import { getRootCategories } from '../http/get-root-categories';
import { celulares, notebooks } from '../testing/fixtures';
import { getCategoryNavigationAction } from './get-category-navigation-action';

vi.mock('../http/get-root-categories', () => ({ getRootCategories: vi.fn() }));
vi.mock('../http/get-active-products-by-category', () => ({ getActiveProductsByCategory: vi.fn() }));

const product = (brand: string) => ({ id: brand, title: brand, brand });

describe('getCategoryNavigationAction', () => {
  beforeEach(() => {
    vi.mocked(getRootCategories).mockReset();
    vi.mocked(getActiveProductsByCategory).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('devolve o menu com as marcas de cada categoria raiz', async () => {
    vi.mocked(getRootCategories).mockResolvedValue([celulares, notebooks]);
    vi.mocked(getActiveProductsByCategory).mockImplementation(async (categoryId) =>
      categoryId === celulares.id ? [product('Xiaomi')] : [],
    );

    const result = await getCategoryNavigationAction();

    expect(result.success).toBe(true);
    expect(result.data?.categories.map((category) => category.brands.length)).toEqual([1, 0]);
    expect(getActiveProductsByCategory).toHaveBeenCalledTimes(2);
  });

  it('falha nas marcas não derruba o menu', async () => {
    vi.mocked(getRootCategories).mockResolvedValue([celulares]);
    vi.mocked(getActiveProductsByCategory).mockRejectedValue(new Error('timeout'));

    const result = await getCategoryNavigationAction();

    expect(result.success).toBe(true);
    expect(result.data?.categories[0].brands).toEqual([]);
  });

  it('falha nas categorias vira { success: false } com a mensagem, sem lançar', async () => {
    vi.mocked(getRootCategories).mockRejectedValue(new Error('Não foi possível falar com o servidor.'));

    await expect(getCategoryNavigationAction()).resolves.toEqual({
      success: false,
      message: 'Não foi possível falar com o servidor.',
    });
  });

  it('erro que não é Error vira mensagem genérica', async () => {
    vi.mocked(getRootCategories).mockRejectedValue('boom');

    const result = await getCategoryNavigationAction();
    expect(result).toEqual({ success: false, message: 'Erro inesperado' });
  });
});
