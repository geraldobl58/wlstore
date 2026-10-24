import type {
  Category,
  CategoryNavigation,
  NavigationGroup,
  NavigationLink,
  NavigationPromo,
} from '../types';

const MAX_GROUPS = 6;
const MAX_LINKS = 6;
const MAX_BRANDS = 6;

// Destaques comerciais por categoria raiz (slug). Fixos por enquanto; o lugar
// natural deles é um CMS ou o serviço de promoções, quando existir.
const PROMOS: Record<string, NavigationPromo> = {
  acessorios: {
    tag: 'Semana dos celulares',
    title: 'Até 12% off no Redmi 18 Pro',
    cta: 'Ver oferta',
    href: '/?marca=Xiaomi',
  },
};

const HIGHLIGHTS: NavigationLink[] = [{ label: 'Ofertas', href: '/?ofertas=true' }];

export const categoryHref = (slug: string) => `/?categoria=${encodeURIComponent(slug)}`;

const toLink = (category: Category): NavigationLink => ({
  label: category.title,
  href: categoryHref(category.slug),
});

/**
 * Primeira coluna: filhos diretos sem subcategorias, mais "Ver tudo".
 * Demais colunas: cada filho que tem subcategorias vira uma coluna própria.
 */
export function buildGroups(root: Category): NavigationGroup[] {
  const leaves = root.children.filter((child) => child.children.length === 0);
  const branches = root.children.filter((child) => child.children.length > 0);
  return [
    {
      title: root.title,
      links: [
        ...leaves.slice(0, MAX_LINKS).map(toLink),
        { label: `Ver tudo em ${root.title}`, href: categoryHref(root.slug) },
      ],
    },
    ...branches.slice(0, MAX_GROUPS).map((branch) => ({
      title: branch.title,
      links: branch.children.slice(0, MAX_LINKS).map(toLink),
    })),
  ];
}

/** Marcas distintas, em ordem alfabética, com link filtrado pela categoria. */
export function buildBrandLinks(root: Category, brands: string[]): NavigationLink[] {
  return [...new Set(brands)]
    .sort()
    .slice(0, MAX_BRANDS)
    .map((brand) => ({
      label: brand,
      href: `${categoryHref(root.slug)}&marca=${encodeURIComponent(brand)}`,
    }));
}

/** Monta o menu a partir das categorias raiz e das marcas de cada uma (por slug). */
export function buildCategoryNavigation(
  roots: Category[],
  brandsBySlug: Record<string, string[]>,
): CategoryNavigation {
  return {
    categories: roots.map((root) => ({
      slug: root.slug,
      title: root.title,
      href: categoryHref(root.slug),
      groups: buildGroups(root),
      brands: buildBrandLinks(root, brandsBySlug[root.slug] ?? []),
      promo: PROMOS[root.slug],
    })),
    highlights: HIGHLIGHTS,
  };
}
