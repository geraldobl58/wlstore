import { render, screen } from '@testing-library/react';
import { connection } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryNavigationAction } from '../../actions/get-category-navigation-action';
import { navigation } from '../../testing/fixtures';
import { createQueryWrapper } from '../../../../shared/testing/query-wrapper';
import { CategoryMenu } from '.';

vi.mock('next/server', () => ({ connection: vi.fn() }));
vi.mock('../../actions/get-category-navigation-action', () => ({ getCategoryNavigationAction: vi.fn() }));

describe('CategoryMenu (servidor)', () => {
  beforeEach(() => vi.mocked(getCategoryNavigationAction).mockReset());

  it('busca no servidor por requisição e entrega o menu já hidratado', async () => {
    vi.mocked(getCategoryNavigationAction).mockResolvedValue({ success: true, message: 'Sucesso', data: navigation });

    const element = await CategoryMenu();
    const { wrapper } = createQueryWrapper();
    render(element, { wrapper });

    expect(connection).toHaveBeenCalled();
    // Já no primeiro render, sem esperar nova busca no navegador.
    expect(screen.getByRole('link', { name: 'Ofertas' })).toBeTruthy();
    expect(getCategoryNavigationAction).toHaveBeenCalledOnce();
  });

  it('se a busca falhar no servidor, não hidrata e o navegador tenta de novo', async () => {
    vi.mocked(getCategoryNavigationAction)
      .mockResolvedValueOnce({ success: false, message: 'Fora do ar' })
      .mockResolvedValueOnce({ success: true, message: 'Sucesso', data: navigation });

    const element = await CategoryMenu();
    const { wrapper } = createQueryWrapper();
    render(element, { wrapper });

    expect(await screen.findByRole('link', { name: 'Ofertas' })).toBeTruthy();
    expect(getCategoryNavigationAction).toHaveBeenCalledTimes(2);
  });
});
