import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryWrapper } from '../../../shared/testing/query-wrapper';
import { getProductsAction } from '../actions/get-products-action';
import { product } from '../testing/fixtures';
import { productsQueryOptions } from './products-query';
import { useGetProducts } from './use-get-products';

vi.mock('../actions/get-products-action', () => ({ getProductsAction: vi.fn() }));

const query = { sort: 'createdAt,desc', size: 4 };

describe('useGetProducts', () => {
  beforeEach(() => vi.mocked(getProductsAction).mockReset());

  it('carrega os produtos da consulta', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({ success: true, message: 'Sucesso', data: [product()] });
    const { wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useGetProducts(query), { wrapper });
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.products).toEqual([product()]));
    expect(getProductsAction).toHaveBeenCalledWith(query);
  });

  it('transforma { success: false } em erro', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({ success: false, message: 'Fora do ar' });
    const { wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useGetProducts(query), { wrapper });

    await waitFor(() => expect(result.current.error?.message).toBe('Fora do ar'));
    expect(result.current.products).toEqual([]);
  });

  it('consultas diferentes têm caches diferentes', () => {
    expect(productsQueryOptions(query).queryKey).not.toEqual(productsQueryOptions({ size: 4 }).queryKey);
  });
});
