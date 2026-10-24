import { beforeEach, describe, expect, it, vi } from 'vitest';
import { product } from '../testing/fixtures';
import { getProducts } from './get-products';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../config/api', () => ({ api: { get } }));

describe('getProducts', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockReturnValue({ json: () => Promise.resolve({ data: [product()] }) });
  });

  it('busca só produtos ativos com ordenação, categoria, marca e título e devolve os dados', async () => {
    await expect(getProducts({ sort: 'createdAt,desc', size: 8, categorySlug: 'fones', brand: 'Xiaomi', title: 'redmi' })).resolves.toEqual([
      product(),
    ]);
    expect(get).toHaveBeenCalledWith('api/v1/products', {
      searchParams: { status: 'ACTIVE', size: 8, sort: 'createdAt,desc', categorySlug: 'fones', brand: 'Xiaomi', title: 'redmi' },
    });
  });

  it('omite filtros não informados e usa 12 itens por padrão', async () => {
    await getProducts({});
    expect(get).toHaveBeenCalledWith('api/v1/products', { searchParams: { status: 'ACTIVE', size: 12 } });
  });

  it('propaga o erro do cliente HTTP', async () => {
    get.mockReturnValue({ json: () => Promise.reject(new Error('fora do ar')) });
    await expect(getProducts({})).rejects.toThrow('fora do ar');
  });
});
