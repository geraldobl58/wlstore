/**
 * Registro central dos microfrontends.
 *
 * Usado pela barra de navegação entre apps (MicrofrontendNav). Ao criar um
 * novo microfrontend, adicione uma entrada aqui.
 *
 * `basePath` deve ser idêntico ao `basePath` do next.config.js do app (a
 * vitrine, app padrão, usa '/') e ao `ingress.path` do app no repo de infra:
 * é por ele que o Ingress roteia no cluster. Os apps se dividem por área do
 * produto, não por serviço de backend: a vitrine usa catálogo, preço e
 * estoque; o painel é a área do lojista.
 */
export const MICROFRONTENDS = [
  { key: 'vitrine', label: 'Loja', basePath: '/' },
  { key: 'painel', label: 'Painel do lojista', basePath: '/painel' },
] as const;

export type MicrofrontendKey = (typeof MICROFRONTENDS)[number]['key'];
