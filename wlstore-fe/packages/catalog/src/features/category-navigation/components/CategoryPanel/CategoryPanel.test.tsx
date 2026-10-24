import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { navigation } from '../../testing/fixtures';
import { CategoryPanel } from '.';

const [celulares, notebooks] = navigation.categories;

const renderPanel = (props: Partial<Parameters<typeof CategoryPanel>[0]> = {}) => {
  const handlers = { onRetry: vi.fn(), onActivate: vi.fn() };
  const view = render(
    <CategoryPanel
      id="panel"
      open
      categories={navigation.categories}
      active={celulares}
      isLoading={false}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, ...view };
};

describe('CategoryPanel', () => {
  it('fica oculto quando fechado', () => {
    const { container } = renderPanel({ open: false });

    expect((container.firstChild as HTMLElement).hidden).toBe(true);
  });

  it('mostra colunas, marcas e promoção da categoria ativa', () => {
    renderPanel();

    expect(screen.getByText('Categorias')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Smartphones' })).toBeTruthy();
    expect(screen.getByText('Marcas')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Xiaomi' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Até 12% off no Redmi 18 Pro/ }).getAttribute('href')).toBe(
      '/catalog?marca=Xiaomi',
    );
  });

  it('marca a categoria ativa e omite marcas e promoção quando não há', () => {
    renderPanel({ active: notebooks });

    const links = screen.getAllByRole('link', { name: 'Notebooks' });
    expect(links[0].getAttribute('aria-current')).toBe('true');
    expect(screen.queryByText('Marcas')).toBeNull();
    expect(screen.queryByText('Semana dos celulares')).toBeNull();
  });

  it('hover e foco na lista de categorias trocam a ativa', () => {
    const { onActivate } = renderPanel();
    const [notebooksLink] = screen.getAllByRole('link', { name: 'Notebooks' });

    fireEvent.mouseEnter(notebooksLink);
    fireEvent.focus(notebooksLink);

    expect(onActivate).toHaveBeenCalledTimes(2);
    expect(onActivate).toHaveBeenCalledWith('notebooks');
  });

  it('em erro, mostra a mensagem, permite tentar de novo e oferece o catálogo', () => {
    const { onRetry } = renderPanel({ categories: [], active: undefined, errorMessage: 'Falhou.' });

    expect(screen.getByText(/Falhou\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'ver o catálogo completo' }).getAttribute('href')).toBe('/catalog');
  });

  it('mostra o estado de carregamento', () => {
    renderPanel({ categories: [], active: undefined, isLoading: true });

    expect(screen.getByText('Carregando categorias…')).toBeTruthy();
  });
});
