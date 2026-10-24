import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProducts } from '../http/get-products';
import { product } from '../testing/fixtures';
import { getProductsAction } from './get-products-action';

vi.mock('../http/get-products', () => ({ getProducts: vi.fn() }));

describe('getProductsAction', () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('repassa a consulta e devolve { success: true, data }', async () => {
    vi.mocked(getProducts).mockResolvedValue([product()]);

    await expect(getProductsAction({ sort: 'createdAt,desc' })).resolves.toEqual({
      success: true,
      message: 'Sucesso',
      data: [product()],
    });
    expect(getProducts).toHaveBeenCalledWith({ sort: 'createdAt,desc' });
  });

  it('erro vira { success: false } com a mensagem, sem lançar', async () => {
    vi.mocked(getProducts).mockRejectedValue(new Error('Não foi possível falar com o servidor.'));

    await expect(getProductsAction({})).resolves.toEqual({
      success: false,
      message: 'Não foi possível falar com o servidor.',
    });
  });

  it('erro que não é Error vira mensagem genérica', async () => {
    vi.mocked(getProducts).mockRejectedValue('boom');

    await expect(getProductsAction({})).resolves.toEqual({ success: false, message: 'Erro inesperado' });
  });
});
