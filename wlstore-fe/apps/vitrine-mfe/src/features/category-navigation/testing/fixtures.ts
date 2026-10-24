import type { Category, CategoryNavigation } from '../types';

const leaf = (slug: string, title: string): Category => ({ id: `id-${slug}`, slug, title, children: [] });

/** Árvore no formato do catalog-service: raiz com folhas e com um ramo. */
export const celulares: Category = {
  id: 'id-celulares',
  slug: 'celulares',
  title: 'Celulares',
  children: [
    leaf('smartphones', 'Smartphones'),
    leaf('seminovos', 'Seminovos'),
    {
      id: 'id-acessorios-celular',
      slug: 'acessorios-para-celular',
      title: 'Acessórios para celular',
      children: [leaf('capas', 'Capas e películas'), leaf('cabos', 'Cabos')],
    },
  ],
};

export const notebooks: Category = leaf('notebooks', 'Notebooks');

export const navigation: CategoryNavigation = {
  categories: [
    {
      slug: 'celulares',
      title: 'Celulares',
      href: '/?categoria=celulares',
      groups: [
        {
          title: 'Celulares',
          links: [
            { label: 'Smartphones', href: '/?categoria=smartphones' },
            { label: 'Ver tudo em Celulares', href: '/?categoria=celulares' },
          ],
        },
      ],
      brands: [{ label: 'Xiaomi', href: '/?categoria=celulares&marca=Xiaomi' }],
      promo: {
        tag: 'Semana dos celulares',
        title: 'Até 12% off no Redmi 18 Pro',
        cta: 'Ver oferta',
        href: '/?marca=Xiaomi',
      },
    },
    {
      slug: 'notebooks',
      title: 'Notebooks',
      href: '/?categoria=notebooks',
      groups: [{ title: 'Notebooks', links: [{ label: 'Ver tudo em Notebooks', href: '/?categoria=notebooks' }] }],
      brands: [],
    },
  ],
  highlights: [{ label: 'Ofertas', href: '/?ofertas=true' }],
};
