import { beforeEach, describe, expect, it, vi } from 'vitest';
import { celulares } from '../testing/fixtures';
import { getRootCategories } from './get-root-categories';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../config/api', () => ({ api: { get } }));

describe('getRootCategories', () => {
  beforeEach(() => get.mockReset());

  it('busca a primeira página ordenada por título e devolve só os dados', async () => {
    get.mockReturnValue({ json: () => Promise.resolve({ data: [celulares] }) });

    await expect(getRootCategories()).resolves.toEqual([celulares]);
    expect(get).toHaveBeenCalledWith('api/v1/categories', {
      searchParams: { size: 100, sort: 'title,asc' },
    });
  });

  it('propaga o erro do cliente HTTP', async () => {
    get.mockReturnValue({ json: () => Promise.reject(new Error('Serviço fora do ar')) });

    await expect(getRootCategories()).rejects.toThrow('Serviço fora do ar');
  });
});
