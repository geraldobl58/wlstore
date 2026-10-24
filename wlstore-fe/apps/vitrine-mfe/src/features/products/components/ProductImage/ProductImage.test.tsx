import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductImage } from '.';

describe('ProductImage', () => {
  it('mostra a foto quando há URL', () => {
    render(<ProductImage src="https://cdn.loja.com/redmi.png" alt="Redmi Watch" />);

    expect(screen.getByRole('img', { name: 'Redmi Watch' }).tagName).toBe('IMG');
  });

  it('sem URL, mostra o substituto com o mesmo nome acessível', () => {
    render(<ProductImage alt="Redmi Watch" />);

    expect(screen.getByRole('img', { name: 'Redmi Watch' }).tagName).toBe('DIV');
  });

  it('troca pelo substituto se a imagem já tinha falhado antes de montar (SSR)', () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    const width = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);

    render(<ProductImage src="https://example.com/quebrada.png" alt="Redmi Watch" />);

    expect(screen.getByRole('img', { name: 'Redmi Watch' }).tagName).toBe('DIV');
    complete.mockRestore();
    width.mockRestore();
  });

  it('mantém a foto que já carregou antes de montar', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(800);

    render(<ProductImage src="https://cdn.loja.com/redmi.png" alt="Redmi Watch" />);

    expect(screen.getByRole('img', { name: 'Redmi Watch' }).tagName).toBe('IMG');
  });

  it('troca pelo substituto quando a imagem falha ao carregar', () => {
    render(<ProductImage src="https://example.com/quebrada.png" alt="Redmi Watch" />);

    fireEvent.error(screen.getByRole('img', { name: 'Redmi Watch' }));

    expect(screen.getByRole('img', { name: 'Redmi Watch' }).tagName).toBe('DIV');
  });
});
