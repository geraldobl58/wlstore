import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getActiveProductsByCategory } from './get-active-products-by-category';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../config/api', () => ({ api: { get } }));

describe('getActiveProductsByCategory', () => {
  beforeEach(() => get.mockReset());

  it('filtra por categoria e status ACTIVE e devolve só os dados', async () => {
    const products = [{ id: '1', title: 'Redmi 18 Pro', brand: 'Xiaomi' }];
    get.mockReturnValue({ json: () => Promise.resolve({ data: products }) });

    await expect(getActiveProductsByCategory('id-celulares')).resolves.toEqual(products);
    expect(get).toHaveBeenCalledWith('api/v1/products', {
      searchParams: { categoryId: 'id-celulares', status: 'ACTIVE', size: 100 },
    });
  });

  it('propaga o erro do cliente HTTP', async () => {
    get.mockReturnValue({ json: () => Promise.reject(new Error('404')) });

    await expect(getActiveProductsByCategory('x')).rejects.toThrow('404');
  });
});
