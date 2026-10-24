import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryNavigationAction } from '../../actions/get-category-navigation-action';
import { navigation } from '../../testing/fixtures';
import { createQueryWrapper } from '../../testing/query-wrapper';
import { CategoryMenuController } from '.';

vi.mock('../../actions/get-category-navigation-action', () => ({ getCategoryNavigationAction: vi.fn() }));

const renderMenu = () => {
  const { wrapper } = createQueryWrapper();
  return render(<CategoryMenuController />, { wrapper });
};

const panel = () => {
  const button = screen.getByRole('button', { name: 'Todas as categorias' });
  const element = document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (!element) throw new Error('Painel referenciado por aria-controls não encontrado');
  return element;
};

describe('CategoryMenuController', () => {
  beforeEach(() => vi.mocked(getCategoryNavigationAction).mockReset());

  it('carrega o menu e abre o painel com a primeira categoria ao clicar no botão', async () => {
    vi.mocked(getCategoryNavigationAction).mockResolvedValue({ success: true, message: 'Sucesso', data: navigation });
    renderMenu();

    await screen.findByRole('link', { name: 'Ofertas' });
    expect(panel().hidden).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Todas as categorias' }));

    expect(panel().hidden).toBe(false);
    expect(screen.getByRole('link', { name: 'Smartphones' })).toBeTruthy();
  });

  it('hover numa categoria da barra abre o painel com ela e sair da área fecha', async () => {
    vi.mocked(getCategoryNavigationAction).mockResolvedValue({ success: true, message: 'Sucesso', data: navigation });
    const { container } = renderMenu();

    const [notebooksLink] = await screen.findAllByRole('link', { name: 'Notebooks' });
    fireEvent.mouseEnter(notebooksLink);

    expect(panel().hidden).toBe(false);
    expect(screen.getByRole('link', { name: 'Ver tudo em Notebooks' })).toBeTruthy();

    fireEvent.mouseLeave(container.firstChild as HTMLElement);
    expect(panel().hidden).toBe(true);
  });

  it('mostra erro e permite tentar de novo quando a action falha', async () => {
    vi.mocked(getCategoryNavigationAction)
      .mockResolvedValueOnce({ success: false, message: 'Fora do ar' })
      .mockResolvedValueOnce({ success: true, message: 'Sucesso', data: navigation });
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Todas as categorias' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(screen.getByRole('link', { name: 'Smartphones' })).toBeTruthy());
    expect(getCategoryNavigationAction).toHaveBeenCalledTimes(2);
  });
});
