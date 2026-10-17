/**
 * Registro central dos microfrontends.
 *
 * O shell usa este registro para montar a navegação, e cada microfrontend usa
 * o mesmo para se destacar como rota ativa. Ao criar um novo microfrontend,
 * adicione uma entrada aqui — é o único lugar que precisa conhecer todos eles.
 *
 * `basePath` deve ser idêntico ao `basePath` do next.config.js do app
 * correspondente (o shell, como host, usa '/').
 */
export const MICROFRONTENDS = [
  { key: 'shell', label: 'Home', basePath: '/' },
  { key: 'blog', label: 'Blog', basePath: '/blog' },
] as const;

export type MicrofrontendKey = (typeof MICROFRONTENDS)[number]['key'];
