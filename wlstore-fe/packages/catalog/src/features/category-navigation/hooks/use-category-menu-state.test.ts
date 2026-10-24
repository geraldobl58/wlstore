import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCategoryMenuState } from './use-category-menu-state';

const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

describe('useCategoryMenuState', () => {
  it('começa fechado e alterna com toggle', () => {
    const { result } = renderHook(() => useCategoryMenuState());
    expect(result.current.open).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it('openWith abre o painel com a categoria em destaque', () => {
    const { result } = renderHook(() => useCategoryMenuState());

    act(() => result.current.openWith('notebooks'));

    expect(result.current.open).toBe(true);
    expect(result.current.activeSlug).toBe('notebooks');
  });

  it('Esc fecha e devolve o foco ao botão', () => {
    const { result } = renderHook(() => useCategoryMenuState());
    const trigger = document.createElement('button');
    document.body.append(trigger);
    result.current.triggerRef.current = trigger;

    act(() => result.current.toggle());
    act(pressEscape);

    expect(result.current.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('ignora outras teclas e não escuta teclado com o painel fechado', () => {
    const { result } = renderHook(() => useCategoryMenuState());

    act(() => result.current.toggle());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current.open).toBe(true);

    act(() => result.current.close());
    act(pressEscape);
    expect(result.current.open).toBe(false);
  });
});
