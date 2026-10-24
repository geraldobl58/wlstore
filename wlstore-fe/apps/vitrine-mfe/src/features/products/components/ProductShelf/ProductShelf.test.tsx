import { render, screen } from '@testing-library/react';
import { connection } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryWrapper } from '../../../../shared/testing/query-wrapper';
import { getProductsAction } from '../../actions/get-products-action';
import { product } from '../../testing/fixtures';
import { ProductShelf } from '.';

vi.mock('next/server', () => ({ connection: vi.fn() }));
vi.mock('../../actions/get-products-action', () => ({ getProductsAction: vi.fn() }));

describe('ProductShelf (servidor)', () => {
  beforeEach(() => vi.mocked(getProductsAction).mockReset());

  it('busca no servidor por requisição e entrega os cards já hidratados', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({ success: true, message: 'Sucesso', data: [product()] });

    const element = await ProductShelf({ title: 'Novidades', query: { sort: 'createdAt,desc' } });
    const { wrapper } = createQueryWrapper();
    render(element, { wrapper });

    expect(connection).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Redmi Watch 5 Active com GPS' })).toBeTruthy();
    expect(getProductsAction).toHaveBeenCalledOnce();
  });
});
