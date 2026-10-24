import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { navigation } from '../../testing/fixtures';
import { CategoryBar } from '.';

const renderBar = (props: Partial<Parameters<typeof CategoryBar>[0]> = {}) => {
  const onToggle = vi.fn();
  render(
    <CategoryBar
      highlights={navigation.highlights}
      open={false}
      panelId="panel"
      triggerRef={createRef()}
      onToggle={onToggle}
      {...props}
    />,
  );
  return { onToggle };
};

describe('CategoryBar', () => {
  it('mostra só o botão e os destaques, sem links de categoria', () => {
    renderBar();

    expect(screen.getByRole('button', { name: 'Todas as categorias' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ofertas' }).getAttribute('href')).toBe('/?ofertas=true');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('reflete o estado do painel no aria-expanded', () => {
    renderBar({ open: true });

    const button = screen.getByRole('button', { name: 'Todas as categorias' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('panel');
  });

  it('clique no botão alterna o painel', () => {
    const { onToggle } = renderBar();

    fireEvent.click(screen.getByRole('button', { name: 'Todas as categorias' }));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('sem destaques (carregando ou erro) não renderiza a navegação vazia', () => {
    renderBar({ highlights: [] });

    expect(screen.queryByRole('navigation', { name: 'Destaques' })).toBeNull();
  });
});
