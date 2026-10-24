import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoreHeader } from './store-header';

describe('StoreHeader', () => {
  it('sem logo, mostra o monograma e o nome com link para a home', () => {
    render(<StoreHeader storeName="Nova Loja" />);

    const home = screen.getByRole('link', { name: /Nova Loja/ });
    expect(home.getAttribute('href')).toBe('/');
    expect(home.textContent).toContain('NL');
  });

  it('com logo, usa a imagem com o nome da loja como texto alternativo', () => {
    render(<StoreHeader storeName="Nova Loja" logoUrl="https://cdn.loja.com/logo.svg" />);

    expect(screen.getByRole('img', { name: 'Nova Loja' }).getAttribute('src')).toBe('https://cdn.loja.com/logo.svg');
  });

  it('mostra a faixa de aviso só quando informada', () => {
    const { rerender } = render(<StoreHeader storeName="Nova Loja" />);
    expect(screen.queryByText(/Frete grátis/)).toBeNull();

    rerender(<StoreHeader storeName="Nova Loja" announcement="Frete grátis acima de R$ 199" />);
    expect(screen.getByText('Frete grátis acima de R$ 199')).toBeTruthy();
  });

  it('a busca envia por GET para a ação informada com o parâmetro q', () => {
    render(<StoreHeader storeName="Nova Loja" search={{ action: '/', placeholder: 'Buscar produtos' }} />);

    const form = screen.getByRole('search') as HTMLFormElement;
    const input = screen.getByRole('searchbox', { name: 'Buscar na loja' }) as HTMLInputElement;
    expect(form.getAttribute('action')).toBe('/');
    expect(form.getAttribute('method')).toBe('get');
    expect(input.name).toBe('q');
    expect(input.placeholder).toBe('Buscar produtos');
  });

  it('sem busca, não renderiza o formulário', () => {
    render(<StoreHeader storeName="Nova Loja" />);

    expect(screen.queryByRole('search')).toBeNull();
  });

  it('renderiza ações e a linha extra (ex.: menu de categorias) que o app passar', () => {
    render(
      <StoreHeader storeName="Nova Loja" actions={<a href="/conta">Entrar</a>}>
        <nav aria-label="Categorias">menu</nav>
      </StoreHeader>,
    );

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Categorias' })).toBeTruthy();
  });
});
