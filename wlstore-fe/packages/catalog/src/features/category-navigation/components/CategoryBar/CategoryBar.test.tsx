import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { navigation } from '../../testing/fixtures';
import { CategoryBar } from '.';

const renderBar = (props: Partial<Parameters<typeof CategoryBar>[0]> = {}) => {
  const handlers = { onToggle: vi.fn(), onPreview: vi.fn() };
  render(
    <CategoryBar
      categories={navigation.categories}
      highlights={navigation.highlights}
      isLoading={false}
      open={false}
      panelId="panel"
      triggerRef={createRef()}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe('CategoryBar', () => {
  it('mostra o botão, um link por categoria e os destaques', () => {
    renderBar();

    expect(screen.getByRole('button', { name: 'Todas as categorias' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Celulares' }).getAttribute('href')).toBe('/catalog?categoria=celulares');
    expect(screen.getByRole('link', { name: 'Ofertas' }).getAttribute('href')).toBe('/catalog?ofertas=true');
  });

  it('reflete o estado do painel no aria-expanded', () => {
    renderBar({ open: true });

    const button = screen.getByRole('button', { name: 'Todas as categorias' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('panel');
  });

  it('clique no botão alterna e hover numa categoria pede a prévia', () => {
    const { onToggle, onPreview } = renderBar();

    fireEvent.click(screen.getByRole('button', { name: 'Todas as categorias' }));
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Notebooks' }));

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onPreview).toHaveBeenCalledWith('notebooks');
  });

  it('mostra placeholders enquanto carrega', () => {
    renderBar({ isLoading: true, categories: [], highlights: [] });

    expect(screen.getAllByTestId('category-skeleton')).toHaveLength(5);
  });
});
