/**
 * Registro central dos microfrontends.
 *
 * O shell usa este registro para montar a navegação, e cada microfrontend usa
 * o mesmo para se destacar como rota ativa. Ao criar um novo microfrontend,
 * adicione uma entrada aqui — é o único lugar que precisa conhecer todos eles.
 *
 * `basePath` deve ser idêntico ao `basePath` do next.config.js do app
 * correspondente (o shell, como host, usa '/') e ao `ingress.path` do app no
 * repo de infra — é por ele que o Ingress roteia no cluster. Cada microfrontend
 * espelha um serviço de backend (catalog → catalog-service, pricing →
 * pricing-service).
 */
export const MICROFRONTENDS = [
  { key: 'shell', label: 'Home', basePath: '/' },
  { key: 'catalog', label: 'Catálogo', basePath: '/catalog' },
  { key: 'pricing', label: 'Preços', basePath: '/pricing' },
] as const;

export type MicrofrontendKey = (typeof MICROFRONTENDS)[number]['key'];
