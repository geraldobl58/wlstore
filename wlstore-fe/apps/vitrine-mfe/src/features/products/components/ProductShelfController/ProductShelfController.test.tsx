import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryWrapper } from '../../../../shared/testing/query-wrapper';
import { getProductsAction } from '../../actions/get-products-action';
import { product } from '../../testing/fixtures';
import { ProductShelfController } from '.';

vi.mock('../../actions/get-products-action', () => ({ getProductsAction: vi.fn() }));

const renderShelf = () => {
  const { wrapper } = createQueryWrapper();
  return render(
    <ProductShelfController eyebrow="Acabou de chegar" title="Novidades" viewAllHref="/" query={{ size: 4 }} />,
    { wrapper },
  );
};

describe('ProductShelfController', () => {
  beforeEach(() => vi.mocked(getProductsAction).mockReset());

  it('mostra cabeçalho, placeholders enquanto carrega e depois os cards', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({
      success: true,
      message: 'Sucesso',
      data: [product(), product({ id: 'p-2', title: 'Cabo USB-C' })],
    });
    renderShelf();

    expect(screen.getByRole('heading', { name: 'Novidades' })).toBeTruthy();
    expect(screen.getByText('Acabou de chegar')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver tudo' }).getAttribute('href')).toBe('/');
    expect(screen.getAllByTestId('product-skeleton')).toHaveLength(4);

    expect(await screen.findByRole('link', { name: 'Cabo USB-C' })).toBeTruthy();
    expect(screen.queryByTestId('product-skeleton')).toBeNull();
  });

  it('em modo grade, os cards ocupam a largura sem rolagem horizontal', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({ success: true, message: 'Sucesso', data: [product()] });
    const { wrapper } = createQueryWrapper();
    render(<ProductShelfController title="Xiaomi" layout="grid" query={{ brand: 'Xiaomi' }} />, { wrapper });

    const card = await screen.findByRole('link', { name: 'Redmi Watch 5 Active com GPS' });
    const list = card.closest('ul') as HTMLElement;
    expect(list.className).toContain('grid');
    expect(list.className).not.toContain('overflow-x-auto');
    expect(screen.queryByRole('link', { name: 'Ver tudo' })).toBeNull();
  });

  it('avisa quando não há produtos', async () => {
    vi.mocked(getProductsAction).mockResolvedValue({ success: true, message: 'Sucesso', data: [] });
    renderShelf();

    expect(await screen.findByText('Nenhum produto por aqui ainda.')).toBeTruthy();
  });

  it('em erro, permite tentar de novo', async () => {
    vi.mocked(getProductsAction)
      .mockResolvedValueOnce({ success: false, message: 'Fora do ar' })
      .mockResolvedValueOnce({ success: true, message: 'Sucesso', data: [product()] });
    renderShelf();

    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('link', { name: 'Redmi Watch 5 Active com GPS' })).toBeTruthy();
  });
});
