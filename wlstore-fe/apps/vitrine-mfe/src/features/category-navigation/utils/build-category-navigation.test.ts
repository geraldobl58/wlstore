import { describe, expect, it } from 'vitest';
import { celulares, notebooks } from '../testing/fixtures';
import { buildBrandLinks, buildCategoryNavigation, buildGroups } from './build-category-navigation';

describe('buildGroups', () => {
  it('junta as folhas na coluna da raiz e termina com "Ver tudo"', () => {
    const [first] = buildGroups(celulares);
    expect(first.title).toBe('Celulares');
    expect(first.links.map((link) => link.label)).toEqual([
      'Smartphones',
      'Seminovos',
      'Ver tudo em Celulares',
    ]);
  });

  it('transforma cada filho com subcategorias numa coluna própria', () => {
    const [, branch] = buildGroups(celulares);
    expect(branch).toEqual({
      title: 'Acessórios para celular',
      links: [
        { label: 'Capas e películas', href: '/?categoria=capas' },
        { label: 'Cabos', href: '/?categoria=cabos' },
      ],
    });
  });

  it('categoria sem filhos tem só a coluna com "Ver tudo"', () => {
    expect(buildGroups(notebooks)).toEqual([
      { title: 'Notebooks', links: [{ label: 'Ver tudo em Notebooks', href: '/?categoria=notebooks' }] },
    ]);
  });
});

describe('buildBrandLinks', () => {
  it('remove duplicadas, ordena e codifica a marca no link', () => {
    expect(buildBrandLinks(celulares, ['Xiaomi', 'Apple', 'Xiaomi', 'Dell & Co'])).toEqual([
      { label: 'Apple', href: '/?categoria=celulares&marca=Apple' },
      { label: 'Dell & Co', href: '/?categoria=celulares&marca=Dell%20%26%20Co' },
      { label: 'Xiaomi', href: '/?categoria=celulares&marca=Xiaomi' },
    ]);
  });

  it('limita a 6 marcas', () => {
    const brands = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    expect(buildBrandLinks(celulares, brands)).toHaveLength(6);
  });
});

describe('buildCategoryNavigation', () => {
  it('monta uma entrada por raiz, com marcas por slug e destaques', () => {
    const result = buildCategoryNavigation([celulares, notebooks], { celulares: ['Xiaomi'] });

    expect(result.categories.map((category) => category.slug)).toEqual(['celulares', 'notebooks']);
    expect(result.categories[0].brands).toEqual([
      { label: 'Xiaomi', href: '/?categoria=celulares&marca=Xiaomi' },
    ]);
    expect(result.categories[1].brands).toEqual([]);
    expect(result.highlights).toEqual([{ label: 'Ofertas', href: '/?ofertas=true' }]);
  });

  it('só inclui promoção para slugs configurados', () => {
    const result = buildCategoryNavigation([notebooks], {});
    expect(result.categories[0].promo).toBeUndefined();
  });
});
