import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryNavigationAction } from '../actions/get-category-navigation-action';
import { navigation } from '../testing/fixtures';
import { createQueryWrapper } from '../../../shared/testing/query-wrapper';
import { CATEGORY_NAVIGATION_QUERY_KEY } from './category-navigation-query';
import { useGetCategoryNavigation } from './use-get-category-navigation';

vi.mock('../actions/get-category-navigation-action', () => ({ getCategoryNavigationAction: vi.fn() }));

describe('useGetCategoryNavigation', () => {
  beforeEach(() => vi.mocked(getCategoryNavigationAction).mockReset());

  it('começa carregando com listas vazias e depois expõe categorias e destaques', async () => {
    vi.mocked(getCategoryNavigationAction).mockResolvedValue({
      success: true,
      message: 'Sucesso',
      data: navigation,
    });
    const { wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useGetCategoryNavigation(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.categories).toEqual(navigation.categories);
    expect(result.current.highlights).toEqual(navigation.highlights);
    expect(result.current.error).toBeNull();
  });

  it('transforma { success: false } da action em erro da query', async () => {
    vi.mocked(getCategoryNavigationAction).mockResolvedValue({
      success: false,
      message: 'Não foi possível falar com o servidor.',
    });
    const { wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useGetCategoryNavigation(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe('Não foi possível falar com o servidor.');
    expect(result.current.categories).toEqual([]);
  });

  it('usa os dados hidratados do servidor sem chamar a action de novo', () => {
    const { queryClient, wrapper } = createQueryWrapper();
    queryClient.setQueryData(CATEGORY_NAVIGATION_QUERY_KEY, navigation);

    const { result } = renderHook(() => useGetCategoryNavigation(), { wrapper });

    expect(result.current.categories).toEqual(navigation.categories);
    expect(getCategoryNavigationAction).not.toHaveBeenCalled();
  });
});
